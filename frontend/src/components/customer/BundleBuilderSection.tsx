import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Check, ShoppingBag, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BundleBuilderSectionProps {
  products: Product[];
}

export const BundleBuilderSection: React.FC<BundleBuilderSectionProps> = ({ products }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Pick top 3 complementary items (e.g. Laptop, Keyboard, Hub/Mouse)
  const laptop = products.find((p) => p.categoryId === 1) || products[0];
  const keyboard = products.find((p) => p.categoryId === 4) || products[3] || products[1];
  const accessory = products.find((p) => p.categoryId === 5 || p.categoryId === 3) || products[4] || products[2];

  const bundleItems = [laptop, keyboard, accessory].filter(Boolean);

  const [selectedItems, setSelectedItems] = useState<number[]>(bundleItems.map((p) => p.id));
  const [bundleAdded, setBundleAdded] = useState(false);

  const toggleItem = (id: number) => {
    if (selectedItems.includes(id)) {
      if (selectedItems.length <= 1) {
        showToast('At least one item must remain in your custom bundle', 'info');
        return;
      }
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const activeProducts = bundleItems.filter((p) => selectedItems.includes(p.id));
  const regularTotal = activeProducts.reduce((sum, p) => sum + p.finalPrice, 0);
  const bundleDiscountPercentage = activeProducts.length >= 3 ? 12 : activeProducts.length === 2 ? 8 : 0;
  const bundleDiscountAmount = Math.round((regularTotal * bundleDiscountPercentage) / 100);
  const bundleFinalPrice = regularTotal - bundleDiscountAmount;

  const handleAddBundleToCart = async () => {
    for (const p of activeProducts) {
      await addItem(p.id, 1);
    }
    setBundleAdded(true);
    showToast(`Added ${activeProducts.length} curated items to your cart!`, 'success', 'Bundle Added');
    setTimeout(() => setBundleAdded(false), 2500);
  };

  if (bundleItems.length < 2) return null;

  return (
    <section className="relative rounded-[36px] bg-[#F2EDE2] border border-black/[0.07] p-8 sm:p-12 overflow-hidden shadow-prem-sm">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-crimson/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-gold/[0.06] blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-txt-secondary text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-crimson" />
              <span className="uppercase text-[10px] tracking-wider font-bold">Curated Hardware Suite</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-txt-primary leading-tight">
              Complete the Look: <span className="text-brand-crimson italic">The Ultimate Creator Setup</span>
            </h2>
            <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
              Pair your machine with studio-grade peripherals for instant desktop cohesion. Bundle 3 items to save an extra 12%.
            </p>
          </div>

          {bundleDiscountPercentage > 0 && (
            <div className="px-4 py-2 rounded-2xl bg-brand-crimson/10 border border-brand-crimson/20 text-brand-crimson text-xs font-bold self-start md:self-auto">
              🔥 Bundle Bonus: Save {bundleDiscountPercentage}% (₹{bundleDiscountAmount.toLocaleString()})
            </div>
          )}
        </div>

        {/* Bundle Items Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Products Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bundleItems.map((item, idx) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`relative p-5 rounded-3xl cursor-pointer transition-all duration-200 border bg-white flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-crimson shadow-prem-md ring-2 ring-brand-crimson/15'
                      : 'border-black/[0.08] opacity-60 hover:opacity-100 hover:border-black/[0.2]'
                  }`}
                >
                  {/* Select Checkbox Indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">
                      {idx === 0 ? 'Step 1: Core' : idx === 1 ? 'Step 2: Control' : 'Step 3: Expansion'}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-brand-crimson text-white'
                          : 'bg-black/5 text-transparent border border-black/10'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="h-36 w-full rounded-2xl bg-[#FAF7F2] p-3 flex items-center justify-center mb-3">
                    <img
                      src={item.mainImageUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h4 className="text-xs font-bold text-txt-primary line-clamp-1 mb-1">
                      {item.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-txt-primary font-sans">
                        ₹{item.finalPrice.toLocaleString()}
                      </span>
                      {item.discountPercentage > 0 && (
                        <span className="text-[11px] text-txt-muted line-through">
                          ₹{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bundle Summary & Add-all CTA */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08] shadow-prem-md space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                Bundle Breakdown ({activeProducts.length} Items)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-txt-primary font-sans">
                ₹{bundleFinalPrice.toLocaleString()}
              </div>
              {bundleDiscountAmount > 0 && (
                <div className="text-xs text-brand-crimson font-bold flex items-center gap-1.5 pt-0.5">
                  <span className="line-through text-txt-muted font-normal">₹{regularTotal.toLocaleString()}</span>
                  <span>Instant ₹{bundleDiscountAmount.toLocaleString()} Bundle Savings</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs divide-y divide-black/[0.05] pt-1">
              {activeProducts.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between text-txt-secondary">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="font-bold text-txt-primary whitespace-nowrap font-mono text-[11px]">
                    ₹{p.finalPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddBundleToCart}
              disabled={activeProducts.length === 0}
              className={`w-full py-3.5 prem-btn-primary text-xs font-bold transition-all shadow-md ${
                bundleAdded ? 'bg-[#2A7B4C] hover:bg-[#2A7B4C]' : ''
              }`}
            >
              {bundleAdded ? (
                <>
                  <Check className="w-4 h-4" /> Bundle Added to Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add Complete Bundle to Bag
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
