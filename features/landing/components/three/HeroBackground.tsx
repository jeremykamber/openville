"use client";

import { useEffect, useRef } from "react";

/**
 * HeroBackground — Lightweight Canvas2D particle field.
 *
 * Replaces the Three.js ParticleNebula (~500KB bundle) with a plain
 * <canvas> that draws ~200 drifting dots in monochrome. Runs a single
 * rAF loop, respects prefers-reduced-motion, and pauses when the
 * canvas is not visible (IntersectionObserver).
 *
 * Why Canvas2D over Three.js:
 * - ~0KB additional bundle (Canvas2D is native)
 * - No WebGL context overhead
 * - 200 particles vs 1800 — visually similar from a distance
 * - GPU compositing via CSS `will-change: transform` on the canvas
 *
 * Trade-offs:
 * - Less "3D" depth feel — mitigated by size attenuation and opacity layers
 * - No additive blending — mitigated by varying opacity per particle
 */

const PARTICLE_COUNT = 180;
const BASE_SPEED = 0.15;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Gaussian-ish distribution toward center using rejection sampling
    const cx = width / 2;
    const cy = height / 2;
    const angle = Math.random() * Math.PI * 2;
    const dist =
      Math.sqrt(-2 * Math.log(Math.max(Math.random(), 0.001))) * 0.3;
    const x = cx + Math.cos(angle) * dist * width * 0.5;
    const y = cy + Math.sin(angle) * dist * height * 0.5;

    // Slow orbital drift
    const orbitAngle = Math.atan2(y - cy, x - cx);
    const speed = BASE_SPEED * (0.3 + Math.random() * 0.7);

    particles.push({
      x,
      y,
      vx: -Math.sin(orbitAngle) * speed,
      vy: Math.cos(orbitAngle) * speed * 0.6,
      radius: 0.5 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.5,
    });
  }
  return particles;
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Respect reduced motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Size canvas to its CSS dimensions
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-create particles on resize to match new dimensions
      particlesRef.current = createParticles(rect.width, rect.height);
    }

    resize();
    window.addEventListener("resize", resize);

    // Pause when offscreen
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    let lastTime = 0;

    function draw(time: number) {
      animRef.current = requestAnimationFrame(draw);

      if (!isVisible || !canvas || !ctx) return;

      const delta = lastTime === 0 ? 16 : Math.min(time - lastTime, 50);
      lastTime = time;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, w, h);

      const dtFactor = delta / 16.667;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * dtFactor;
        p.y += p.vy * dtFactor;

        // Gentle pull toward center
        const cx = w / 2;
        const cy = h / 2;
        p.x += (cx - p.x) * 0.0002 * dtFactor;
        p.y += (cy - p.y) * 0.0002 * dtFactor;

        // Wrap around edges with padding
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      }
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
      style={{ willChange: "transform" }}
    />
  );
}
