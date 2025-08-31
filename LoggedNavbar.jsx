// LoginNavbar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function LoginNavbar() {
  const [time, setTime] = useState(new Date());
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleHomeClick = () => navigate("/dashboard");
  const handleFlashcardClick = () => navigate("/flashcards");
  const handleTodoClick = () => navigate("/todolist");
  const handleLogoClick = () => navigate("/dashboard");
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formattedTime = time.toLocaleTimeString();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div onClick={handleLogoClick} className="cursor-pointer">
            <span className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200">
              Notesy
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            <button
              onClick={handleHomeClick}
              className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md transition-colors duration-200"
            >
              Home
            </button>

            <button
              onClick={handleFlashcardClick}
              className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md transition-colors duration-200"
            >
              Flashcards
            </button>

            <button
              onClick={handleTodoClick}
              className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md transition-colors duration-200"
            >
              To-Do List
            </button>

            {/* Time Display */}
            <div className="px-3 py-1 bg-gray-50 rounded-md">
              <span className="text-gray-500 text-xs font-mono">{formattedTime}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <button
              onClick={() => { handleHomeClick(); toggleMenu(); }}
              className="w-full text-left text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-white transition-colors duration-200"
            >
              Home
            </button>

            <button
              onClick={() => { handleFlashcardClick(); toggleMenu(); }}
              className="w-full text-left text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-white transition-colors duration-200"
            >
              Flashcards
            </button>

            <button
              onClick={() => { handleTodoClick(); toggleMenu(); }}
              className="w-full text-left text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-white transition-colors duration-200"
            >
              To-Do List
            </button>

            {/* Time */}
            <div className="py-2 px-3 bg-white rounded-md">
              <span className="text-gray-500 text-xs font-mono">{formattedTime}</span>
            </div>

            {/* Logout */}
            <button
              onClick={() => { handleLogout(); toggleMenu(); }}
              className="w-full py-2 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default LoginNavbar;
