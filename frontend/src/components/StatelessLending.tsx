import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Database, Blocks, ArrowRightLeft, Lock } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import OrbitalParticles from './OrbitalParticles';

const StatelessLending = () => {
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
    <section id="markets" className="relative py-24 bg-slate-800">
      <OrbitalParticles count={10} className="opacity-50" />
      
      <div className="container-section relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={titleVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-mono font-bold mb-6 text-white">BUILT FOR <span className="text-cyan-400">MODULARITY</span></h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto font-mono">
            A revolutionary lending platform designed from the ground up for maximum 
            composability and minimal overhead.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard 
            title="Isolated Markets"
            description="Each supported asset has its own standalone smart contract, liquidity and risk are isolated."
            icon={Database}
            delay={0}
          />
          
          <AnimatedCard 
            title="Liquid Staking Tokens"
            description="Depositing mints Liquid Staking Tokens (LSTs) that accrue value over time."
            icon={Blocks}
            delay={1}
          />
          
          <AnimatedCard 
            title="Cross-Market Borrowing"
            description="Users can borrow any asset in the ecosystem if their LST is accepted as collateral."
            icon={ArrowRightLeft}
            delay={2}
          />
          
          <AnimatedCard 
            title="Trust-Minimized Design"
            description="The platform is designed for maximum decentralization and minimal trust requirements."
            icon={Lock}
            delay={3}
          />
        </div>
        
        <motion.div 
          className="mt-16 p-8 bg-slate-700 border border-slate-600 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h3 className="text-2xl font-mono font-bold mb-6 text-white">SYSTEM ARCHITECTURE</h3>
          <div className="space-y-4">
            <p className="text-slate-300 font-mono">
              Each supported asset (e.g., ALGO, USDC) has its own standalone smart contract.
              Depositing mints Liquid Staking Tokens (LSTs) that accrue value over time.
            </p>
            <p className="text-slate-300 font-mono">
              Users can borrow any asset in the ecosystem if their LST is accepted as collateral.
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* Subtle background effect */}
      <div className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-slate-600 opacity-10 blur-[120px] rounded-full"></div>
    </section>
  );
};

export default StatelessLending;