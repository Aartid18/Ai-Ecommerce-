import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onWatchPrice?: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onWatchPrice,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Initialize on open or product change
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.mainImageUrl);
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant?.priceOverride || product.finalPrice;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = currentStock === 0;
  const allImages = [product.mainImageUrl, ...(product.additionalImages || [])];
  const isWish = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product.id, selectedVariant?.id, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-black/[0.08] overflow-hidden animate-fade-in text-txt-primary">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-txt-secondary hover:text-txt-primary flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left: Gallery (5 cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-[#FAF7F2] flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/[0.06]">
            {/* Primary Showcase Image */}
            <div className="relative aspect-square w-full rounded-2xl bg-white flex items-center justify-center p-6 border border-black/[0.04] shadow-sm overflow-hidden">
              <div className="absolute w-44 h-44 rounded-full bg-[#FAF7F2] blur-xl pointer-events-none" />
              <img
                src={selectedImage || product.mainImageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />

              {/* Discount / Demand Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.discountPercentage > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson text-white text-[10px] font-bold shadow-sm">
                    {Math.round(product.discountPercentage)}% OFF
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[10px] font-bold text-txt-secondary uppercase">
                  {product.brandName || 'Verified'}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2.5 pt-4 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl bg-white p-1 border transition-all flex-shrink-0 ${
                      selectedImage === img
                        ? 'border-brand-crimson ring-2 ring-brand-crimson/20 shadow-sm'
                        : 'border-black/[0.08] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase Controls (7 cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                  {product.categoryName}
                </span>
                <div className="flex items-center gap-1 text-brand-gold font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating || 4.8}</span>
                  <span className="text-txt-muted font-normal text-[11px]">({product.reviewCount || 42} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-serif text-txt-primary leading-snug">
                {product.name}
              </h3>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-txt-primary font-sans">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-xs text-txt-muted line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-brand-crimson">
                      Save ₹{(product.price - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-txt-secondary leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                    Select Option:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      let label = v.sku;
                      try {
                        const parsed = JSON.parse(v.attributesJson);
                        label = Object.values(parsed).join(' • ');
                      } catch {
                        label = v.attributesJson || v.sku;
                      }
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selectedVariant?.id === v.id
                              ? 'bg-brand-crimson text-white border-brand-crimson shadow-sm'
                              : 'bg-white text-txt-secondary border-black/[0.12] hover:border-black/[0.25]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-2 text-xs pt-1">
                {isOutOfStock ? (
                  <span className="text-brand-gold font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-gold" /> Available for Pre-Order
                  </span>
                ) : currentStock <= 5 ? (
                  <span className="text-brand-crimson font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse" /> Only {currentStock} left in stock — order soon
                  </span>
                ) : (
                  <span className="text-[#2A7B4C] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2A7B4C]" /> In Stock ({currentStock} ready to ship)
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-4 border-t border-black/[0.06]">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-black/[0.12] rounded-full px-2 py-1 bg-[#FAF7F2]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-1 text-txt-muted hover:text-txt-primary disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-txt-primary font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock || 10, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="p-1 text-txt-muted hover:text-txt-primary disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 prem-btn-primary py-3 text-xs font-bold transition-all ${
                    addedAnimation ? 'bg-[#2A7B4C] hover:bg-[#2A7B4C]' : ''
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart (₹{(currentPrice * quantity).toLocaleString()})
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-full border transition-all ${
                    isWish
                      ? 'bg-brand-crimson/10 border-brand-crimson text-brand-crimson'
                      : 'bg-white border-black/[0.12] text-txt-secondary hover:text-brand-crimson'
                  }`}
                  title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* View Full Product Details Link */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <Link
                  to={`/customer/product/${product.id}`}
                  onClick={onClose}
                  className="font-bold text-brand-crimson hover:underline flex items-center gap-1"
                >
                  View Full Product Specifications <ArrowRight className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-2 text-[11px] text-txt-muted">
                  <Truck className="w-3.5 h-3.5 text-brand-crimson" />
                  <span>Free shipping & returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
