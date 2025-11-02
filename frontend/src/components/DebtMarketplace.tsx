import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CircleDollarSign, Gavel, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import OrbitalParticles from './OrbitalParticles';

const DebtMarketplace = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [formulaExpanded, setFormulaExpanded] = useState(false);
  
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  const columns = [
    {
      id: 1,
      title: "Buyouts (CR > LTV)",
      description: "Pay debt + premium based on collateral ratio. Debt position transfers to buyer.",
      icon: CircleDollarSign,
      color: "neon-teal",
    },
    {
      id: 2,
      title: "Liquidation (CR ≤ LTV)",
      description: "Anyone can repay full debt and claim collateral. Debt position is closed.",
      icon: Gavel,
      color: "neon-purple",
    },
    {
      id: 3,
      title: "Voluntary Repayment",
      description: "Debt holder repays and retrieves collateral. Debt position is closed.",
      icon: RefreshCw,
      color: "neon-pink",
    },
  ];

  return (
    <section id="marketplace" className="relative py-24 bg-space-gradient orbital-grid">
      <OrbitalParticles count={12} />
      
      <div className="container-section relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center mb-16"
        >
          <h2 className="section-title">Permissionless Debt Trading</h2>
          <p className="section-subtitle mx-auto">
            All debt positions are automatically listed on our marketplace. Buy, liquidate, or repay loans—directly on-chain, with no intermediaries.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              className={`feature-card border-${column.color} border-opacity-30`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 * column.id }}
            >
              <div className={`bg-${column.color} bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
                <column.icon className={`text-${column.color} w-7 h-7`} />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{column.title}</h3>
              <p className="text-soft-gray">{column.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Formula Section */}
        <motion.div 
          className="mt-12 p-6 border border-neon-teal border-opacity-20 rounded-xl bg-space-gray bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setFormulaExpanded(!formulaExpanded)}
          >
            <h3 className="text-2xl font-display font-bold">Pricing Formula</h3>
            {formulaExpanded ? 
              <ChevronUp className="text-neon-teal" /> : 
              <ChevronDown className="text-neon-teal" />
            }
          </div>
          
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: formulaExpanded ? 'auto' : 0,
              opacity: formulaExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-neon-teal border-opacity-20 mt-4">
              <div className="mb-4">
                <code className="text-xl bg-deep-blue p-2 rounded font-mono text-neon-teal">
                  Price = Debt + (Collateral - Debt) × PremiumRate
                </code>
              </div>
              <p className="text-soft-gray mb-4">
                Premium scales from 0 up, as CR (Collateral Ratio) moves upwards from initial LTV (Loan-to-Value).
              </p>
              
              <div className="bg-deep-blue p-4 rounded-lg">
                <h4 className="font-bold mb-2">Example:</h4>
                <ul className="list-disc list-inside text-soft-gray space-y-2">
                  <li>Collateral: 1 goETH ($2,000)</li>
                  <li>Debt: 1,000 USDC</li>
                  <li>CR: 200%, LTV: 120%, MinCR: 120%</li>
                  <li>Buyout Price: $1,000 + ($2,000 - $1,000) × 0.4 = $1,400</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        
      </div>
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-neon-purple opacity-5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-neon-teal opacity-5 blur-[100px] rounded-full"></div>
    </section>
  );
};

export default DebtMarketplace;