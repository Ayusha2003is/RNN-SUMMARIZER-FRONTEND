import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaQuestionCircle } from 'react-icons/fa';

function Quiz() {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center px-6 py-12 font-['mono']">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3 text-center">
        <FaQuestionCircle className="text-gray-800" />
        Smart Quiz
      </h1>
      <p className="text-gray-600 text-lg mb-10 text-center">
        Generate personalized quizzes from your study notes.
      </p>

      {/* Quiz Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl w-full border border-gray-200 transition-all duration-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaQuestionCircle className="text-gray-700" /> Q1: What is React?
        </h2>
        <ul className="space-y-5 text-left text-gray-800">
          {[
            'A CSS Framework',
            'A Database System',
            'A JavaScript Library for building UIs',
            'An Operating System',
          ].map((option, index) => (
            <li key={index}>
              <label className="flex items-center space-x-3 hover:bg-gray-100 p-3 rounded-md cursor-pointer transition">
                <input type="radio" name="q1" className="accent-gray-800" />
                <span>{option}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLoginRedirect}
        className="mt-8 flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md transition-colors duration-200"
      >
        <FaSignInAlt /> Login for More
      </button>
    </div>
  );
}

export default Quiz;