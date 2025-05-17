import React from 'react';
import { motion } from 'framer-motion';

type OrbitalAnimationProps = {
  className?: string;
};

const OrbitalAnimation: React.FC<OrbitalAnimationProps> = ({ className = "" }) => {
  // Define tokens to orbit around the core
  const tokens = [
    { id: 1, name: 'ALGO', color: '#f72585', delayMultiplier: 0 },
    { id: 2, name: 'USDC', color: '#3b82f6', delayMultiplier: 0.33 },
    { id: 3, name: 'XUSD', color: '#8a2be2', delayMultiplier: 0.66 },
    { id: 4, name: 'GOLD', color: '#66fcf1', delayMultiplier: 0.5 },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Core */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div 
          className="w-16 h-16 md:w-24 md:h-24 bg-neon-teal bg-opacity-20 border border-neon-teal rounded-full flex items-center justify-center z-10"
          animate={{ boxShadow: ["0 0 10px rgba(102, 252, 241, 0.5)", "0 0 20px rgba(102, 252, 241, 0.8)", "0 0 10px rgba(102, 252, 241, 0.5)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div 
            className="w-8 h-8 md:w-12 md:h-12 bg-neon-teal rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
      
      {/* Orbit paths */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-neon-teal border-opacity-20" />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 md:w-96 md:h-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-neon-purple border-opacity-20" />
      
      {/* Orbiting tokens */}
      {tokens.map((token, index) => (
        <motion.div
          key={token.id}
          className="absolute top-1/2 left-1/2"
          initial={{ rotate: index * 90 }}
          animate={{ 
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: -token.delayMultiplier * 25
          }}
          style={{
            width: token.id % 2 === 0 ? '32rem' : '20rem',
            height: token.id % 2 === 0 ? '32rem' : '20rem',
            marginLeft: token.id % 2 === 0 ? '-16rem' : '-10rem',
            marginTop: token.id % 2 === 0 ? '-16rem' : '-10rem',
          }}
        >
          <motion.div
            className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-medium text-xs md:text-sm"
            style={{ 
              backgroundColor: `${token.color}20`,
              color: token.color,
              border: `1px solid ${token.color}`,
              left: '100%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ 
              boxShadow: [
                `0 0 5px ${token.color}80`,
                `0 0 10px ${token.color}80`,
                `0 0 5px ${token.color}80`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {token.name}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default OrbitalAnimation;