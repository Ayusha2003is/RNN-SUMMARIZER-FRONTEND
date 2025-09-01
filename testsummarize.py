# test_model_load.py
import pickle
import os
from model_classes import ImprovedRNNEncoder, ImprovedExtractiveRNNSummarizer, TextPreprocessor

MODEL_PATH = r"C:\Users\Ayusha\notesy\backend\SummarizationModel\improved_rnn_model.pkl"

# Load model
with open(MODEL_PATH, "rb") as f:
    data = pickle.load(f)

if 'model' in data and 'preprocessor' in data:
    model = data['model']
    preprocessor = data['preprocessor']
else:
    print("Pickle file does not contain expected keys")
    model, preprocessor = None, None

# Check objects
print("Model object:", model)
print("Model vocab size:", getattr(model, 'vocab_size', None))
print("Preprocessor vocab length:", len(preprocessor.vocab) if hasattr(preprocessor, 'vocab') else "No vocab")

# Test forward pass on dummy text
dummy_text = "This is a test sentence. It should be converted to indices and get probabilities."
indices = [preprocessor.text_to_indices(s) for s in dummy_text.split('. ') if s.strip()]
print("Sentence indices:", indices)

if model:
    probs, _ = model.forward(indices, training=False)
    print("Model probabilities:", probs)
