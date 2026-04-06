"use client";

import { useRef, useEffect } from "react";

interface ParticleCanvasProps {
  color?: string;
  lineColor?: string;
  touchLineColor?: string;
  particleCount?: number;
}

export default function ParticleCanvas({
  color = "rgba(220, 20, 60, 1)",
  lineColor = "rgba(220, 20, 60, {o})",
  touchLineColor = "rgba(255, 120, 120, {o})",
  particleCount,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let animId: number;
    const pointer = {
      x: null as number | null,
      y: null as number | null,
      radius: 140,
      active: false,
    };

    const c = canvas;

    class Particle {
      x: number; y: number; dx: number; dy: number; size: number;

      constructor() {
        this.size = Math.random() * 2.5 + 1.2;
        this.x = Math.random() * (c.width - this.size * 2) + this.size;
        this.y = Math.random() * (c.height - this.size * 2) + this.size;
        this.dx = (Math.random() - 0.5) * 0.4;
        this.dy = (Math.random() - 0.5) * 0.4;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      update() {
        if (this.x > c.width || this.x < 0) this.dx = -this.dx;
        if (this.y > c.height || this.y < 0) this.dy = -this.dy;

        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pointer.radius + this.size) {
            const force = (pointer.radius - dist) / pointer.radius;
            this.x -= (dx / dist) * force * 5;
            this.y -= (dy / dist) * force * 5;
          }
        }

        this.x += this.dx;
        this.y += this.dy;
        this.draw();
      }
    }

    let particles: Particle[] = [];

    function init() {
      particles = [];
      // Меньше частиц на мобильных для производительности
      const density = c.width < 768 ? 7000 : 9000;
      const n = particleCount ?? Math.floor((c.width * c.height) / density);
      for (let i = 0; i < n; i++) particles.push(new Particle());
    }

    function connect() {
      // Порог соединения — чуть больше для заметности
      const threshold = (c.width / 6.5) * (c.height / 6.5);
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const distSq =
            (particles[a].x - particles[b].x) ** 2 +
            (particles[a].y - particles[b].y) ** 2;
          if (distSq < threshold) {
            // Линейное затухание — у центра ярче
            const opacity = Math.max(0, 1 - distSq / threshold);

            const px = pointer.x;
            const py = pointer.y;
            const nearPointer =
              px !== null &&
              py !== null &&
              Math.sqrt((particles[a].x - px) ** 2 + (particles[a].y - py) ** 2) <
                pointer.radius * 1.5;

            const strokeColor = nearPointer
              ? touchLineColor.replace("{o}", String(Math.min(1, opacity * 1.4).toFixed(3)))
              : lineColor.replace("{o}", String(Math.min(1, opacity * 1.1).toFixed(3)));

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = nearPointer ? 1.8 : 1.2;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, c.width, c.height);
      particles.forEach((p) => p.update());
      connect();
    }

    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      init();
    }

    // Mouse
    const onMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onMouseOut = () => {
      pointer.x = null;
      pointer.y = null;
      pointer.active = false;
    };

    // Touch — берём первый палец
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
      pointer.active = true;
    };
    const onTouchEnd = () => {
      // Плавное «отпускание» — частицы не сразу успокаиваются,
      // поэтому координаты оставляем ещё 400ms потом сбрасываем
      setTimeout(() => {
        pointer.x = null;
        pointer.y = null;
        pointer.active = false;
      }, 400);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseOut);
    // passive: false чтобы разрешить preventDefault (иначе скролл мешает)
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [color, lineColor, touchLineColor, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full touch-none"
      aria-hidden="true"
    />
  );
}
