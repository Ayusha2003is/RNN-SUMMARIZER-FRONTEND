import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FAQ from "../Component/FAQ";
import AboutNotesy from "../Component/AboutNotesy";
import OutputSection from "../Component/OutputSection";
import InputSection from "../Component/InputSection"; 

function Home({ isAuthenticated }) {
  const [output, setOutput] = useState("");
  const navigate = useNavigate();

  const handleGenerate = (generatedContent) => {
    console.log("Generated content received:", generatedContent);
    setOutput(generatedContent);
  };

  console.log("Home component - isAuthenticated:", isAuthenticated); // Debug log

  return (
    <div className="flex flex-col items-center p-10 min-h-screen bg-gray-50 font-mono text-gray-900">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mt-8 mb-4 text-gray-900">
        Welcome to Notesy
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-3xl text-lg">
        Upload your notes or paste any text to generate smart summaries or flashcards.
      </p>

      {/* Input + Output Section */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
        <InputSection 
          onGenerate={handleGenerate} 
          isLoggedIn={isAuthenticated} 
        />
        <OutputSection output={output} />
      </div>

      {/* About Section */}
      <div className="mt-12 w-full">
        <AboutNotesy />
      </div>

      {/* FAQ Section */}
      <div className="mt-16 w-full max-w-6xl">
        <FAQ />
      </div>
    </div>
  );
}

export default Home;
