import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      {...props}
      className={`bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 
                  relative overflow-hidden transition-all duration-500 glass-card-border ${className}`}
    >
      {/* The glowing border is now handled by the ::before pseudo-element from the new CSS class */}
      {children}
    </div>
  );
};

export default GlassCard;