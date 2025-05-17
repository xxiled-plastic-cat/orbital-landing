import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { DivideIcon as LucideIcon } from 'lucide-react';

type AnimatedCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
  className?: string;
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  title, 
  description, 
  icon: Icon,
  delay = 0,
  className = ""
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2 + delay * 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={`feature-card ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="bg-deep-blue p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
          <Icon className="text-neon-teal w-7 h-7" />
        </div>
        <h3 className="font-sora text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-soft-gray flex-grow">{description}</p>
      </div>
    </motion.div>
  );
};

export default AnimatedCard;