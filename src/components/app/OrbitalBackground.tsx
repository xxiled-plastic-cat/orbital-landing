import React from 'react';
import { motion } from 'framer-motion';

const OrbitalBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-dark via-deep-blue to-space-dark"></div>
      
      {/* Concentric circles - multiple layers for depth */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outermost circle - very subtle */}
        <motion.div 
          className="absolute w-[120vw] h-[120vw] rounded-full border border-neon-teal opacity-5"
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 120, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Second circle */}
        <motion.div 
          className="absolute w-[100vw] h-[100vw] rounded-full border border-neon-teal opacity-8"
          animate={{ 
            rotate: -360,
            scale: [1, 1.03, 1]
          }}
          transition={{ 
            rotate: { duration: 100, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Third circle */}
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full border border-neon-teal opacity-10"
          animate={{ 
            rotate: 360,
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            rotate: { duration: 80, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Fourth circle */}
        <motion.div 
          className="absolute w-[60vw] h-[60vw] rounded-full border border-neon-teal opacity-12"
          animate={{ 
            rotate: -360,
            scale: [1, 1.04, 1]
          }}
          transition={{ 
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Fifth circle */}
        <motion.div 
          className="absolute w-[40vw] h-[40vw] rounded-full border border-neon-teal opacity-15"
          animate={{ 
            rotate: 360,
            scale: [1, 1.06, 1]
          }}
          transition={{ 
            rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Innermost circle - most visible */}
        <motion.div 
          className="absolute w-[20vw] h-[20vw] rounded-full border border-neon-teal opacity-20"
          animate={{ 
            rotate: -360,
            scale: [1, 1.08, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Central glow effect */}
        <motion.div 
          className="absolute w-32 h-32 rounded-full bg-neon-teal opacity-10 blur-xl"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>
      
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
