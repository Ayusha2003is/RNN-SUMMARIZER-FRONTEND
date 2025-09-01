import os
import pickle
import traceback
import numpy as np
import math
import re
from model_classes import (
    ImprovedRNNEncoder,
    ImprovedExtractiveRNNSummarizer,
    ImprovedSentenceEncoder,
    ImprovedBinaryClassifier,
    TextPreprocessor,
    split_into_sentences
)

print("=== DIAGNOSTIC LOADSUMMARIZER VERSION ===")


POSSIBLE_MODEL_PATHS = [
    r"C:\Users\Ayusha\notesy\backend\SummarizationModel\improved_rnn_model.pkl",
    r"C:\Users\Ayusha\notesy\backend\SummarizationModel\fast_extractive_model.pkl",
    "improved_rnn_model.pkl",
    "fast_extractive_model.pkl"
]

_model = None
_preprocessor = None
_model_loaded = False


class DummyModel:
    def forward(self, sentences_indices, training=False):
        return np.ones(len(sentences_indices)), None

class DummyPreprocessor:
    def text_to_indices(self, text):
        return [1, 2, 3]  # arbitrary dummy indices


def calculate_dynamic_summary_length(text):

    word_count = len(text.split())
    
    sentences = split_into_sentences(text)
    sentence_count = len(sentences)

    if sentence_count <= 5:
        if sentence_count <= 2:
            return 1 
        elif sentence_count <= 3:
            return 1
        elif sentence_count <= 4:
            return 2   
        else:  
            return 2  

    target_summary_words = max(10, word_count // 4)

  
    avg_words_per_sentence = 12
    target_sentences = max(1, target_summary_words // avg_words_per_sentence)

  
    if word_count >= 300: 
        target_sentences = max(target_sentences, word_count // 50)
    elif word_count >= 100:  
        target_sentences = max(target_sentences, word_count // 40)
    else: 
        target_sentences = max(1, word_count // 20)

    min_sentences = 1
    max_sentences = min(20, max(2, word_count // 30))

    dynamic_length = max(min_sentences, min(target_sentences, max_sentences))

    return dynamic_length


def find_model_file():
    for path in POSSIBLE_MODEL_PATHS:
        if os.path.exists(path):
            print(f"Found model file at: {path}")
            return path
    return None

def load_model(force_dummy=False):
    global _model, _preprocessor, _model_loaded
    if _model_loaded and _model and _preprocessor:
        return _model, _preprocessor
    try:
        if force_dummy:
            _model = DummyModel()
            _preprocessor = DummyPreprocessor()
            _model_loaded = True
            return _model, _preprocessor

        model_path = find_model_file()
        if not model_path:
            print("No model file found, using dummy fallback")
            return load_model(force_dummy=True)

        with open(model_path, "rb") as f:
            data = pickle.load(f)

        if isinstance(data, dict):
            if 'model' in data and 'preprocessor' in data:
                _model = data['model']
                _preprocessor = data['preprocessor']
            elif 'config' in data and 'model_params' in data and 'preprocessor' in data:
                config = data['config']
                model_params = data['model_params']
                _preprocessor = data['preprocessor']
                _model = ImprovedExtractiveRNNSummarizer(**config)
                try:
                    if 'word_encoder' in model_params:
                        we = model_params['word_encoder']
                        _model.word_encoder.embedding = we.get('embedding', _model.word_encoder.embedding)
                        _model.word_encoder.W_ih = we.get('W_ih', _model.word_encoder.W_ih)
                        _model.word_encoder.W_hh = we.get('W_hh', _model.word_encoder.W_hh)
                        _model.word_encoder.b_h = we.get('b_h', _model.word_encoder.b_h)
                    if 'sentence_encoder' in model_params:
                        se = model_params['sentence_encoder']
                        _model.sentence_encoder.W_ih_sent = se.get('W_ih_sent', _model.sentence_encoder.W_ih_sent)
                        _model.sentence_encoder.W_hh_sent = se.get('W_hh_sent', _model.sentence_encoder.W_hh_sent)
                        _model.sentence_encoder.b_h_sent = se.get('b_h_sent', _model.sentence_encoder.b_h_sent)
                    if 'classifier' in model_params:
                        cl = model_params['classifier']
                        _model.classifier.W_class = cl.get('W_class', _model.classifier.W_class)
                        _model.classifier.b_class = cl.get('b_class', _model.classifier.b_class)
                except Exception as e:
                    print(f"Error loading parameters: {e}")
        else:
            print("Pickle file is not a dictionary, using dummy fallback")
            return load_model(force_dummy=True)

        _model_loaded = True
        return _model, _preprocessor
    except Exception as e:
        print(f"ERROR in load_model: {e}")
        print(traceback.format_exc())
        return load_model(force_dummy=True)



def generate_summary(model, article, preprocessor, max_sentences=3, threshold=0.3):
    """Fixed version that avoids sequential sentence selection bias"""
    import numpy as np
    import math
    import re
    
    print("=== DEBUGGING SUMMARY GENERATION ===")
    
    sentences_text = split_into_sentences(article)
    total_sentences = len(sentences_text)
    print(f"1. Split into {total_sentences} sentences")
    
    if total_sentences == 0:
        return "No sentences found."
    
    # Convert to indices
    sentences_indices = [preprocessor.text_to_indices(sent) for sent in sentences_text]
    valid_pairs = [(s, idx) for s, idx in zip(sentences_text, sentences_indices) if len(idx) > 2]
    
    if not valid_pairs:
        print("2. No valid sentence pairs found - using fallback")
        return sentences_text[0] if sentences_text else "No valid sentences."
    
    valid_sentences, valid_indices = zip(*valid_pairs)
    print(f"2. {len(valid_sentences)} valid sentences after filtering")
    
    # Get model predictions
    try:
        probabilities, forward_data = model.forward(list(valid_indices), training=False)
        print(f"3. Model predictions: {probabilities}")
        print(f"   Min: {np.min(probabilities):.4f}, Max: {np.max(probabilities):.4f}")
        print(f"   Std: {np.std(probabilities):.4f}")
        
        # Check if probabilities are flat (indicating model issue)
        if np.std(probabilities) < 0.01:
            print("   WARNING: Probabilities are nearly flat - model may not be trained properly")
        
    except Exception as e:
        print(f"3. Model forward pass failed: {e}")
        probabilities = np.ones(len(valid_sentences)) * 0.5
    
    probabilities = np.array(probabilities, dtype=float)
    
    # FIXED: Apply position weights more carefully
    num_sentences = len(probabilities)
    position_weights = np.ones(num_sentences)
    
    print(f"4. Before position weighting: {probabilities}")
    
    # Modified position weighting logic
    if num_sentences > 10:
        intro_penalty = 0.8
        conclusion_boost = 1.3
        middle_boost = 1.1
        intro_end = max(1, int(num_sentences * 0.15))
        
        for i in range(intro_end):
            position_weights[i] = intro_penalty + (i / intro_end) * 0.2
        
        conclusion_start = int(num_sentences * 0.85)
        for i in range(conclusion_start, num_sentences):
            position_weights[i] = conclusion_boost
            
        for i in range(intro_end, conclusion_start):
            position_weights[i] = middle_boost
    else:
        # FIXED: Remove the harsh penalty for early sentences
        # Instead of penalizing first sentences, use gentle position hints
        if num_sentences > 3:
            # Very slight boost for middle and later sentences
            middle_start = num_sentences // 3
            for i in range(middle_start, num_sentences):
                position_weights[i] = 1.05  # Very gentle boost instead of harsh penalty
        # For very small documents (<=3 sentences), keep all weights equal
    
    print(f"   Position weights: {position_weights}")
    
    debiased_probs = probabilities * position_weights
    print(f"5. After position weighting: {debiased_probs}")
    
    # FIXED: Use improved selection logic that promotes diversity
    selected_indices = improved_sentence_selection(
        debiased_probs, 
        valid_sentences, 
        max_sentences, 
        diversity_weight=0.4
    )
    
    print(f"6. Selected indices with diversity consideration: {selected_indices}")
    
    final_indices = sorted(list(selected_indices))
    summary_sentences = [valid_sentences[i] for i in final_indices if i < len(valid_sentences)]
    
    print(f"7. Final selected indices: {final_indices}")
    print(f"8. Selected sentences:")
    for i, sent in enumerate(summary_sentences):
        print(f"   {i+1}. {sent}")
    
    summary = '. '.join(summary_sentences)
    if not summary.endswith('.'):
        summary += '.'
    
    return summary


def improved_sentence_selection(probabilities, sentences, max_sentences=3, diversity_weight=0.4):
    """Select sentences with diversity consideration to avoid sequential bias"""
    import numpy as np
    
    if len(probabilities) <= max_sentences:
        return list(range(len(probabilities)))
    
    selected = []
    remaining = list(range(len(probabilities)))
    
    # Always start with the highest probability sentence
    best_idx = np.argmax(probabilities)
    selected.append(best_idx)
    remaining.remove(best_idx)
    
    print(f"   Starting with highest prob sentence {best_idx}: prob={probabilities[best_idx]:.3f}")
    
    # For remaining selections, balance probability and diversity
    while len(selected) < max_sentences and remaining:
        scores = []
        
        for idx in remaining:
            prob_score = probabilities[idx]
            
            # Diversity penalty: penalize sentences too close to already selected
            diversity_penalty = 0
            for sel_idx in selected:
                distance = abs(idx - sel_idx)
                if distance <= 1:  # Adjacent sentences
                    diversity_penalty += 0.6
                elif distance <= 2:  # Very close sentences  
                    diversity_penalty += 0.3
                elif distance <= 3:  # Close sentences
                    diversity_penalty += 0.1
            
            final_score = prob_score - (diversity_weight * diversity_penalty)
            scores.append((idx, final_score, prob_score, diversity_penalty))
        
        # Debug output for top candidates
        print(f"   Remaining candidates:")
        for idx, final_score, prob_score, penalty in sorted(scores, key=lambda x: x[1], reverse=True)[:3]:
            print(f"     Sentence {idx}: prob={prob_score:.3f}, penalty={penalty:.3f}, final={final_score:.3f}")
        
        # Select best remaining sentence
        best_remaining = max(scores, key=lambda x: x[1])
        selected.append(best_remaining[0])
        remaining.remove(best_remaining[0])
        print(f"   Selected sentence {best_remaining[0]} with final score {best_remaining[1]:.3f}")
    
    return sorted(selected)


# Alternative clustering-based selection for maximum diversity
def clustering_based_selection(probabilities, sentences, max_sentences=3):
    """Select sentences using clustering approach for maximum diversity"""
    import numpy as np
    
    if len(probabilities) <= max_sentences:
        return list(range(len(probabilities)))
    
    # Sort by probability to get good candidates
    sorted_indices = sorted(range(len(probabilities)), key=lambda i: probabilities[i], reverse=True)
    
    # Take top candidates (more than we need)
    top_candidates = sorted_indices[:min(max_sentences * 3, len(sorted_indices))]
    
    if len(top_candidates) <= max_sentences:
        return sorted(top_candidates)
    
    # Select diverse sentences from top candidates
    selected = [top_candidates[0]]  # Always include the best
    
    for _ in range(max_sentences - 1):
        best_candidate = None
        best_min_distance = 0
        
        for candidate in top_candidates:
            if candidate in selected:
                continue
            
            # Find minimum distance to any selected sentence
            min_distance = min(abs(candidate - sel) for sel in selected)
            
            # Prefer candidates with larger minimum distance and higher probability
            combined_score = min_distance + probabilities[candidate] * 0.5
            
            if combined_score > best_min_distance:
                best_min_distance = combined_score
                best_candidate = candidate
        
        if best_candidate is not None:
            selected.append(best_candidate)
        else:
            # Fallback: just take next best candidate
            for candidate in top_candidates:
                if candidate not in selected:
                    selected.append(candidate)
                    break
    
    return sorted(selected)

def summarize_frontend_input(article_text, max_sentences=None, threshold=0.3):
    
    try:
      
        if max_sentences is None:
            max_sentences = calculate_dynamic_summary_length(article_text)
            print(f"Dynamic summary length calculated: {max_sentences} sentences for {len(article_text.split())} words")

        model, preprocessor = load_model()
        summary = generate_summary(model, article_text, preprocessor, max_sentences, threshold)
        return summary
    except Exception as e:
        print(f"Error: {e}")
        
        if max_sentences is None:
            max_sentences = calculate_dynamic_summary_length(article_text)
        sentences = [s.strip() for s in article_text.split('.') if s.strip()]
        return '. '.join(sentences[:max_sentences]) + '.'

def get_model_status():
    return {
        'model_loaded': _model_loaded,
        'model_available': _model is not None,
        'preprocessor_available': _preprocessor is not None,
        'model_type': type(_model).__name__ if _model else None,
        'preprocessor_type': type(_preprocessor).__name__ if _preprocessor else None
    }


model, preprocessor = load_model()