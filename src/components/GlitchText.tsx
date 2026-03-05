import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GlitchText = ({ children, className = '' }: GlitchTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const glitch = () => {
      const tl = gsap.timeline();
      
      tl.to(text, {
        x: Math.random() * 4 - 2,
        duration: 0.05,
        repeat: 3,
        yoyo: true,
      })
      .to(text, {
        x: 0,
        duration: 0.05,
      });

      // Random interval between glitches
      const nextGlitch = Math.random() * 3000 + 2000;
      setTimeout(glitch, nextGlitch);
    };

    const timeout = setTimeout(glitch, Math.random() * 2000);

    return () => {
      clearTimeout(timeout);
      gsap.killTweensOf(text);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={textRef} className="relative z-10">
        {children}
      </div>
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          color: '#ffffff',
          mixBlendMode: 'screen',
          clipPath: 'inset(0 0 50% 0)',
        }}
        aria-hidden="true"
      >
        {children}
      </div>
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          color: '#cccccc',
          mixBlendMode: 'screen',
          clipPath: 'inset(50% 0 0 0)',
        }}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
};
