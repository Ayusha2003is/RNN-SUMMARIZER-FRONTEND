import React, { useState } from "react";
import { MdSummarize } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaFileUpload, FaLayerGroup, FaLock } from "react-icons/fa";
import mammoth from "mammoth";

const API_URL = "http://127.0.0.1:5000";

function InputSection({ onGenerate, isLoggedIn = false }) {
  const [inputText, setInputText] = useState("");
  const [fileError, setFileError] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const navigate = useNavigate();

  const WORD_LIMIT = isLoggedIn ? 1000 : 500;
  const calculateWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    const count = calculateWordCount(text);
    setWordCount(count);

    if (count <= WORD_LIMIT) {
      setInputText(text);
      setFileError("");
    } else {
      setFileError(
        `Text exceeds ${WORD_LIMIT.toLocaleString()} words.`
      );
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isLoggedIn) {
      setFileError("Please log in to upload files.");
      return;
    }

    const isValidType = file.name.endsWith(".docx");
    const isValidSize = file.size <= 2 * 1024 * 1024;
    if (!isValidType) {
      setFileError("Only .docx files are allowed.");
      return;
    }
    if (!isValidSize) {
      setFileError("File must be 2MB or less.");
      return;
    }

    setIsProcessingFile(true);
    setFileError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = result.value;

      if (!extractedText.trim()) {
        setFileError("No text content found in the document.");
        setIsProcessingFile(false);
        return;
      }

      const count = calculateWordCount(extractedText);
      if (count > WORD_LIMIT) {
        setFileError(
          `Extracted text exceeds ${WORD_LIMIT.toLocaleString()} words. Please use a smaller document.`
        );
        setIsProcessingFile(false);
        return;
      }

      setWordCount(count);
      setInputText(extractedText);
      setFileError("");
    } catch (error) {
      console.error("Error processing DOCX file:", error);
      setFileError(
        "Failed to process the DOCX file. Please ensure it's a valid document."
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok)
        throw new Error(`Server responded with status ${response.status}`);

      const data = await response.json();
      if (data.summary) {
        onGenerate(data.summary);
        setFileError("");
      } else {
        onGenerate("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Request failed:", error);
      onGenerate("Error connecting to server.");
      setFileError(
        "Could not reach the backend. Make sure the Flask server is running and CORS is enabled."
      );
    }
  };

  const handleFlashcard = () => {
    if (!isLoggedIn) {
      setFileError("Please log in to access flashcard generation.");
      return;
    }
    navigate("/flashcards");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isLoggedIn) {
      setFileError("Please log in to upload files.");
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileChange({ target: { files: [file] } });
    }
  };

  const progressPercentage = (wordCount / WORD_LIMIT) * 100;

  const buttons = [
    {
      onClick: handleGenerate,
      icon: MdSummarize,
      text: "Summarize",
      color: "emerald",
      disabled: !inputText.trim() || wordCount > WORD_LIMIT, // Always available regardless of login
      description: "Generate AI-powered summaries",
    },
    {
      onClick: handleFlashcard,
      icon: FaLayerGroup,
      text: "Generate Flashcard",
      color: "violet",
      disabled: !inputText.trim() || !isLoggedIn, // Requires login
      description: "Build study flashcards",
    },
  ];
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      
      {/* Header */}
      <div className="border-b border-stone-100 bg-gradient-to-r from-slate-50/50 to-stone-50/50 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              Content Input
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Import your text or documents to begin processing
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-100 to-stone-200 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </div>

      <div className="p-8">
        
        {/* Textarea section */}
        <div className="relative mb-6">
          {/* Drag and drop overlay - only show for logged in users */}
          {isDragging && isLoggedIn && (
            <div className="absolute inset-0 bg-blue-50/80 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center z-10">
              <div className="text-center">
                <FaFileUpload className="mx-auto text-2xl text-blue-500 mb-2" />
                <p className="text-blue-700 font-medium text-sm">Drop your DOCX file here</p>
              </div>
            </div>
          )}
          
          <textarea
            rows="10"
            className="w-full bg-slate-50/50 border border-stone-200 rounded-xl p-6 resize-none text-slate-700 placeholder-slate-400 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200"
            placeholder={isLoggedIn ? "Paste your content here or drag and drop a DOCX file..." : "Paste your content here..."}
            value={inputText}
            onChange={handleInputChange}
            onDragOver={isLoggedIn ? handleDragOver : undefined}
            onDragLeave={isLoggedIn ? handleDragLeave : undefined}
            onDrop={isLoggedIn ? handleDrop : undefined}
          />
        </div>

        {/* Word count and progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
              Word Count
            </span>
            <span className="text-sm text-slate-500 tabular-nums">
              {wordCount.toLocaleString()} / {WORD_LIMIT.toLocaleString()}
            </span>
          </div>
          
          <div className="relative h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                progressPercentage > 90 
                  ? 'bg-red-400' 
                  : progressPercentage > 70
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {fileError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{fileError}</p>
          </div>
        )}

        {/* File upload */}
        <div className="mb-8">
          <label className="group relative block">
            <div className="flex items-center gap-3 p-4 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200">
              <FaFileUpload className="text-stone-400 group-hover:text-emerald-600 transition-colors duration-200" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">
                Upload DOCX File
              </span>
              <span className="ml-auto text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                Max 2MB
              </span>
            </div>
            <input 
              type="file" 
              accept=".docx" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={!isLoggedIn || isProcessingFile}
            />
          </label>
        </div>

        {/* Action buttons */}
        <div className="border-t border-stone-100 pt-6">
          <div className="flex flex-wrap gap-3 justify-end">
            {buttons.map((button, index) => {
              const Icon = button.icon;
              const isDisabled = button.disabled;
              const colorClasses = {
                emerald: {
                  enabled: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                  disabled: 'bg-stone-100 text-stone-400'
                },
                blue: {
                  enabled: 'bg-blue-600 hover:bg-blue-700 text-white',
                  disabled: 'bg-stone-100 text-stone-400'
                },
                violet: {
                  enabled: 'bg-violet-600 hover:bg-violet-700 text-white',
                  disabled: 'bg-stone-100 text-stone-400'
                }
              };
              
              return (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => setHoveredButton(index)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <button
                    onClick={button.onClick}
                    disabled={isDisabled}
                    className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-medium text-sm border transition-all duration-200 ${
                      isDisabled
                        ? colorClasses[button.color].disabled + ' border-stone-200 cursor-not-allowed'
                        : colorClasses[button.color].enabled + ' border-transparent shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <Icon className="text-sm" />
                    <span>{button.text}</span>
                    {button.requiresAuth && !isLoggedIn && (
                      <FaLock className="text-sm ml-1" />
                    )}
                  </button>

                  {/* Tooltip */}
                  {hoveredButton === index && !isDisabled && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                        {button.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputSection;