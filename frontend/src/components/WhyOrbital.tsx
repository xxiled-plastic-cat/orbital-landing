import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Layers, InfinityIcon, Users, Shield } from 'lucide-react';
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
            description="Each lending market is an isolated contract. Markets operate independently but can be composed together for powerful functionality."
            icon={Layers}
            delay={0}
          />
          
          <AnimatedCard 
            title="Composable"
            description="LSTs and Debt Positions work seamlessly across the DeFi ecosystem. Build on top of our protocol or integrate with other platforms."
            icon={InfinityIcon}
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
        

      </div>
    </section>
  );
};

export default WhyOrbital;