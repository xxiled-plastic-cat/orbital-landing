import React from 'react';
import { motion } from 'framer-motion';

const OrbitalBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-dark via-deep-blue to-space-dark"></div>
      
      {/* Concentric circles - multiple layers for depth */}
      
      
      {/* Floating orbital particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-teal rounded-full opacity-30"
            style={{
              left: `${20 + (i * 6)}%`,
              top: `${30 + (i * 4)}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 60, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
      
      {/* Additional ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-teal opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple opacity-5 blur-[100px] rounded-full"></div>
      <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-neon-pink opacity-5 blur-[80px] rounded-full"></div>
    </div>
  );
};

export default OrbitalBackground;
