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
      className={`bg-slate-700 border border-slate-600 rounded-xl p-6 hover:border-slate-500 hover:bg-slate-650 transition-all duration-150 ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="bg-slate-600 border border-slate-500 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
          <Icon className="text-cyan-400 w-7 h-7" />
        </div>
        <h3 className="font-mono text-xl font-bold mb-4 text-white">{title.toUpperCase()}</h3>
        <p className="text-slate-300 flex-grow font-mono text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default AnimatedCard;