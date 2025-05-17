import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FileDigit, ArrowRight, RefreshCw, CircleDollarSign } from 'lucide-react';
import OrbitalParticles from './OrbitalParticles';

const TokenizedDebt = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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

  const flowSteps = [
    {
      id: 1,
      title: "Loan Created",
      description: "User deposits collateral and takes out a loan",
      icon: FileDigit,
    },
    {
      id: 2,
      title: "NFT Minted",
      description: "A unique Loaner NFT is created to represent the loan position",
      icon: CircleDollarSign,
    },
    {
      id: 3,
      title: "Listed On-Chain",
      description: "Automatically available for trading with no approval needed",
      icon: RefreshCw,
    },
  ];

  return (
    <section id="tokenized-debt" className="relative py-24 bg-space-dark">
      <OrbitalParticles count={8} className="opacity-40" />
      
      <div className="container-section relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants}
          >
            <h2 className="section-title">Your Loan is an NFT</h2>
            <p className="section-subtitle">
              We've reimagined debt as a digital asset, bringing unprecedented liquidity and flexibility to lending markets.
            </p>
            
            <ul className="space-y-8 mt-8">
              <motion.li 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-neon-teal bg-opacity-10 p-2 rounded-full h-min mt-1">
                  <FileDigit className="text-neon-teal w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Unique Digital Representation</h3>
                  <p className="text-soft-gray">Every loan is minted as a unique Loaner NFT that represents the debt position and collateral claim rights.</p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-neon-purple bg-opacity-10 p-2 rounded-full h-min mt-1">
                  <RefreshCw className="text-neon-purple w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Automated On-Chain Listing</h3>
                  <p className="text-soft-gray">Automatically listed on-chain—no approval or backend logic needed. Trade freely with complete security.</p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="bg-neon-pink bg-opacity-10 p-2 rounded-full h-min mt-1">
                  <CircleDollarSign className="text-neon-pink w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Smart Contract Security</h3>
                  <p className="text-soft-gray">The lending contract retains full control via clawback/freeze mechanisms, ensuring market integrity.</p>
                </div>
              </motion.li>
            </ul>
          </motion.div>
          
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* NFT Visualization */}
            <motion.div 
              className="relative mx-auto max-w-sm"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-space-gray rounded-2xl p-6 border border-neon-teal border-opacity-30 overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-soft-gray">DEBT POSITION</div>
                    <div className="text-xl font-bold font-sora">Loan #7842</div>
                  </div>
                  <div className="bg-neon-teal bg-opacity-10 text-neon-teal px-2 py-1 rounded-lg text-xs">
                    Active
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="text-soft-gray">Collateral</div>
                    <div className="font-semibold">1.25 goETH</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-soft-gray">Borrowed</div>
                    <div className="font-semibold">1,500 USDC</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-soft-gray">Health</div>
                    <div className="text-neon-teal font-semibold">145%</div>
                  </div>
                </div>
                
                <div className="h-1 w-full bg-space-dark mb-4 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-neon-teal" 
                    style={{ width: '65%' }}
                    animate={{ backgroundColor: ["#66fcf1", "#45a29e", "#66fcf1"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-soft-gray">
                  <span>Liquidation: 120%</span>
                  <span>Current: 145%</span>
                  <span>Safe: 180%+</span>
                </div>
                
                {/* Orbital Effect */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
                  <motion.div 
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-neon-teal opacity-10 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Flow Diagram */}
            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
              {flowSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div 
                    className="bg-space-gray bg-opacity-80 backdrop-blur-sm p-4 rounded-lg text-center flex-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                  >
                    <div className="bg-deep-blue p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="text-neon-teal w-5 h-5" />
                    </div>
                    <h4 className="font-bold mb-1">{step.title}</h4>
                    <p className="text-sm text-soft-gray">{step.description}</p>
                  </motion.div>
                  
                  {index < flowSteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                      className="hidden md:block"
                    >
                      <ArrowRight className="text-neon-teal" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Background gradient */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-neon-pink opacity-5 blur-[100px] rounded-full"></div>
    </section>
  );
};

export default TokenizedDebt;