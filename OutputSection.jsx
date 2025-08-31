import React, { useState, useEffect } from "react";

function OutputSection({ output, isLoggedIn = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayOutput, setDisplayOutput] = useState("");

  const WORD_LIMIT = isLoggedIn ? 1000 : 500; // 1000 for logged in, 500 for logged out
  const calculateWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = calculateWordCount(displayOutput);
  const progressPercentage = (wordCount / WORD_LIMIT) * 100;

  useEffect(() => {
    if (output && output !== displayOutput) {
      setIsLoading(true);
      setTimeout(() => {
        setDisplayOutput(output);
        setIsLoading(false);
      }, 300);
    }
  }, [output, displayOutput]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayOutput);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-stone-100 bg-gradient-to-r from-slate-50/50 to-stone-50/50 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
              Generated Output
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              AI-generated content will appear below
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              displayOutput ? 'bg-emerald-500' : isLoading ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'
            }`}></div>
            <span className="text-xs text-slate-500 font-medium">
              {isLoading ? 'Generating...' : displayOutput ? 'Ready' : 'Waiting'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="relative">
          <div className="relative min-h-[400px] bg-slate-50/50 border border-stone-200 rounded-xl overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-slate-600 font-medium text-sm">Generating content...</span>
                </div>
              </div>
            )}

            <div className="h-full max-h-[400px] overflow-y-auto p-6">
              {displayOutput ? (
                <textarea
                  className="w-full min-h-[300px] p-4 text-sm font-mono text-slate-700 bg-slate-50 border border-stone-200 rounded-xl resize-none"
                  value={displayOutput}
                  onChange={(e) => setDisplayOutput(e.target.value)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-600 text-base font-medium mb-2">No content generated yet</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                      Start by adding your content and selecting a generation option to see results here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {displayOutput && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-white/90 border border-stone-200 rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-xs text-slate-600 font-medium tabular-nums">
                  {displayOutput.length.toLocaleString()} characters
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Word count and progress */}
        {displayOutput && (
          <div className="mb-6 mt-6">
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
        )}

        {displayOutput && (
          <div className="border-t border-stone-100 pt-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Words:</span> {displayOutput.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                    <span className="font-medium">Characters:</span> {displayOutput.length.toLocaleString()}
                </div>

              </div>
              
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputSection;