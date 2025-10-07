import { useEffect } from 'react';

interface MomentumSpinnerProps {
  size?: string;
  speed?: string;
  color?: string;
  className?: string;
}

const MomentumSpinner = ({ 
  size = "40", 
  speed = "1.1", 
  color = "#06b6d4", // cyan-500 to match the theme
  className = ""
}: MomentumSpinnerProps) => {
  useEffect(() => {
    // Dynamically import and register the momentum component
    import('ldrs/momentum').then(() => {
      // Component is registered automatically when imported
    });
  }, []);

  return (
    <div className={className}>
      <l-momentum
        size={size}
        speed={speed}
        color={color}
      />
    </div>
  );
};

export default MomentumSpinner;
