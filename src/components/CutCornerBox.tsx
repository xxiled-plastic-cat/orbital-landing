import React from 'react';

interface CutCornerBoxProps {
  children: React.ReactNode;
  className?: string;
  cornerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const CutCornerBox: React.FC<CutCornerBoxProps> = ({
  children,
  className = '',
  cornerSize = 'md',
}) => {
  const cornerSizes = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  };

  const corner = cornerSizes[cornerSize];

  return (
    <div className={`cut-corner-container ${className}`}>
      <style jsx>{`
        .cut-corner-container {
          position: relative;
          background: 
            linear-gradient(135deg, transparent ${corner}px, currentColor ${corner}px),
            linear-gradient(225deg, transparent ${corner}px, currentColor ${corner}px),
            linear-gradient(315deg, transparent ${corner}px, currentColor ${corner}px),
            linear-gradient(45deg, transparent ${corner}px, currentColor ${corner}px);
          background-position: top left, top right, bottom right, bottom left;
          background-size: 50% 50%;
          background-repeat: no-repeat;
        }
        
        .cut-corner-container::before {
          content: '';
          position: absolute;
          inset: 1px;
          background: 
            linear-gradient(135deg, transparent ${corner-1}px, var(--bg-color) ${corner-1}px),
            linear-gradient(225deg, transparent ${corner-1}px, var(--bg-color) ${corner-1}px),
            linear-gradient(315deg, transparent ${corner-1}px, var(--bg-color) ${corner-1}px),
            linear-gradient(45deg, transparent ${corner-1}px, var(--bg-color) ${corner-1}px);
          background-position: top left, top right, bottom right, bottom left;
          background-size: 50% 50%;
          background-repeat: no-repeat;
          z-index: 1;
        }
        
        .cut-corner-content {
          position: relative;
          z-index: 2;
        }
      `}</style>
      <div className="cut-corner-content">
        {children}
      </div>
    </div>
  );
};

export default CutCornerBox;