import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layers, Infinity, Users, Shield } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import OrbitalParticles from './OrbitalParticles';

const WhyOrbital = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
      }
    },
  };

  return (
    <section id="why-orbital" className="relative py-24 bg-slate-900">
      <OrbitalParticles count={15} />
      
      <div className="container-section relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={titleVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-mono font-bold mb-6 text-white">WHY BUILD ON <span className="text-cyan-400">ORBITAL</span>?</h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto font-mono">
            The next generation of DeFi infrastructure — designed for maximum flexibility, security, and decentralization.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard 
            title="Modular"
            description="Each lending market is an isolated, upgradeable contract. Markets operate independently but can be composed together for powerful functionality."
            icon={Layers}
            delay={0}
          />
          
          <AnimatedCard 
            title="Composable"
            description="LSTs and Loaner NFTs work seamlessly across the DeFi ecosystem. Build on top of our protocol or integrate with other platforms."
            icon={Infinity}
            delay={1}
          />
          
          <AnimatedCard 
            title="Permissionless"
            description="No whitelists or central listings. Anyone can interact with the protocol, create markets, or build integrations without gatekeepers."
            icon={Users}
            delay={2}
          />
          
          <AnimatedCard 
            title="Decentralized"
            description="Smart contracts hold all authority. The system is designed to function entirely on-chain without reliance on centralized components."
            icon={Shield}
            delay={3}
          />
        </div>
        
        <motion.div 
          className="mt-16 p-8 bg-slate-800 border border-slate-700 rounded-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Subtle background effects */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-600 opacity-5 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-400 opacity-5 blur-[80px] rounded-full"></div>
          
          <div className="relative">
            <h3 className="text-2xl font-mono font-bold mb-6 text-center text-white">COMPARE THE DIFFERENCE</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 border border-slate-600 p-6 rounded-lg">
                <h4 className="font-mono font-bold text-center mb-4 text-slate-400">TRADITIONAL LENDING</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-mono">×</span>
                    <span className="text-slate-300 text-sm font-mono">Per-user state tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-mono">×</span>
                    <span className="text-slate-300 text-sm font-mono">Illiquid debt positions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-mono">×</span>
                    <span className="text-slate-300 text-sm font-mono">Limited composability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 font-mono">×</span>
                    <span className="text-slate-300 text-sm font-mono">Centralized risk management</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-700 border border-slate-600 p-6 rounded-lg md:border-l-2 md:border-r-2 md:border-amber-400">
                <h4 className="font-mono font-bold text-center mb-4 text-amber-400">DEFI 2.0</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-mono">~</span>
                    <span className="text-slate-300 text-sm font-mono">Reduced state tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-mono">~</span>
                    <span className="text-slate-300 text-sm font-mono">Some tokenized positions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-mono">~</span>
                    <span className="text-slate-300 text-sm font-mono">Improved composability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-mono">~</span>
                    <span className="text-slate-300 text-sm font-mono">Hybrid risk management</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-cyan-500 bg-opacity-10 border-2 border-cyan-400 p-6 rounded-lg">
                <h4 className="font-mono font-bold text-center mb-4 text-cyan-400">ORBITAL LENDING</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-mono">✓</span>
                    <span className="text-white text-sm font-mono">Zero user state tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-mono">✓</span>
                    <span className="text-white text-sm font-mono">Fully liquid NFT debt positions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-mono">✓</span>
                    <span className="text-white text-sm font-mono">Maximum composability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-mono">✓</span>
                    <span className="text-white text-sm font-mono">Decentralized risk transfer</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyOrbital;