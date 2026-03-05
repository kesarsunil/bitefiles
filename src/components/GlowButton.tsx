import { useEffect, useRef, ButtonHTMLAttributes } from 'react';
import { gsap } from 'gsap';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const GlowButton = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: GlowButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const colors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    danger: '#ef4444',
  };

  useEffect(() => {
    if (!buttonRef.current || !glowRef.current) return;

    const button = buttonRef.current;
    const glow = glowRef.current;

    const handleMouseEnter = () => {
      gsap.to(glow, {
        opacity: 0.8,
        scale: 1.3,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(glow, {
        opacity: 0.4,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(glow, {
        x: x - 50,
        y: y - 50,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('mousemove', handleMouseMove);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('mousemove', handleMouseMove);
    };
  }, [variant]);

  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div
        ref={glowRef}
        className="absolute w-24 h-24 rounded-full blur-xl pointer-events-none"
        style={{
          backgroundColor: colors[variant],
          opacity: 0.4,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
};
