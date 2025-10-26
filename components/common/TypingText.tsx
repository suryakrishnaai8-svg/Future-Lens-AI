import React, { useState, useEffect, useRef } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
}

const TypingText: React.FC<TypingTextProps> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const textElementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);
  
  // Effect for auto-scrolling as the text wraps
  useEffect(() => {
    if (textElementRef.current) {
      const chatContainer = textElementRef.current.closest('[data-scroll-container]');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [displayedText]);

  return (
    <p ref={textElementRef} className="whitespace-pre-wrap leading-relaxed">
      {/* Use a non-breaking space as a placeholder to prevent the bubble from collapsing while empty */}
      {displayedText || '\u00A0'}
    </p>
  );
};

export default TypingText;