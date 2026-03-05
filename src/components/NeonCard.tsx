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
    green: { rgb: '255, 255, 255', hsl: '0, 0%, 100%' }, // Changed to white
    blue: { rgb: '0, 157, 255', hsl: '204, 100%, 50%' },
    white: { rgb: '255, 255, 255', hsl: '0, 0%, 100%' },
  };

  const color = colors[glowColor];

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Pulse animation
    gsap.to(card, {
      boxShadow: `
        0 0 20px rgba(${color.rgb}, 0.3),
        0 0 40px rgba(${color.rgb}, 0.2),
        0 0 60px rgba(${color.rgb}, 0.1),
        inset 0 0 20px rgba(${color.rgb}, 0.05)
      `,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

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
        boxShadow: `
          0 0 20px rgba(${color.rgb}, 0.2),
          0 0 40px rgba(${color.rgb}, 0.1),
          inset 0 0 20px rgba(${color.rgb}, 0.05)
        `,
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
