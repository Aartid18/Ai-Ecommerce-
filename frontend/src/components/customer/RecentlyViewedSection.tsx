import React, { useRef } from 'react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { History, ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';

export const RecentlyViewedSection: React.FC = () => {
  const { recentlyViewed } = useRecentlyViewed();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  const handleScroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = dir === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-txt-primary">Recently Viewed</h2>
            <p className="text-xs text-txt-muted">Pick up where you left off</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-full bg-white border border-black/[0.08] hover:border-brand-crimson text-txt-secondary hover:text-txt-primary shadow-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-full bg-white border border-black/[0.08] hover:border-brand-crimson text-txt-secondary hover:text-txt-primary shadow-sm transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recentlyViewed.map((item) => (
          <div
            key={item.id}
            className="w-64 flex-shrink-0 prem-card p-4 rounded-3xl bg-white border border-black/[0.07] flex flex-col justify-between shadow-prem-sm hover:shadow-prem-md transition-all group"
          >
            <Link to={`/customer/product/${item.id}`} className="block">
              <div className="h-36 rounded-2xl bg-[#FAF7F2] p-2 flex items-center justify-center mb-3 overflow-hidden">
                <img
                  src={item.mainImageUrl}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="text-[10px] font-bold text-txt-muted uppercase tracking-wider mb-0.5">
                {item.brandName || item.categoryName}
              </div>
              <h4 className="text-xs font-bold text-txt-primary line-clamp-1 group-hover:text-brand-crimson transition-colors">
                {item.name}
              </h4>
              <div className="text-xs font-bold text-txt-primary mt-1 font-sans">
                ₹{item.finalPrice.toLocaleString()}
              </div>
            </Link>

            <button
              onClick={() => {
                addItem(item.id, 1);
                showToast(`Added ${item.name} to cart!`, 'success');
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-full bg-[#FAF7F2] hover:bg-brand-crimson hover:text-white text-txt-primary text-xs font-semibold border border-black/[0.06] transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3 h-3" /> Quick Add
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
