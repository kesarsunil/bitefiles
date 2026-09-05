import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const FloatingShapes = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const shapes = container.querySelectorAll('.floating-shape');

    shapes.forEach((shape, index) => {
      // Random starting position
      gsap.set(shape, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.3 + 0.1,
      });

      // Floating animation
      gsap.to(shape, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        rotation: `+=${Math.random() * 180 - 90}`,
        duration: Math.random() * 10 + 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5,
      });

      // Pulsing scale
      gsap.to(shape, {
        scale: `+=${Math.random() * 0.3 + 0.2}`,
        duration: Math.random() * 5 + 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.3,
      });

      // Color shifting
      gsap.to(shape, {
        opacity: Math.random() * 0.4 + 0.2,
        duration: Math.random() * 4 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.4,
      });
    });

    return () => {
      gsap.killTweensOf(shapes);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
       {/* Subtle green atmosphere, kept dark so the wall remains clear */}
       <div className="floating-shape absolute w-32 h-32 rounded-full bg-green-950/30 blur-xl" />
       <div className="floating-shape absolute w-48 h-48 rounded-full bg-green-900/20 blur-2xl" />
       <div className="floating-shape absolute w-40 h-40 rounded-full bg-green-950/25 blur-xl" />
       <div className="floating-shape absolute w-36 h-36 rounded-full bg-emerald-950/25 blur-xl" />
       <div className="floating-shape absolute w-44 h-44 rounded-full bg-green-950/20 blur-2xl" />
       <div className="floating-shape absolute w-52 h-52 rounded-full bg-emerald-950/20 blur-2xl" />
       <div className="floating-shape absolute w-40 h-40 rounded-full bg-green-950/25 blur-xl" />
       <div className="floating-shape absolute w-56 h-56 rounded-full bg-green-950/20 blur-2xl" />
      
      {/* Dark green geometric SVG shapes */}
      <svg className="floating-shape absolute w-[300px] h-[300px]" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="greenGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#064e3b', stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: '#166534', stopOpacity: 0.35 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          fill="none"
          stroke="url(#greenGrad1)"
          strokeWidth="2"
          filter="url(#glow)"
          d="M100,20 L140,60 L140,100 L100,140 L60,100 L60,60 Z"
        />
      </svg>

      <svg className="floating-shape absolute w-[250px] h-[250px]" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="greenGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#166534', stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: '#14532d', stopOpacity: 0.35 }} />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="url(#greenGrad2)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="url(#greenGrad2)"
          strokeWidth="1"
          filter="url(#glow)"
        />
      </svg>

      {/* Diamond shapes */}
      <div className="floating-shape absolute w-24 h-24 bg-gradient-to-br from-green-900/30 to-transparent blur-lg rotate-45" 
           style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      <div className="floating-shape absolute w-32 h-32 bg-gradient-to-br from-emerald-950/30 to-transparent blur-lg rotate-12" 
           style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
    </div>
  );
};
