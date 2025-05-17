import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Rocket, BarChart3 } from 'lucide-react';
import OrbitalAnimation from './OrbitalAnimation';
import OrbitalParticles from './OrbitalParticles';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <OrbitalParticles count={20} />
      
      <div className="container-section relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sora font-bold mb-6 leading-tight">
              Orbital Lending
              <motion.span 
                className="block text-neon-teal"
                animate={{ textShadow: ["0 0 7px rgba(102, 252, 241, 0.6)", "0 0 10px rgba(102, 252, 241, 0.8)", "0 0 7px rgba(102, 252, 241, 0.6)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Stateless borrowing meets on-chain debt trading.
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-xl mb-8 text-soft-gray max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Unlock composable DeFi with liquid loans, tokenized debt, and permissionless risk transfer—all fully on-chain.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <a href="#markets" className="orbital-btn-primary">
                <BarChart3 size={20} />
                Explore Markets
              </a>
              <a href="#launch-app" className="orbital-btn-secondary">
                <Rocket size={20} />
                Launch App
              </a>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="md:h-[30rem] flex items-center justify-center relative"
          >
            <OrbitalAnimation className="w-full h-full" />
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-neon-teal flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-sm mb-2">Discover More</p>
          <ChevronDown />
        </motion.div>
      </div>
      
      {/* Background gradient effects */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-neon-purple opacity-5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-neon-teal opacity-5 blur-[150px] rounded-full"></div>
    </section>
  );
};

export default Hero;