import sys
import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

# Fix the path to SummarizationModel directory
current_file_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_file_dir) if 'Flask' in current_file_dir else current_file_dir
summarization_dir = os.path.join(backend_dir, 'SummarizationModel')

if summarization_dir not in sys.path:
    sys.path.insert(0, summarization_dir)

from model_classes import (
    ImprovedRNNEncoder,
    ImprovedExtractiveRNNSummarizer,
    ImprovedSentenceEncoder,
    ImprovedBinaryClassifier,
    TextPreprocessor
)
from LoadSummarizer import load_model, generate_summary

try:
    from LoadSummarizer import calculate_dynamic_summary_length
except ImportError:
    def calculate_dynamic_summary_length(text):
        from model_classes import split_into_sentences
        word_count = len(text.split())
        sentences = split_into_sentences(text)
        sentence_count = len(sentences)
        target_summary_words = max(10, word_count // 4)
        avg_words_per_sentence = 12
        target_sentences = max(1, target_summary_words // avg_words_per_sentence)
        min_sentences = 1
        max_sentences = min(20, max(2, word_count // 30))
        return max(min_sentences, min(target_sentences, max_sentences))

# App Initialization
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"], supports_credentials=True)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mydb.sqlite3')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwtsecret')

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Database & Auth Setup
try:
    from models import db
    db.init_app(app)

    from auth import auth, set_bcrypt_instance
    set_bcrypt_instance(bcrypt)
    app.register_blueprint(auth, url_prefix="/auth")

    with app.app_context():
        db.create_all()
    DB_AVAILABLE = True
except Exception as e:
    print(f"Warning: Database setup failed: {e}")
    DB_AVAILABLE = False

# Summarization Model Setup
model, preprocessor = None, None
MODEL_AVAILABLE = False

try:
    model, preprocessor = load_model()
    if model is not None and preprocessor is not None:
        MODEL_AVAILABLE = True
except Exception as e:
    print(f"Model loading failed: {e}")
    print(traceback.format_exc())

# Routes
@app.route('/summarize', methods=['POST'])
def summarize_text():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        max_sentences = data.get('max_sentences')
        threshold = data.get('threshold', 0.3)
        
        if max_sentences is None:
            max_sentences = calculate_dynamic_summary_length(text)
        
        if MODEL_AVAILABLE and model and preprocessor:
            try:
                summary = generate_summary(model, text, preprocessor, max_sentences, threshold)
                model_used = 'trained'
            except Exception:
                sentences = [s.strip() for s in text.split('.') if s.strip()]
                summary = '. '.join(sentences[:max_sentences]) + '.' if len(sentences) > max_sentences else text
                model_used = 'fallback_after_error'
        else:
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            summary = '. '.join(sentences[:max_sentences]) + '.' if len(sentences) > max_sentences else text
            model_used = 'fallback'
        
        if not summary or len(summary.strip()) == 0:
            summary = text[:200] + "..." if len(text) > 200 else text
            model_used += '_emergency_fallback'
        
        return jsonify({
            'summary': summary.strip(),
            'model_used': model_used,
            'status': 'success',
            'original_length': len(text),
            'summary_length': len(summary.strip()),
            'sentences_used': max_sentences
        })
        
    except Exception as e:
        print("Error in /summarize:", traceback.format_exc())
        return jsonify({
            'error': str(e), 
            'status': 'error',
            'message': 'An unexpected error occurred during summarization'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        health_status = {
            'status': 'healthy',
            'model_available': MODEL_AVAILABLE,
            'model_loaded': model is not None,
            'preprocessor_loaded': preprocessor is not None,
            'database_available': DB_AVAILABLE
        }
        return jsonify(health_status)
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    try:
        info = {
            'model_available': MODEL_AVAILABLE,
            'model_loaded': model is not None,
            'preprocessor_loaded': preprocessor is not None,
            'model_type': type(model).__name__ if model else None,
            'preprocessor_type': type(preprocessor).__name__ if preprocessor else None,
        }
        if model:
            info['vocab_size'] = getattr(model, 'vocab_size', 'unknown')
            info['embed_dim'] = getattr(model, 'embed_dim', 'unknown')
            info['hidden_dim'] = getattr(model, 'hidden_dim', 'unknown')
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "Request too large"}), 413

if __name__ == "__main__":
    print("=" * 50)
    print("FLASK SERVER STARTUP SUMMARY")
    print("=" * 50)
    print(f"Database Available: {DB_AVAILABLE}")
    print(f"Model Available: {MODEL_AVAILABLE}")
    print(f"Model Loaded: {model is not None}")
    print(f"Preprocessor Loaded: {preprocessor is not None}")
    print("=" * 50)
    print("Starting Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5000)
