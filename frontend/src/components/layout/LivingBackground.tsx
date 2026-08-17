import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, ShieldCheck, Zap } from 'lucide-react';

export const LivingBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Subtle parallax offset (-3px to +3px)
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
      style={{
        transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Layer 1: Dark Neutral Base is on <body> (#0B0F14) */}

      {/* Layer 2: Subtle Ambient Lighting Orbs */}
      <div className="absolute top-[-10%] right-[15%] w-[650px] h-[650px] rounded-full bg-accent/[0.045] blur-[120px]" />
      <div className="absolute top-[35%] left-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-accent/[0.035] blur-[110px]" />
      <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[130px]" />

      {/* Layer 3: Ultra Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-subtle opacity-70" />

      {/* Layer 4: Floating Product Silhouette Imagery (Low Opacity, Non-Intrusive) */}
      <div className="hidden lg:block">
        {/* Top-Right: ThinkPad Laptop Silhouette */}
        <div className="absolute top-[8%] right-[2%] w-[420px] h-[280px] opacity-[0.09] filter blur-[0.5px] animate-float-1">
          <img
            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-screen rounded-2xl"
            loading="lazy"
          />
        </div>

        {/* Bottom-Left: Bose QuietComfort Headphones */}
        <div className="absolute bottom-[18%] left-[2%] w-[320px] h-[320px] opacity-[0.08] filter blur-[1px] animate-float-2">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-screen rounded-3xl"
            loading="lazy"
          />
        </div>

        {/* Bottom-Right: Apple Watch Ultra 2 */}
        <div className="absolute bottom-[8%] right-[8%] w-[260px] h-[260px] opacity-[0.07] filter blur-[0.8px] animate-float-3">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-screen rounded-2xl"
            loading="lazy"
          />
        </div>

        {/* Top-Left: Mechanical Keyboard Silhouette */}
        <div className="absolute top-[14%] left-[4%] w-[280px] h-[190px] opacity-[0.06] filter blur-[1px] animate-float-3">
          <img
            src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-contain mix-blend-screen rounded-xl"
            loading="lazy"
          />
        </div>
      </div>

      {/* Layer 5: Ambient Floating Commerce Data Signals */}
      <div className="hidden md:block">
        {/* Signal 1: Demand Surge Badge (Top Right) */}
        <div className="absolute top-[22%] right-[18%] p-2.5 rounded-xl bg-surface-card/60 backdrop-blur-md border border-border-primary/50 text-[11px] shadow-2xl opacity-65 animate-float-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
            <span className="text-txt-muted">Demand Score:</span>
            <span className="font-semibold text-accent font-sans flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> 94/100
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-txt-muted">
            <span className="text-txt-secondary font-mono font-medium">ThinkPad X1</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">+18.2% velocity</span>
          </div>
        </div>

        {/* Signal 2: Price Watch Cluster (Bottom Left) */}
        <div className="absolute bottom-[28%] left-[16%] p-2.5 rounded-xl bg-surface-card/50 backdrop-blur-md border border-border-primary/40 text-[11px] shadow-2xl opacity-60 animate-float-1">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-3.5 h-3.5 text-accent" />
            <span className="text-txt-muted">Smart Deal Active:</span>
            <span className="font-semibold text-txt-primary font-mono">₹29,999</span>
          </div>
          <div className="mt-0.5 text-[10px] text-txt-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-accent" />
            <span>18 Price-Watch alerts dispatched</span>
          </div>
        </div>

        {/* Signal 3: Live Inventory Telemetry (Right Mid) */}
        <div className="absolute top-[52%] right-[5%] p-2.5 rounded-xl bg-surface-card/45 backdrop-blur-md border border-border-primary/40 text-[10px] shadow-xl opacity-50 animate-float-3">
          <div className="flex items-center gap-1.5 text-txt-secondary font-medium">
            <ShieldCheck className="w-3 h-3 text-accent" />
            <span>Telemetry: 1,284 Active Watchers</span>
          </div>
          <div className="mt-1 flex items-center gap-1 font-mono text-txt-muted">
            <span>Sales Velocity:</span>
            <span className="text-accent font-bold">6.2 units/day</span>
          </div>
        </div>
      </div>

      {/* Layer 6: Subtle Data Nodes / Constellation Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] animate-particle-drift" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2DD4A8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2DD4A8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="15%" cy="25%" r="2.5" fill="#2DD4A8" />
        <circle cx="28%" cy="18%" r="1.5" fill="#7185D8" />
        <circle cx="85%" cy="30%" r="2" fill="#2DD4A8" />
        <circle cx="72%" cy="45%" r="2.5" fill="#2DD4A8" />
        <circle cx="12%" cy="75%" r="2" fill="#7185D8" />
        <circle cx="88%" cy="80%" r="2" fill="#2DD4A8" />
        <line x1="15%" y1="25%" x2="28%" y2="18%" stroke="#2DD4A8" strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1="85%" y1="30%" x2="72%" y2="45%" stroke="#2DD4A8" strokeWidth="0.75" strokeDasharray="3 3" />
      </svg>
    </div>
  );
};
