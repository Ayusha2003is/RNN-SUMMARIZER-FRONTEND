import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqData = [
  {
    question: "What is Notesy?",
    answer: "Notesy is an AI-powered summarization and study assistant that helps students generate notes, and flashcards from academic content."
  },
  {
    question: "What file formats can I upload?",
    answer: "You can upload .txt and .docx  files to generate summaries or study materials."
  },
  {
    question: "Do I need to log in to use Notesy?",
    answer: "You can use the summarizer without logging in. However, to generate MCQs or flashcards and to upload documents, you need to log in."
  },
  {
    question: "How are summaries generated?",
    answer: "Notesy uses a custom RNN-based  model to generate from input text."
  },
  {
    question: "Is my data stored permanently?",
    answer: "No, uploaded files are temporarily used for processing and are not stored permanently unless you save them manually."
  },
  {
    question: "Can I edit the generated notes?",
    answer: "Yes! You can copy and edit the output summaries directly on the interface."
  },
  {
    question: "Is Notesy free to use?",
    answer: "Yes, Notesy is currently free. In the future, premium features may be introduced."
  },
  {
    question: "Can Notesy create Flashcards for handwritten notes?",
    answer: "If you scan and convert handwritten notes into readable text (OCR), you can use them as input to generate Flashcards."
  }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(prevIndex => (prevIndex === index ? null : index));
  };

  return (
    <section className="py-16 px-6 md:px-10 bg-gray-50 text-gray-800 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <span className="text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Find answers to common questions about Notesy and how it can help improve your studies.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 ${
                  isOpen ? 'shadow-md border-blue-300' : 'hover:shadow-md hover:border-blue-200'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <h3
                    className={`text-lg transition-colors duration-200 ${
                      isOpen ? 'text-blue-600 font-semibold' : 'text-gray-900'
                    }`}
                  >
                    {faq.question}
                  </h3>
                  <div className={`ml-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-500'}`}>
                    {isOpen ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-gray-700 text-sm leading-relaxed border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default React.memo(FAQ);
