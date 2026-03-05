import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const CyberGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gridSize = 50;
    let time = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.01;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        const alpha = 0.1 + Math.sin(time + x * 0.01) * 0.05;
        const glow = Math.sin(time * 2 + x * 0.02) * 10;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = glow;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        const alpha = 0.1 + Math.sin(time + y * 0.01) * 0.05;
        const glow = Math.sin(time * 2 + y * 0.02) * 10;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = glow;
        ctx.shadowColor = 'rgba(0, 165, 28, 0.5)';
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw intersection points
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const distance = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) + 
            Math.pow(y - canvas.height / 2, 2)
          );
          const pulse = Math.sin(time * 3 - distance * 0.01) * 0.5 + 0.5;
          
          if (pulse > 0.7) {
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.5})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      requestAnimationFrame(drawGrid);
    };

    drawGrid();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
};
