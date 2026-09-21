import React, { useEffect, useRef } from 'react';
import SlidingAuthCard from '../auth/SlidingAuthCard';
import { GiCyberEye } from "react-icons/gi"; // ← Added missing import
import Navbar from '../components/Navbar';
function InteractiveParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes configuration
    let particles = [];
    const count = Math.floor((width * height) / 9000); // Responsive particle density

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.radius = Math.random() * 2 + 1.5;
        this.color = Math.random() > 0.5 ? '#8C95A6' : '#5B6475';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce from walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    // Render loop with connecting proximity lines
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect near particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(140, 149, 166, ${0.25 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#F8F9FB',
      }}
    />
  );
}

export default function AuthPage() {
  return (
    
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden select-none p-4">
      {/* 100% Guaranteed Visible Background Canvas */}
      <InteractiveParticles />

      {/* Header Logo */}
      <div className="flex items-center gap-2.5 mb-7 relative z-10">
        <GiCyberEye className='text-[50px]'/>
        <span className="text-4xl font-semibold text-[#1a1a1a] tracking-tight font-sans">
          Secura
        </span>
      </div>

      {/* Foreground Form (z-10 ensures it floats above particles) */}
      <div className="relative z-10">
        <SlidingAuthCard />
      </div>
    </div>
  );
}
