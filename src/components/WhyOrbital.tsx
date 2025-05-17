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
    <section id="why-orbital" className="relative py-24 bg-space-gradient orbital-grid">
      <OrbitalParticles count={15} />
      
      <div className="container-section relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={titleVariants}
          className="text-center mb-16"
        >
          <h2 className="section-title">Why Build on Orbital?</h2>
          <p className="section-subtitle mx-auto">
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
          className="mt-16 p-8 border border-neon-teal border-opacity-20 rounded-xl bg-space-dark relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Background effect */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-purple opacity-10 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neon-teal opacity-10 blur-[80px] rounded-full"></div>
          
          <div className="relative">
            <h3 className="text-2xl font-sora font-bold mb-6 text-center">Compare the Difference</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-space-gray bg-opacity-70 p-5 rounded-lg">
                <h4 className="font-bold text-center mb-4 text-soft-gray">Traditional Lending</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span className="text-soft-gray text-sm">Per-user state tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span className="text-soft-gray text-sm">Illiquid debt positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span className="text-soft-gray text-sm">Limited composability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span className="text-soft-gray text-sm">Centralized risk management</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-space-gray bg-opacity-70 p-5 rounded-lg md:border-l md:border-r border-neon-teal border-opacity-20">
                <h4 className="font-bold text-center mb-4">DeFi 2.0</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">⟳</span>
                    <span className="text-soft-gray text-sm">Reduced state tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">⟳</span>
                    <span className="text-soft-gray text-sm">Some tokenized positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">⟳</span>
                    <span className="text-soft-gray text-sm">Improved composability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">⟳</span>
                    <span className="text-soft-gray text-sm">Hybrid risk management</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neon-teal bg-opacity-5 p-5 rounded-lg border border-neon-teal border-opacity-20">
                <h4 className="font-bold text-center mb-4 text-neon-teal">Orbital Lending</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-neon-teal">✓</span>
                    <span className="text-white text-sm">Zero user state tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neon-teal">✓</span>
                    <span className="text-white text-sm">Fully liquid NFT debt positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neon-teal">✓</span>
                    <span className="text-white text-sm">Maximum composability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neon-teal">✓</span>
                    <span className="text-white text-sm">Decentralized risk transfer</span>
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