import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const Scanlines = () => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Animate scanline movement
    gsap.to(overlay, {
      backgroundPosition: '0 100%',
      duration: 10,
      repeat: -1,
      ease: 'none',
    });
  }, []);

  return (
    <>
      {/* Static scanlines */}
      <div
        ref={overlayRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.03) 0px,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px,
            transparent 2px
          )`,
          backgroundSize: '100% 4px',
        }}
      />
      
      {/* CRT flicker effect */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-10"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(0, 50, 0, 0.3) 100%)`,
          animation: 'flicker 0.15s infinite',
        }}
      />
      
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.08; }
        }
      `}</style>
    </>
  );
};
