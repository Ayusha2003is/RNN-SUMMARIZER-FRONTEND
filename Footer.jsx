import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import logo from '../../images/Notesy.png';

function Footer() {
  const socialLinks = [
    { icon: FaFacebookF, href: "#", label: "Facebook" },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaInstagram, href: "#", label: "Instagram" }
  ];

  const navigationLinks = [
    { to: "/privacy", text: "Privacy Policy" },
    { to: "/terms", text: "Terms of Service" },
    { to: "/contact", text: "Contact Us" }
  ];

  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-gray-700">

        {/* Left: Logo */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <Link to="/" className="hover:opacity-90 transition">
            <img src={logo} alt="Notesy" className="w-20 h-20 object-contain" />
          </Link>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Notesy. All rights reserved.
          </p>
        </div>

        {/* Center: Navigation */}
        <div className="flex flex-col items-center text-center space-y-3">
          <h3 className="font-semibold text-gray-800">Quick Links</h3>
          <div className="space-y-2">
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="text-sm text-gray-600 hover:text-black transition"
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Social */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <h3 className="font-semibold text-gray-800">Follow Us</h3>
          <div className="flex space-x-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-800 hover:text-black text-gray-500 transition"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center py-4 text-lg font-semibold text-gray-700 bg-gray-100">
        For students everywhere
      </div>
    </footer>
  );
}

export default Footer;
