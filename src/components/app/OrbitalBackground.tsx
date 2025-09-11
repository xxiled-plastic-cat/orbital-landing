import { motion } from 'framer-motion';

const OrbitalBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none w-full">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-dark via-deep-blue to-space-dark"></div>
      
      {/* Concentric circles - multiple layers for depth */}
      
      
      {/* Starfield - traveling through space effect */}
      <div className="absolute inset-0">
        {/* Fast moving stars */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`fast-${i}`}
            className="absolute w-0.5 h-0.5 bg-neon-teal rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, -1200],
              y: [0, -400],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Medium speed stars */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`medium-${i}`}
            className="absolute w-1 h-1 bg-neon-teal rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, -900],
              y: [0, -300],
              opacity: [0, 0.8, 0.8, 0],
              scale: [0.8, 1.5, 1.5, 0.8],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
        
        {/* Slow distant stars */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`slow-${i}`}
            className="absolute w-1 h-1 bg-neon-teal rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, -500],
              y: [0, -150],
              opacity: [0, 0.6, 0.6, 0],
              scale: [1, 1.5, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 8,
            }}
          />
        ))}
        
        {/* Occasional shooting stars */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute w-0.5 h-8 bg-gradient-to-t from-neon-teal to-transparent rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              rotate: -25,
            }}
            animate={{
              x: [0, -1500],
              y: [0, -600],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 10 + i * 15,
              repeatDelay: 20 + Math.random() * 30,
            }}
          />
        ))}
      </div>
      
      {/* Additional ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-neon-teal opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-neon-purple opacity-5 blur-[100px] rounded-full translate-x-1/2"></div>
      <div className="absolute top-3/4 left-1/2 w-32 h-32 md:w-64 md:h-64 bg-neon-pink opacity-5 blur-[80px] rounded-full translate-x-1/2"></div>
    </div>
  );
};

export default OrbitalBackground;
