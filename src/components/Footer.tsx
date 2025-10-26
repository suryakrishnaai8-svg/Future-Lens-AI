import React from 'react';

interface FooterProps {
  onOpenAbout: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
      <button 
        onClick={onOpenAbout} 
        className="text-xs text-gray-500 hover:text-[var(--text-accent)] transition-all duration-300 hover:scale-105"
        style={{ textShadow: '0 0 5px var(--glow-1-hex)' }}
      >
        Built by Surya Krishna
      </button>
    </footer>
  );
};

export default Footer;