import React from 'react';
import { Link } from 'react-router-dom';
import { Category, Product } from '../../types';
import { Sparkles, ArrowRight, Zap, TrendingUp, ShieldCheck, Flame } from 'lucide-react';

interface MegaMenuProps {
  categories: Category[];
  featuredProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  categories,
  featuredProducts,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const topProduct = featuredProducts[0];

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-black/[0.08] shadow-2xl z-40 animate-fade-in transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Column 1: Curated Collections & Categories (5 cols) */}
          <div className="col-span-5 space-y-4 border-r border-black/[0.06] pr-8">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                Curated Collections
              </span>
              <Link
                to="/customer/products"
                onClick={onClose}
                className="text-xs font-bold text-brand-crimson hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/customer/products?categoryId=${cat.id}`}
                  onClick={onClose}
                  className="p-3 rounded-2xl hover:bg-[#FAF7F2] transition-all flex items-center justify-between group border border-transparent hover:border-black/[0.05]"
                >
                  <div>
                    <div className="text-xs font-bold text-txt-primary group-hover:text-brand-crimson transition-colors">
                      {cat.name}
                    </div>
                    <div className="text-[11px] text-txt-muted line-clamp-1 mt-0.5">
                      {cat.description || 'Verified hardware essentials'}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-txt-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Marquee Hardware Spotlight (4 cols) */}
          <div className="col-span-4 space-y-4 border-r border-black/[0.06] pr-8">
            <div className="text-[11px] font-bold text-txt-muted uppercase tracking-wider pb-2 border-b border-black/[0.06] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-brand-crimson" />
              <span>Marquee Spotlight</span>
            </div>

            {topProduct && (
              <Link
                to={`/customer/product/${topProduct.id}`}
                onClick={onClose}
                className="block p-4 rounded-3xl bg-[#FAF7F2] border border-black/[0.06] hover:shadow-prem-md transition-all group"
              >
                <div className="h-36 rounded-2xl bg-white p-3 flex items-center justify-center mb-3">
                  <img
                    src={topProduct.mainImageUrl}
                    alt={topProduct.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-brand-crimson text-white text-[9px] font-bold">
                    HOT PICK
                  </span>
                  <span className="text-[10px] text-txt-muted uppercase font-bold">{topProduct.brandName}</span>
                </div>
                <h4 className="text-xs font-bold text-txt-primary line-clamp-1 group-hover:text-brand-crimson transition-colors">
                  {topProduct.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-black text-txt-primary font-sans">
                    ₹{topProduct.finalPrice.toLocaleString()}
                  </span>
                  {topProduct.discountPercentage > 0 && (
                    <span className="text-xs text-brand-crimson font-bold">
                      {Math.round(topProduct.discountPercentage)}% OFF
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>

          {/* Column 3: Platform Signals & Fast Shortcuts (3 cols) */}
          <div className="col-span-3 space-y-4">
            <div className="text-[11px] font-bold text-txt-muted uppercase tracking-wider pb-2 border-b border-black/[0.06]">
              Intelligence Telemetry
            </div>

            <div className="space-y-3 text-xs">
              <Link
                to="/admin/demand-radar"
                onClick={onClose}
                className="p-3 rounded-2xl bg-brand-crimson/5 border border-brand-crimson/15 hover:bg-brand-crimson/10 transition-colors block"
              >
                <div className="flex items-center gap-1.5 text-brand-crimson font-bold text-xs mb-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Demand Radar
                </div>
                <p className="text-[11px] text-txt-secondary leading-tight">
                  Real-time market interest clusters and algorithmic price opportunities.
                </p>
              </Link>

              <Link
                to="/customer/ai-assistant"
                onClick={onClose}
                className="p-3 rounded-2xl bg-[#F2EDE2] border border-black/[0.06] hover:bg-[#EBE4D5] transition-colors block"
              >
                <div className="flex items-center gap-1.5 text-txt-primary font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> AI Shopping Copilot
                </div>
                <p className="text-[11px] text-txt-secondary leading-tight">
                  Ask natural questions to discover compatible hardware pairs.
                </p>
              </Link>

              <div className="pt-2 text-[11px] text-txt-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2A7B4C]" />
                <span>100% verified supply allocation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
