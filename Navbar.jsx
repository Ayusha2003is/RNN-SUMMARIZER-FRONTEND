import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';


function Navbar() {
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formattedTime = time.toLocaleTimeString();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleHomeClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-sm' 
        : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={handleHomeClick}
            className="cursor-pointer"
          >
            <span className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200">
              Notesy
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleHomeClick}
                className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md transition-colors duration-200"
              >
                Home
              </button>
              
              
              
              <Link
                to="/flashcards"
                className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md transition-colors duration-200"
              >
                Flashcard
              </Link>
              
              <Link
                to="/ToDoList"
                className="text-gray-600 hover:text-gray-900 text-sm px-3 py-2 rounded-md transition-colors duration-200"
              >
                To-Do-List
              </Link>
            </div>

            {/* Time Display */}
            <div className="px-3 py-1 bg-gray-50 rounded-md">
              <span className="text-gray-500 text-xs font-mono">
                {formattedTime}
              </span>
            </div>

            {/* Auth Buttons */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                    Login
                  </button>
                </Link>
                <Link to="/SignUp">
                  <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-md transition-colors duration-200">
                    Sign Up
                  </button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <ProfileMenu user={user} />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <FaTimes className="text-lg" />
            ) : (
              <FaBars className="text-lg" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <button
              onClick={() => {
                handleHomeClick();
                toggleMenu();
              }}
              className="w-full text-left text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-white transition-colors duration-200"
            >
              Home
            </button>
            
          
            
            <Link
              to="/flashcards"
              onClick={toggleMenu}
              className="block w-full text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-white transition-colors duration-200"
            >
              Flashcards
            </Link>
            
            <Link
              to="/ToDoList"
              onClick={toggleMenu}
              className="block w-full text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-white transition-colors duration-200"
            >
              To-Do-List
            </Link>

            <div className="py-2 px-3 bg-white rounded-md">
              <span className="text-gray-500 text-xs font-mono">
                {formattedTime}
              </span>
            </div>

            {!user ? (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <Link to="/login" onClick={toggleMenu}>
                  <button className="w-full py-2 px-3 text-gray-600 hover:text-gray-900 rounded-md hover:bg-white transition-colors duration-200">
                    Login
                  </button>
                </Link>
                <Link to="/SignUp" onClick={toggleMenu}>
                  <button className="w-full py-2 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors duration-200">
                    Sign Up
                  </button>
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200">
                <ProfileMenu user={user} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;