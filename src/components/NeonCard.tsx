import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'magenta' | 'green' | 'blue' | 'white';
}

export const NeonCard = ({ children, className = '', glowColor = 'cyan' }: NeonCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const colors = {
    cyan: { rgb: '0, 255, 255', hsl: '180, 100%, 50%' },
    magenta: { rgb: '255, 0, 255', hsl: '300, 100%, 50%' },
    green: { rgb: '34, 197, 94', hsl: '142, 71%, 45%' },
    blue: { rgb: '34, 197, 94', hsl: '142, 71%, 45%' },
    white: { rgb: '34, 197, 94', hsl: '142, 71%, 45%' },
  };

  const color = colors[glowColor];

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Hover effect
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);

    return () => {
      gsap.killTweensOf(card);
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color.rgb]);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-lg border-2 backdrop-blur-md overflow-hidden ${className}`}
      style={{
        borderColor: `rgba(${color.rgb}, 0.5)`,
        background: `
          radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(${color.rgb}, 0.1),
            transparent 40%
          ),
          rgba(13, 13, 13, 0.8)
        `,
        boxShadow: 'none',
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
        style={{ borderColor: `rgba(${color.rgb}, 0.8)` }}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
        style={{ borderColor: `rgba(${color.rgb}, 0.8)` }}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
        style={{ borderColor: `rgba(${color.rgb}, 0.8)` }}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
        style={{ borderColor: `rgba(${color.rgb}, 0.8)` }}
      />

      {children}
    </div>
  );
};
