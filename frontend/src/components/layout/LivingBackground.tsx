import React, { useEffect, useState } from 'react';

export const LivingBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Multi-plane parallax offset
      const x = (e.clientX / window.innerWidth - 0.5);
      const y = (e.clientY / window.innerHeight - 0.5);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-warm-editorial"
      aria-hidden="true"
    >
      {/* 1. Subtle Radial Ambient Lighting */}
      <div
        className="absolute top-[-15%] right-[10%] w-[700px] h-[700px] rounded-full bg-brand-crimson/[0.045] blur-[140px]"
        style={{
          transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 10}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        className="absolute top-[40%] left-[-12%] w-[600px] h-[600px] rounded-full bg-brand-gold/[0.04] blur-[130px]"
        style={{
          transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[25%] w-[650px] h-[650px] rounded-full bg-brand-crimson/[0.035] blur-[150px]"
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* 2. Abstract 3D Geometric Objects & Organic Ribbons (Purely Decorative) */}
      <div
        className="absolute top-[12%] right-[5%] w-72 h-72 rounded-full border border-brand-crimson/10 bg-gradient-to-br from-brand-crimson/[0.03] to-transparent backdrop-blur-[1px] animate-float-1 hidden md:block"
        style={{
          transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`,
        }}
      />

      <div
        className="absolute top-[35%] left-[3%] w-56 h-56 rounded-full border border-brand-gold/15 bg-gradient-to-tr from-brand-gold/[0.04] to-transparent animate-float-2 hidden md:block"
        style={{
          transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * 4}px, 0)`,
        }}
      />

      {/* Slowly Rotating Gold Torus / Wire Ring */}
      <div
        className="absolute bottom-[20%] right-[12%] w-64 h-64 rounded-full border-2 border-dashed border-brand-gold/20 animate-spin-slow hidden lg:block"
        style={{
          transform: `translate3d(${mousePos.x * 5}px, ${mousePos.y * 5}px, 0)`,
        }}
      />

      {/* 3. Floating Editorial Product Silhouettes (Off-Screen Bleed, Soft Opacity) */}
      <div className="hidden lg:block">
        {/* Top Right: Bose Headphones Silhouette */}
        <div
          className="absolute top-[6%] -right-16 w-[420px] h-[420px] opacity-[0.08] filter blur-[1px] animate-float-1"
          style={{
            transform: `translate3d(${mousePos.x * 7}px, ${mousePos.y * 7}px, 0)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
          />
        </div>

        {/* Bottom Left: ThinkPad Laptop Silhouette */}
        <div
          className="absolute bottom-[10%] -left-20 w-[450px] h-[320px] opacity-[0.07] filter blur-[1.5px] animate-float-2"
          style={{
            transform: `translate3d(${mousePos.x * 5}px, ${mousePos.y * 5}px, 0)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
          />
        </div>

        {/* Bottom Right: Apple Watch Ultra Silhouette */}
        <div
          className="absolute bottom-[4%] right-[30%] w-[280px] h-[280px] opacity-[0.06] filter blur-[0.8px] animate-float-3"
          style={{
            transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
          />
        </div>

        {/* Top Left: Mechanical Keyboard Silhouette */}
        <div
          className="absolute top-[22%] -left-12 w-[340px] h-[220px] opacity-[0.06] filter blur-[1px] animate-float-3"
          style={{
            transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
          />
        </div>
      </div>

      {/* 4. Elegant Editorial Curve Vector Dividers */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100,200 Q400,600 1200,100 T2400,500"
          fill="none"
          stroke="#A81420"
          strokeWidth="1.5"
        />
        <path
          d="M-50,800 Q600,400 1400,900 T2200,600"
          fill="none"
          stroke="#C59A52"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
