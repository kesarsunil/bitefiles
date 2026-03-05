import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface AnimatedStatProps {
  value: string | number;
  label: string;
  icon: ReactNode;
  color: string;
  delay?: number;
}

export const AnimatedStat = ({ value, label, icon, color, delay = 0 }: AnimatedStatProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const valueElement = valueRef.current;
    const iconElement = iconRef.current;
    const glowElement = glowRef.current;

    if (!container || !valueElement || !iconElement || !glowElement) return;

    // Entrance animation with cyberpunk flair
    const tl = gsap.timeline({ delay });

    tl.fromTo(
      container,
      {
        opacity: 0,
        scale: 0.8,
        rotateY: -90,
      },
      {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
      }
    );

    // Animate number counting if it's a number
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      const obj = { val: 0 };
      
      tl.to(
        obj,
        {
          val: numValue,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            valueElement.textContent = Math.round(obj.val).toLocaleString();
          },
        },
        '-=0.5'
      );
    }

    // Icon animation with cyberpunk spin
    tl.fromTo(
      iconElement,
      {
        scale: 0,
        rotation: -360,
      },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'back.out(2)',
      },
      '-=1'
    );

    // Continuous neon glow pulse
    gsap.to(glowElement, {
      scale: 1.2,
      opacity: 0.6,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(container, {
        y: -8,
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(iconElement, {
        rotation: 360,
        scale: 1.2,
        duration: 0.6,
        ease: 'back.out(2)',
      });

      gsap.to(glowElement, {
        scale: 1.5,
        opacity: 0.8,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(container, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(iconElement, {
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      });

      gsap.to(glowElement, {
        scale: 1.2,
        opacity: 0.6,
        duration: 0.3,
      });
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    };
  }, [value, delay]);

  return (
    <div
      ref={containerRef}
      className="relative group cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Neon Glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl blur-2xl opacity-60"
        style={{
          background: `radial-gradient(circle, ${color}80, ${color}20)`,
          transform: 'translateZ(-20px)',
          boxShadow: `0 0 40px ${color}80`,
        }}
      />

      {/* Cyberpunk Card */}
      <div 
        className="relative rounded-2xl p-6 shadow-2xl border-2 backdrop-blur-md overflow-hidden"
        style={{
          background: 'rgba(13, 13, 13, 0.85)',
          borderColor: `${color}80`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}10`,
        }}
      >
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl">
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(45deg, ${color}00, ${color}60, ${color}00)`,
              backgroundSize: '200% 200%',
              animation: 'borderFlow 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Corner accents */}
        <div 
          className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2"
          style={{ borderColor: color }}
        />
        <div 
          className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2"
          style={{ borderColor: color }}
        />
        <div 
          className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2"
          style={{ borderColor: color }}
        />
        <div 
          className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2"
          style={{ borderColor: color }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div
            ref={iconRef}
            className="text-5xl mb-4 inline-block"
            style={{
              filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 4px 8px ${color}60)`,
            }}
          >
            {icon}
          </div>

          {/* Value */}
          <div
            ref={valueRef}
            className="text-4xl font-bold mb-2"
            style={{
              color: '#ffffff',
              textShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
            }}
          >
            {value}
          </div>

          {/* Label */}
          <div 
            className="text-sm font-medium uppercase tracking-wide"
            style={{
              color: '#ffffff',
            }}
          >
            {label}
          </div>
        </div>

        {/* Scanning lines effect */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${color}15 2px,
              ${color}15 4px
            )`,
            animation: 'scanlineMove 10s linear infinite',
          }}
        />
      </div>
      
      <style>{`
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
