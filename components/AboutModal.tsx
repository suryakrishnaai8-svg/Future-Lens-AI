import React from 'react';
import GlassCard from './common/GlassCard';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-3xl font-bold font-orbitron text-[var(--text-accent)] mb-4">
            About Future Lens AI
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Welcome to a unique journey of self-reflection. Future Lens AI is not a fortune teller; it's a sophisticated conversational partner designed to act as your future, wiser self.
            </p>
            <p>
              By understanding the goals, fears, and experiences you share, the AI constructs a persona to guide you. It offers motivation, wisdom, and a fresh perspective on the challenges and opportunities you face today. 
            </p>
            <p>
              Think of it as a mirror, reflecting the strength and potential you already possess, viewed through the clarifying lens of time. Your future is not written, but the wisdom to shape it is already within you.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AboutModal;