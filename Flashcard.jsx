import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBookOpen, FaArrowRight, FaArrowLeft, FaSyncAlt, 
  FaSignInAlt, FaPlus, FaMagic, FaSpinner 
} from 'react-icons/fa';

function Flashcard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [inputSummary, setInputSummary] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    if (user) {
      const passedSummary = location.state?.inputSummary;
      if (passedSummary) {
        setInputSummary(passedSummary);
        setShowInput(true);
      }
    } else {
      setFlashcards([
        { question: 'What is JSX?', answer: 'JSX is a syntax extension for JavaScript used with React.' },
        { question: 'What is useState?', answer: 'A React hook that allows you to add state to functional components.' },
        { question: 'What is a component in React?', answer: 'Components are reusable pieces of UI built as functions or classes.' },
      ]);
    }
  }, [location.state]);

  const generateFlashcardsFromSummary = (summaryText) => {
    setIsGenerating(true);
    try {
      const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const cards = [];
      
      sentences.forEach((sentence, i) => {
        const trimmed = sentence.trim();
        if (!trimmed) return;
        
        if (i % 3 === 0) {
          cards.push({ 
            question: `Explain: "${trimmed.substring(0, 50)}..."`, 
            answer: trimmed 
          });
        } else if (i % 3 === 1) {
          const words = trimmed.split(' ');
          if (words.length > 5) {
            const mid = Math.floor(words.length / 2);
            const missing = words[mid];
            const questionText = words.map((w, j) => j === mid ? '______' : w).join(' ');
            cards.push({ 
              question: `Fill in the blank: ${questionText}`, 
              answer: `Missing word: ${missing}. Full sentence: ${trimmed}` 
            });
          } else {
            cards.push({ 
              question: `What does this mean: "${trimmed}"?`, 
              answer: trimmed 
            });
          }
        } else {
          cards.push({ 
            question: `True or False: ${trimmed}`, 
            answer: `True. Explanation: ${trimmed}` 
          });
        }
      });
      
      const finalCards = cards.length ? cards : [{ 
        question: 'What is the main content of this summary?', 
        answer: summaryText 
      }];
      
      setFlashcards(finalCards);
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
      alert('Error generating flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);
  const handleNext = () => { 
    setIsFlipped(false); 
    setCurrentCard((c) => (c + 1) % flashcards.length); 
  };
  const handlePrev = () => { 
    setIsFlipped(false); 
    setCurrentCard((c) => (c - 1 + flashcards.length) % flashcards.length); 
  };

  const handleGenerateClick = () => { 
    if (inputSummary.trim()) {
      generateFlashcardsFromSummary(inputSummary.trim());
    } else {
      alert('Please enter a summary to generate flashcards!'); 
    }
  };

  const { question, answer } = flashcards[currentCard] || {};

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-12 font-mono flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-3 text-center mt-11">
        <FaBookOpen /> AI Flashcard Generator
      </h1>

      {isGenerating && (
        <div className="mb-6 flex items-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin"/> Generating flashcards...
        </div>
      )}

      {isLoggedIn ? (
        <>
          {showInput ? (
            <div className="w-full max-w-2xl mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your summary here:
                </label>
                <textarea 
                  value={inputSummary} 
                  onChange={e => setInputSummary(e.target.value)}
                  placeholder="Paste your pre-made summary here to generate flashcards directly..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tip: Make sure your summary contains clear, complete sentences for better flashcard generation.
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleGenerateClick} 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  disabled={isGenerating}
                >
                  <FaMagic /> Generate Flashcards
                </button>
                <button 
                  onClick={() => {setShowInput(false); setInputSummary('');}} 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="mb-8 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex justify-center items-center gap-2 transition-colors"
            >
              <FaPlus /> Generate New Flashcards
            </button>
          )}
        </>
      ) : (
        <p className="mb-8 text-gray-600 text-sm text-center max-w-md">
          Login to generate your own flashcards from summaries. Demo cards shown below:
        </p>
      )}

      {flashcards.length > 0 && (
        <>
          <div className="mb-4 text-gray-600">
            Card {currentCard + 1} of {flashcards.length}
          </div>

          <div 
            onClick={handleFlip} 
            className="w-full max-w-xl h-64 md:h-72 bg-white shadow-xl rounded-2xl border flex items-center justify-center text-center px-6 py-4 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="text-lg md:text-xl font-medium leading-relaxed">
              {isFlipped ? answer : question}
            </div>
          </div>

          <div className="flex gap-4 mt-10 flex-wrap justify-center">
            <button 
              onClick={handlePrev} 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md w-24 flex items-center justify-center gap-2 transition-colors"
            >
              <FaArrowLeft /> Prev
            </button>
            <button 
              onClick={handleFlip} 
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md w-24 flex items-center justify-center gap-2 transition-colors"
            >
              <FaSyncAlt /> Flip
            </button>
            <button 
              onClick={handleNext} 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md w-24 flex items-center justify-center gap-2 transition-colors"
            >
              Next <FaArrowRight />
            </button>
          </div>
        </>
      )}

      {!isLoggedIn && (
        <button 
          onClick={() => navigate("/login", {replace: true})} 
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors duration-200 mt-10"
        >
          <FaSignInAlt /> Login for More
        </button>
      )}
    </div>
  );
}

export default Flashcard;