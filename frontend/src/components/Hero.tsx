
import { motion } from 'framer-motion';
import {  Rocket, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold mb-6 leading-tight">
              ORBITAL LENDING
              <span className="block text-cyan-400 mt-4">
                STATELESS BORROWING MEETS ON-CHAIN DEBT TRADING
              </span>
            </h1>
            
            <motion.p 
              className="text-xl mb-8 text-slate-300 max-w-xl font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Unlock composable DeFi with liquid loans, tokenized debt, and permissionless risk transfer.<br /> Fully on-chain.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4 relative z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ pointerEvents: 'auto' }}
            >
              <a href="#markets" className="bg-cyan-600 border border-cyan-500 text-white px-8 py-4 rounded-lg font-mono text-sm hover:bg-cyan-500 transition-all duration-150 flex items-center gap-3 relative z-20">
                <BarChart3 size={20} />
                EXPLORE MARKETS
              </a>
              <Link to="/app" className="bg-slate-700 border border-slate-600 text-slate-300 px-8 py-4 rounded-lg font-mono text-sm hover:border-slate-500 hover:bg-slate-600 hover:text-white transition-all duration-150 flex items-center gap-3 relative z-20">
                <Rocket size={20} />
                LAUNCH APP
              </Link>
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
        
       
      </div>
      
      {/* Subtle background effects */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-cyan-400 opacity-5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-600 opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default Hero;