import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import FAQ from "../Component/FAQ";
import AboutNotesy from "../Component/AboutNotesy";
import Footer from "../Component/Footer";
import LoginNavbar from "../Component/LoggedNavbar";
import InputSection from "../Component/InputSection";
import OutputSection from "../Component/OutputSection";
import Layout from "../Component/Layout";

function Dashboard() {
  const [output, setOutput] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleGenerate = (generatedContent) => {
    setOutput(generatedContent);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-mono text-gray-900">
      {/* Navbar */}
      <LoginNavbar />

      <main className="flex flex-col items-center p-10">
        <h1 className="text-4xl font-bold text-center mt-8 mb-4 text-gray-900">
          Your Personal Study Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-3xl text-lg">
          Transform your notes into powerful study materials.
        </p>

           {/* Input + Output Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          <InputSection onGenerate={handleGenerate} isLoggedIn={!!user} />
          <OutputSection output={output} />
        </div>

        {/* About + FAQ */}
        <div className="mt-12 w-full">
          <AboutNotesy />
        </div>
        <div className="mt-16 w-full max-w-6xl">
          <FAQ />
        </div>
      </main>

    
    </div>
  );
}

export default Dashboard;
