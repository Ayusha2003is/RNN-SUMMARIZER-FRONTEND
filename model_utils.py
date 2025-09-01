import os
import sys
import pickle
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, ".."))

MODEL_PATH = r"C:\Users\Ayusha\notesy\backend\SummarizationModel\fast_extractive_model.pkl"

try:
    from SummarizationModel.model_classes import (
        ImprovedRNNEncoder,
        ImprovedSentenceEncoder,
        ImprovedExtractiveRNNSummarizer,
        split_into_sentences,
    )
    IMPORT_SUCCESS = True
    print("Successfully imported SummarizationModel classes")
except Exception as e:
    print(f"Warning: Could not import model classes: {e}")
    IMPORT_SUCCESS = False

    def split_into_sentences(text):
        return [s.strip() for s in text.split('.') if s.strip()]

class RedirectUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == "__main__":
            module = "SummarizationModel.model_classes"
        return super().find_class(module, name)

def load_pickle_model(path):
    with open(path, "rb") as f:
        return RedirectUnpickler(f).load()

def load_model(model_path=MODEL_PATH):
    try:
        print(f"Loading model from: {model_path}")
        if not os.path.exists(model_path):
            print("Model file not found at the specified path!")
            return None, None

        model_data = load_pickle_model(model_path)
        if isinstance(model_data, tuple) and len(model_data) == 2:
            model, preprocessor = model_data
            print("Model loaded successfully!")
            return model, preprocessor
        else:
            print("Pickle file did not contain (model, preprocessor)")
            return None, None

    except Exception as e:
        print(f"Error loading model: {e}")
        print("Traceback:", traceback.format_exc())
        return None, None

def create_fallback_summary(text, max_sentences=3):
    try:
        sentences = split_into_sentences(text) if IMPORT_SUCCESS else [
            s.strip() for s in text.split('.') if s.strip()
        ]
        if len(sentences) <= max_sentences:
            return text.strip()
        return '. '.join(sentences[:max_sentences]) + '.'
    except Exception:
        return text[:200] + "..." if len(text) > 200 else text

def generate_summary_safe(model, preprocessor, text, max_sentences=3, threshold=0.5):
    try:
        if model is None or preprocessor is None:
            print("Model or preprocessor is None, using fallback summary")
            return create_fallback_summary(text, max_sentences)

        if hasattr(model, "generate_summary"):
            summary = model.generate_summary(text, preprocessor, max_sentences, threshold)
        else:
            from SummarizationModel import LoadSummarizer
            summary = LoadSummarizer.generate_summary(model, text, preprocessor, max_sentences, threshold)

        if not summary or not summary.strip():
            print("Model returned empty summary, using fallback")
            return create_fallback_summary(text, max_sentences)

        return summary.strip()

    except Exception as e:
        print(f"Error in summary generation: {e}")
        print(traceback.format_exc())
        return create_fallback_summary(text, max_sentences)

if __name__ == "__main__":
    print("=== Testing model_utils.py ===")
    model, preprocessor = load_model()
    print(f"Model loaded: {model is not None}")
    print(f"Preprocessor loaded: {preprocessor is not None}")

    test_text = (
        "This is a test document. It has multiple sentences. "
        "We want to see if the model works correctly. "
        "This should be summarized properly. Additional content for testing."
    )
    summary = generate_summary_safe(model, preprocessor, test_text)
    print(f"Test summary: {summary}")
