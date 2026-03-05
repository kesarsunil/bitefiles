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
      {/* White/Gray Orbs */}
      <div className="floating-shape absolute w-32 h-32 rounded-full bg-white/20 blur-xl" 
           style={{ boxShadow: '0 0 60px rgba(255, 255, 255, 0.4)' }} />
      <div className="floating-shape absolute w-48 h-48 rounded-full bg-white/15 blur-2xl" 
           style={{ boxShadow: '0 0 80px rgba(255, 255, 255, 0.3)' }} />
      <div className="floating-shape absolute w-40 h-40 rounded-full bg-white/20 blur-xl" 
           style={{ boxShadow: '0 0 70px rgba(255, 255, 255, 0.35)' }} />
      
      {/* Light Gray Orbs */}
      <div className="floating-shape absolute w-36 h-36 rounded-full bg-gray-300/20 blur-xl"
           style={{ boxShadow: '0 0 60px rgba(200, 200, 200, 0.4)' }} />
      <div className="floating-shape absolute w-44 h-44 rounded-full bg-gray-200/15 blur-2xl"
           style={{ boxShadow: '0 0 80px rgba(200, 200, 200, 0.3)' }} />
      <div className="floating-shape absolute w-52 h-52 rounded-full bg-gray-300/15 blur-2xl"
           style={{ boxShadow: '0 0 90px rgba(200, 200, 200, 0.25)' }} />
      
      {/* Dark Gray Accents */}
      <div className="floating-shape absolute w-40 h-40 rounded-full bg-gray-400/20 blur-xl"
           style={{ boxShadow: '0 0 65px rgba(150, 150, 150, 0.4)' }} />
      <div className="floating-shape absolute w-56 h-56 rounded-full bg-gray-500/15 blur-2xl"
           style={{ boxShadow: '0 0 100px rgba(120, 120, 120, 0.25)' }} />
      
      {/* Bright White Accents */}
      <div className="floating-shape absolute w-32 h-32 rounded-full bg-white/20 blur-xl"
           style={{ boxShadow: '0 0 60px rgba(255, 255, 255, 0.35)' }} />
      
      {/* Grayscale Geometric SVG Shapes */}
      <svg className="floating-shape absolute w-[300px] h-[300px]" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="grayscaleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#cccccc', stopOpacity: 0.4 }} />
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
          stroke="url(#grayscaleGrad1)"
          strokeWidth="2"
          filter="url(#glow)"
          d="M100,20 L140,60 L140,100 L100,140 L60,100 L60,60 Z"
        />
      </svg>

      <svg className="floating-shape absolute w-[250px] h-[250px]" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="grayscaleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#cccccc', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="none"
          stroke="url(#grayscaleGrad2)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="url(#grayscaleGrad2)"
          strokeWidth="1"
          filter="url(#glow)"
        />
      </svg>

      {/* Diamond shapes */}
      <div className="floating-shape absolute w-24 h-24 bg-gradient-to-br from-white/30 to-transparent blur-lg rotate-45" 
           style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      <div className="floating-shape absolute w-32 h-32 bg-gradient-to-br from-gray-300/30 to-transparent blur-lg rotate-12" 
           style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
    </div>
  );
};
