import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import {
  Star,
  ShoppingBag,
  Eye,
  TrendingUp,
  Clock,
  Heart,
  Zap,
} from 'lucide-react';

interface ProductCard3DProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWatchPrice?: (product: Product) => void;
  onPreOrder?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({
  product,
  onAddToCart,
  onWatchPrice,
  onPreOrder,
  onQuickView,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWish = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;
  const secondaryImage = product.additionalImages && product.additionalImages.length > 0
    ? product.additionalImages[0]
    : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setRotate({
      x: -y * 7,
      y: x * 7,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-container relative group h-full"
    >
      <div
        className="prem-card h-full p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ease-out bg-white border border-black/[0.07] rounded-[26px] shadow-prem-sm group-hover:shadow-prem-3d group-hover:border-brand-crimson/30 group-hover:-translate-y-2"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div>
          {/* 1. Large Edge-to-Edge Image Stage with Crossfade & 3D Layering */}
          <div
            className="relative w-full h-64 rounded-2xl bg-[#FAF7F2] overflow-hidden mb-4 border border-black/[0.04] flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: isHovered ? 'translateZ(24px)' : 'translateZ(0px)',
            }}
          >
            {/* Background Ambient Glow */}
            <div className="absolute w-40 h-40 rounded-full bg-white/80 blur-xl pointer-events-none" />

            {/* Primary Product Image */}
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className={`w-full h-full object-contain mix-blend-multiply transition-all duration-500 p-4 ${
                secondaryImage && isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100 group-hover:scale-105'
              }`}
              loading="lazy"
            />

            {/* Secondary Lifestyle Image (Crossfade on Hover) */}
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} lifestyle`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
                }`}
                loading="lazy"
              />
            )}

            {/* Top Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[10px] font-bold text-txt-secondary uppercase tracking-wider shadow-sm">
                {product.categoryName}
              </span>
              {product.discountPercentage > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson text-white text-[10px] font-bold shadow-sm">
                  {Math.round(product.discountPercentage)}% OFF
                </span>
              )}
            </div>

            {/* Wishlist Heart Button (Top Right) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isWish
                  ? 'bg-brand-crimson text-white scale-110'
                  : 'bg-white/90 text-txt-secondary hover:text-brand-crimson hover:bg-white hover:scale-110'
              }`}
              title={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-4 h-4 transition-transform ${isWish ? 'fill-current' : ''}`} />
            </button>

            {/* Hover Floating Actions (Quick View & Quick Add) */}
            <div
              className={`absolute bottom-3 inset-x-3 z-10 flex items-center gap-2 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
              }`}
            >
              {onQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                  className="flex-1 py-2 px-3 rounded-full bg-white/95 backdrop-blur-md text-txt-primary hover:text-brand-crimson border border-black/[0.08] font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Quick View</span>
                </button>
              )}

              {!isOutOfStock && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="p-2 rounded-full bg-brand-crimson hover:bg-brand-crimsonHover text-white transition-all shadow-md flex items-center justify-center"
                  title="Quick Add"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Brand & Star Rating */}
          <div className="flex items-center justify-between text-xs text-txt-muted mb-1">
            <span className="font-semibold text-txt-secondary uppercase tracking-wider text-[11px]">
              {product.brandName}
            </span>
            <div className="flex items-center gap-1 text-brand-gold font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating || 4.8}</span>
              <span className="text-txt-muted font-normal text-[11px]">({product.reviewCount || 34})</span>
            </div>
          </div>

          {/* 3. Product Title */}
          <Link
            to={`/customer/product/${product.id}`}
            className="font-bold text-sm text-txt-primary hover:text-brand-crimson line-clamp-2 leading-snug transition-colors mb-2 block"
          >
            {product.name}
          </Link>

          {/* 4. Price & Discount Tag */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-txt-primary font-sans">
              ₹{product.finalPrice.toLocaleString()}
            </span>
            {product.discountPercentage > 0 && (
              <span className="text-xs text-txt-muted line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
            {product.discountPercentage > 0 && (
              <span className="text-[10px] font-bold text-brand-crimson">
                Save ₹{(product.price - product.finalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* 5. Demand Telemetry Strip & Stock Signal */}
          <div className="flex items-center justify-between text-[11px] text-txt-muted mb-4 pt-2 border-t border-black/[0.05]">
            <div className="flex items-center gap-1 text-[#2A7B4C] font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>High Demand</span>
            </div>
            <div>
              {isOutOfStock ? (
                <span className="text-brand-gold font-bold text-[10px]">Pre-Order Open</span>
              ) : product.stock <= 5 ? (
                <span className="text-brand-crimson font-bold text-[10px]">Only {product.stock} Left</span>
              ) : (
                <span className="text-txt-muted text-[10px]">In Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* 6. Primary Action Button */}
        <div className="pt-1">
          {isOutOfStock ? (
            <button
              onClick={() => onPreOrder?.(product)}
              className="w-full py-2.5 px-3 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-txt-primary font-bold text-xs hover:bg-brand-gold/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-brand-gold" /> Reserve Pre-Order
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full prem-btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
