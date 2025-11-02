import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Database, LineChart, ShieldCheck } from 'lucide-react';

const MarketplaceLayer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const features = [
    {
      id: 1,
      title: "Live State Reading",
      description: "Real-time NFT ownership, oracle prices, and collateral ratios.",
      icon: LineChart,
      delay: 0.2
    },
    {
      id: 2,
      title: "Direct Contract Interaction",
      description: "Users interact with smart contracts—no asset custody, no backend listings.",
      icon: Database,
      delay: 0.4
    },
    {
      id: 3,
      title: "Maximum Security",
      description: "All interactions are on-chain and verifiable, with no trusted third parties.",
      icon: ShieldCheck,
      delay: 0.6
    }
  ];

  return (
    <section className="py-24 bg-space-dark">
      <div className="container-section">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Trustless Frontend, On-Chain Power</h2>
          <p className="section-subtitle mx-auto">
            Our marketplace UI is merely a facilitator, while all the real power lives on-chain.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-2 md:order-1"
          >
            <div className="relative bg-space-gray rounded-xl overflow-hidden border border-neon-teal border-opacity-20 p-6">
              <div className="absolute inset-0 bg-space-gradient opacity-50"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-6 border-b border-neon-teal border-opacity-20 pb-4">
                  <h3 className="font-display text-xl font-bold">System Architecture</h3>
                  <div className="text-neon-teal text-xs px-2 py-1 bg-neon-teal bg-opacity-10 rounded-full">
                    On-Chain First
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-space-dark bg-opacity-70 p-4 rounded-lg">
                    <div className="mb-2 font-bold">Frontend Layer</div>
                    <div className="flex space-x-3">
                      <div className="bg-neon-teal bg-opacity-10 text-neon-teal text-xs px-2 py-1 rounded">UI</div>
                      <div className="bg-neon-purple bg-opacity-10 text-neon-purple text-xs px-2 py-1 rounded">State Reading</div>
                      <div className="bg-neon-pink bg-opacity-10 text-neon-pink text-xs px-2 py-1 rounded">Contract Calls</div>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="flex justify-center"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="h-6 w-0.5 bg-neon-teal opacity-70"></div>
                  </motion.div>
                  
                  <div className="bg-deep-blue p-4 rounded-lg">
                    <div className="mb-2 font-bold">Smart Contract Layer</div>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-neon-teal bg-opacity-10 text-neon-teal text-xs px-2 py-1 rounded whitespace-nowrap">Lending Markets</div>
                      <div className="bg-neon-purple bg-opacity-10 text-neon-purple text-xs px-2 py-1 rounded whitespace-nowrap">Loaner NFTs</div>
                      <div className="bg-neon-pink bg-opacity-10 text-neon-pink text-xs px-2 py-1 rounded whitespace-nowrap">Price Oracles</div>
                      <div className="bg-blue-500 bg-opacity-10 text-blue-500 text-xs px-2 py-1 rounded whitespace-nowrap">Liquidation Engine</div>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="flex justify-center"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <div className="h-6 w-0.5 bg-neon-teal opacity-70"></div>
                  </motion.div>
                  
                  <div className="bg-space-dark bg-opacity-70 p-4 rounded-lg">
                    <div className="mb-2 font-bold">Blockchain Layer</div>
                    <div className="flex space-x-3">
                      <div className="bg-neon-teal bg-opacity-10 text-neon-teal text-xs px-2 py-1 rounded">State</div>
                      <div className="bg-neon-purple bg-opacity-10 text-neon-purple text-xs px-2 py-1 rounded">Consensus</div>
                      <div className="bg-neon-pink bg-opacity-10 text-neon-pink text-xs px-2 py-1 rounded">Security</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Features */}
          <div className="space-y-6 order-1 md:order-2">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                className="flex gap-4"
              >
                <div className="bg-deep-blue p-3 rounded-full h-min mt-1">
                  <feature.icon className="text-neon-teal w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-soft-gray">{feature.description}</p>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 p-4 bg-neon-teal bg-opacity-5 border border-neon-teal border-opacity-20 rounded-lg"
            >
              <p className="font-bold mb-2">The marketplace UI is a facilitator only.</p>
              <p className="text-soft-gray">
                All core functionality exists in smart contracts. The UI simply provides a convenient way
                to interact with the on-chain system, but users are free to interact directly with contracts if desired.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Background gradient */}
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-neon-teal opacity-5 blur-[80px] rounded-full"></div>
    </section>
  );
};

export default MarketplaceLayer;