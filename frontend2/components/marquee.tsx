import React, { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({ 
  text = '', 
  speed = 300, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [duplicateText, setDuplicateText] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const checkIfShouldScroll = () => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const textWidth = textRef.current?.clientWidth ?? 0;
      setShouldScroll(textWidth > containerWidth);
      setDuplicateText(textWidth > containerWidth);
    };

    checkIfShouldScroll();
    window.addEventListener('resize', checkIfShouldScroll); 

    return () => {
      window.removeEventListener('resize', checkIfShouldScroll);
    };
  }, [text]);

  // Calculate animation duration based on text length, with a minimum duration
  const animationDuration = Math.max(text?.length ?? 0, 1) * speed;

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
    >
      <div
        ref={textRef}
        className={`inline-block ${shouldScroll ? 'animate-marquee' : ''}`}
        style={{
          animationDuration: `${animationDuration}ms`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite'
        }}
      >
        {duplicateText ? (
          <span>{text}{text}</span>
        ):(
          <span>{text.substring(0, text.length - 2)}</span>
        )}
      </div>
    </div>
  );
};

export default Marquee;
