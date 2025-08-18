import { useState, useEffect } from 'react';
import { Menu, X, Radio } from 'lucide-react';
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
      className={`fixed w-full z-50 transition-all duration-150 ${
        isScrolled ? 'bg-slate-900 bg-opacity-95 backdrop-blur-sm border-b border-slate-700' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 border border-slate-600 p-2 rounded-lg">
              <img 
                src="/orbital-logo.png" 
                alt="Orbital Lending" 
                className="h-6 w-6"
              />
            </div>
            <span className="font-mono text-xl font-bold text-white">ORBITAL<span className="text-cyan-400">LENDING</span></span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-slate-300 hover:text-cyan-400 transition-colors duration-150 font-mono text-sm tracking-wide"
              >
                {link.name.toUpperCase()}
              </a>
            ))}
            <Link 
              to="/app"
              className="bg-cyan-600 border border-cyan-500 text-white px-6 py-2 rounded-lg font-mono text-sm hover:bg-cyan-500 transition-all duration-150"
            >
              LAUNCH APP
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-slate-800 border border-slate-600 p-2 rounded-lg text-cyan-400 hover:text-white hover:border-slate-500 focus:outline-none transition-all duration-150"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
          className="md:hidden bg-slate-900 border-t border-slate-700"
        >
          <div className="px-4 pt-4 pb-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-slate-500 font-mono text-sm transition-all duration-150"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name.toUpperCase()}
              </a>
            ))}
            <Link
              to="/app"
              className="block px-4 py-3 bg-cyan-600 border border-cyan-500 text-white rounded-lg font-mono text-sm hover:bg-cyan-500 transition-all duration-150 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              LAUNCH APP
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;