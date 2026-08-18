import React, { useState } from 'react';
import { Mail, Sparkles, Check, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('VIP perks unlocked! Use coupon code WELCOME15 at checkout.', 'success', 'Welcome to the Circle');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME15');
    setCopiedCode(true);
    showToast('Promo code "WELCOME15" copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="relative rounded-[36px] bg-[#141414] text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
      {/* Curved Ambient Lighting Overlays */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-crimson/[0.18] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-gold/[0.12] blur-[90px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span className="uppercase text-[10px] tracking-wider font-bold">Exclusive Collector Access</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif leading-tight">
            Stay ahead of <span className="text-brand-coral italic">price drops & limited drops.</span>
          </h2>

          <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-lg">
            Join 45,000+ engineers and designers receiving real-time hardware restock alerts, algorithmic price-drop forecasts, and member-only pricing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-sage" /> Zero spam guarantee
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-gold" /> Instant 15% discount code
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-xl space-y-4">
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-white/90">
                    Enter your email to unlock VIP perks:
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-white/40 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@work.com"
                      className="w-full bg-white/10 border border-white/20 rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-brand-crimson hover:bg-brand-crimsonHover text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Unlock 15% Member Discount</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-2 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#2A7B4C]/20 border border-[#2A7B4C]/40 text-[#2A7B4C] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-white">You're on the VIP list!</h4>
                  <p className="text-xs text-white/70 mt-1">Here is your exclusive welcome discount:</p>
                </div>

                <div
                  onClick={handleCopyCode}
                  className="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-gold" />
                    <span className="font-mono font-bold tracking-widest text-sm text-brand-gold">WELCOME15</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/80">
                    {copiedCode ? '✓ Copied' : 'Click to Copy'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
