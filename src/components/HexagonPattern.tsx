import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const HexagonPattern = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hexagons = container.querySelectorAll('.hexagon');

    hexagons.forEach((hex, index) => {
      // Random pulse animation
      gsap.to(hex, {
        opacity: Math.random() * 0.5 + 0.1,
        scale: Math.random() * 0.2 + 0.9,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.1,
      });

      // Random glow
      gsap.to(hex, {
        filter: `drop-shadow(0 0 ${Math.random() * 20 + 5}px rgba(255, 255, 255, 0.6))`,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.05,
      });
    });

    return () => {
      gsap.killTweensOf(hexagons);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20"
    >
      {Array.from({ length: 30 }).map((_, i) => (
        <svg
          key={i}
          className="hexagon absolute"
          width="100"
          height="100"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id={`hexGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#cccccc', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
          <polygon
            points="50 5, 93.3 25, 93.3 75, 50 95, 6.7 75, 6.7 25"
            stroke={`url(#hexGrad${i})`}
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ))}
    </div>
  );
};
