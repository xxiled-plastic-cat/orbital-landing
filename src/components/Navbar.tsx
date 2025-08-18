import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Markets', href: '#markets' },
    { name: 'Loaner NFTs', href: '#tokenized-debt' },
    { name: 'Marketplace', href: '#marketplace' },
    { name: 'Benefits', href: '#why-orbital' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-space-dark bg-opacity-90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-neon-teal" />
            <span className="font-sora text-xl font-bold">Orbital<span className="text-neon-teal">Lending</span></span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-soft-gray hover:text-neon-teal transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
            <Link 
              to="/app"
              className="orbital-btn-primary"
            >
              Launch App
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neon-teal hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-space-gray border-t border-neon-teal border-opacity-20"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-soft-gray hover:text-neon-teal hover:bg-space-dark rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/app"
              className="block px-3 py-2 text-base font-medium text-neon-teal hover:bg-neon-teal hover:bg-opacity-10 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Launch App
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;