import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface PremiumCard3DProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const PremiumCard3D = ({ children, className = '', delay = 0 }: PremiumCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const overlay = overlayRef.current;
    if (!card || !glow || !overlay) return;

    // Initial entrance animation
    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 60,
        rotateX: -15,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 1.2,
        delay: delay,
        ease: 'power4.out',
      }
    );

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Move glow effect
      gsap.to(glow, {
        x: x - 100,
        y: y - 100,
        opacity: 0.6,
        scale: 1.5,
        duration: 0.3,
      });

      // Move overlay gradient
      gsap.to(overlay, {
        background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)`,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.to(glow, {
        opacity: 0,
        scale: 1,
        duration: 0.3,
      });

      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
      });
    };

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [delay]);

  return (
    <div className="relative perspective-1000">
      <div
        ref={cardRef}
        className={`relative transform-gpu transition-all duration-300 ${className}`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect */}
        <div
          ref={glowRef}
          className="hidden"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent)',
            transform: 'translateZ(-10px)',
          }}
        />
        
        {/* Overlay gradient */}
        <div
          ref={overlayRef}
          className="hidden"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
            transform: 'translateZ(1px)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Shine effect */}
        <div
          className="hidden"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 60%, transparent 100%)',
            backgroundSize: '200% 200%',
            animation: 'shine 3s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
};
