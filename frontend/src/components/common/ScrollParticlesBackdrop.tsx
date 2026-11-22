import React, { useEffect, useRef } from 'react';

interface ClinicalParticle {
  xRatio: number;
  yRatio: number;
  size: number;
  speed: number;
  kind: 'dot' | 'cross' | 'ring';
  alpha: number;
}

const PARTICLES: ClinicalParticle[] = [
  { xRatio: 0.08, yRatio: 0.14, size: 5, speed: 0.12, kind: 'cross', alpha: 0.18 },
  { xRatio: 0.22, yRatio: 0.38, size: 2.5, speed: 0.08, kind: 'dot', alpha: 0.22 },
  { xRatio: 0.36, yRatio: 0.18, size: 7, speed: 0.16, kind: 'ring', alpha: 0.13 },
  { xRatio: 0.51, yRatio: 0.52, size: 4.5, speed: 0.1, kind: 'cross', alpha: 0.15 },
  { xRatio: 0.67, yRatio: 0.22, size: 2.5, speed: 0.14, kind: 'dot', alpha: 0.2 },
  { xRatio: 0.82, yRatio: 0.44, size: 6, speed: 0.09, kind: 'cross', alpha: 0.16 },
  { xRatio: 0.91, yRatio: 0.16, size: 8, speed: 0.18, kind: 'ring', alpha: 0.12 },
  { xRatio: 0.14, yRatio: 0.72, size: 6, speed: 0.15, kind: 'ring', alpha: 0.12 },
  { xRatio: 0.31, yRatio: 0.84, size: 4.5, speed: 0.11, kind: 'cross', alpha: 0.16 },
  { xRatio: 0.59, yRatio: 0.78, size: 2.5, speed: 0.13, kind: 'dot', alpha: 0.2 },
  { xRatio: 0.76, yRatio: 0.68, size: 5, speed: 0.15, kind: 'cross', alpha: 0.14 },
  { xRatio: 0.89, yRatio: 0.86, size: 3, speed: 0.09, kind: 'dot', alpha: 0.18 },
];

/**
 * Minimalist, well-spaced editorial clinical geometry behind content.
 * Smoothly couples vertical parallax to scroll position via rAF and disables under prefers-reduced-motion.
 */
export const ScrollParticlesBackdrop: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      currentScroll += (targetScroll - currentScroll) * 0.12;

      for (const p of PARTICLES) {
        const px = p.xRatio * w;
        const rawY = p.yRatio * h - currentScroll * p.speed;
        const py = ((rawY % (h + 40)) + (h + 40)) % (h + 40) - 20;

        ctx.save();
        ctx.strokeStyle = `rgba(14, 111, 101, ${p.alpha})`;
        ctx.fillStyle = `rgba(13, 31, 38, ${p.alpha})`;
        ctx.lineWidth = 1;

        if (p.kind === 'dot') {
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'ring') {
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(px - p.size, py);
          ctx.lineTo(px + p.size, py);
          ctx.moveTo(px, py - p.size);
          ctx.lineTo(px, py + p.size);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (Math.abs(targetScroll - currentScroll) > 0.25) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        rafId = 0;
      }
    };

    const onScroll = () => {
      targetScroll = window.scrollY;
      if (!rafId) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 w-full h-full z-0 ${className}`}
    />
  );
};

export default ScrollParticlesBackdrop;
