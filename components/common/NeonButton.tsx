import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const NeonButton: React.FC<NeonButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      style={{
        '--shadow-color-1': `rgba(var(--button-accent-rgb), 0.4)`,
        '--shadow-color-2': `rgba(var(--button-accent-rgb), 0.3)`,
        '--shadow-color-hover-1': `rgba(var(--button-accent-rgb), 0.6)`,
        '--shadow-color-hover-2': `rgba(var(--button-accent-rgb), 0.4)`,
      } as React.CSSProperties}
      className={`
        px-6 py-3 font-bold font-orbitron text-lg text-[var(--button-text)] bg-[var(--button-accent)]/10 border-2 border-[var(--button-accent)] rounded-lg
        hover:bg-[var(--button-accent)]/30 hover:text-white transition-all duration-300
        shadow-[0_0_5px_var(--shadow-color-1),inset_0_0_5px_var(--shadow-color-2)]
        hover:shadow-[0_0_15px_var(--shadow-color-hover-1),inset_0_0_10px_var(--shadow-color-hover-2)]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[var(--button-accent)]
        neon-button-shimmer
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default NeonButton;