import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Star, Bell, ShoppingBag, Eye, TrendingUp, Clock } from 'lucide-react';

interface ProductCard3DProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWatchPrice: (product: Product) => void;
  onPreOrder: (product: Product) => void;
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({
  product,
  onAddToCart,
  onWatchPrice,
  onPreOrder,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Max 4 degrees rotation
    setRotate({
      x: -y * 8,
      y: x * 8,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-container relative group h-full"
    >
      <div
        className="prem-card h-full p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 ease-out bg-white border border-black/[0.07] rounded-[24px] shadow-prem-sm hover:shadow-prem-3d hover:border-brand-crimson/25"
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-4px)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div>
          {/* 1. Product Image Stage with 3D Depth */}
          <div
            className="relative w-full h-56 rounded-2xl bg-[#F7F4EE] overflow-hidden mb-4 border border-black/[0.04] flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)',
            }}
          >
            {/* Subtle Circular Backdrop Glow */}
            <div className="absolute w-36 h-36 rounded-full bg-white/70 blur-xl pointer-events-none" />

            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[10px] font-bold text-txt-secondary uppercase tracking-wider">
                {product.categoryName}
              </span>
              {product.discountPercentage > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson text-white text-[10px] font-bold shadow-sm">
                  {Math.round(product.discountPercentage)}% OFF
                </span>
              )}
            </div>

            {/* Availability Badge */}
            <div className="absolute top-2.5 right-2.5">
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-bold border border-brand-gold/30">
                  ● Pre-Order
                </span>
              ) : product.stock <= 5 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson/15 text-brand-crimson text-[10px] font-bold border border-brand-crimson/25">
                  ● Only {product.stock} Left
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#3A835C]/15 text-[#3A835C] text-[10px] font-bold border border-[#3A835C]/25">
                  ● In Stock
                </span>
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
            className="font-bold text-sm text-txt-primary hover:text-brand-crimson line-clamp-2 leading-snug transition-colors mb-3 block"
          >
            {product.name}
          </Link>

          {/* 4. Price & Discount */}
          <div className="flex items-baseline gap-2 mb-2">
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

          {/* 5. Demand Telemetry Strip */}
          <div className="flex items-center justify-between text-[11px] text-txt-muted mb-4 pt-2 border-t border-black/[0.05]">
            <div className="flex items-center gap-1 text-[#3A835C] font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>High Demand</span>
            </div>
            <div className="flex items-center gap-1 text-txt-muted text-[10px]">
              <Eye className="w-3 h-3" />
              <span>120+ watching</span>
            </div>
          </div>
        </div>

        {/* 6. Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {isOutOfStock ? (
            <button
              onClick={() => onPreOrder(product)}
              className="flex-1 py-2.5 px-3 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-txt-primary font-bold text-xs hover:bg-brand-gold/25 transition-all flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-brand-gold" /> Join Pre-Order
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 prem-btn-primary text-xs py-2.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )}

          <button
            onClick={() => onWatchPrice(product)}
            className="p-2.5 rounded-full bg-[#F4F0E8] border border-black/[0.08] hover:border-brand-crimson hover:text-brand-crimson text-txt-secondary transition-all"
            title="Set Price Alert"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
