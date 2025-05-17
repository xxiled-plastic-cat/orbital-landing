import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  scale: number;
  opacity: number;
};

type OrbitalParticlesProps = {
  count?: number;
  className?: string;
};

const OrbitalParticles: React.FC<OrbitalParticlesProps> = ({ 
  count = 15,
  className = ""
}) => {
  // Generate particles with random properties
  const generateParticles = (): Particle[] => {
    const particles: Particle[] = [];
    const colors = ['#66fcf1', '#45a29e', '#8a2be2', '#f72585'];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
        duration: 15 + Math.random() * 30,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    
    return particles;
  };
  
  const particles = useRef<Particle[]>(generateParticles());

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            filter: `blur(${particle.size > 5 ? 2 : 0}px)`,
            opacity: particle.opacity,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [particle.scale, particle.scale * 1.5, particle.scale],
            opacity: [particle.opacity, particle.opacity * 0.6, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default OrbitalParticles;