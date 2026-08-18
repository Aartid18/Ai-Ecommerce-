import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useToast } from '../../context/ToastContext';
import { PriceWatchModal } from '../../components/modals/PriceWatchModal';
import { PreOrderModal } from '../../components/modals/PreOrderModal';
import {
  Star,
  ShoppingBag,
  Bell,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Layers,
  ChevronRight,
  TrendingDown,
  Heart,
  Maximize2,
  X,
  ChevronDown,
  Check,
  BatteryCharging,
  Cpu,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [frequentlyBought, setFrequentlyBought] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 3D Cursor Tilt state
  const imageStageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);

  // Full-screen Image Zoom Modal
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Quantity Stepper
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Benefits Accordion
  const [benefitsOpen, setBenefitsOpen] = useState<boolean>(true);
  const [specsOpen, setSpecsOpen] = useState<boolean>(true);

  // Postcode delivery estimate check
  const [postcode, setPostcode] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

  // Modals
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails(Number(id));
      fetchFrequentlyBought(Number(id));
    }
  }, [id]);

  const fetchProductDetails = async (productId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${productId}`);
      setProduct(res.data);
      setSelectedImage(res.data.mainImageUrl);
      if (res.data.variants && res.data.variants.length > 0) {
        setSelectedVariant(res.data.variants[0]);
      }
      addRecentlyViewed(res.data);
    } catch (err) {
      console.error('Failed to load product details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFrequentlyBought = async (productId: number) => {
    try {
      const res = await api.get(`/recommendations/frequently-bought-together/${productId}`);
      setFrequentlyBought(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setFrequentlyBought([]);
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageStageRef.current) return;
    const rect = imageStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle 8 degree tilt
    setTilt({
      x: -y * 10,
      y: x * 10,
    });
  };

  const handleImageMouseLeave = () => {
    setIsHoveringImage(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode || postcode.length < 5) {
      showToast('Please enter a valid postal code', 'warning');
      return;
    }
    // Calculate estimate (2 business days)
    const date = new Date();
    date.setDate(date.getDate() + 2);
    setDeliveryDate(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    showToast(`Delivery guaranteed by ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, 'success');
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, selectedVariant?.id, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product.id, selectedVariant?.id, quantity);
    navigate('/customer/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="prem-card h-96 skeleton-shimmer rounded-[32px]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-serif text-txt-primary">Product Not Found</h2>
        <Link to="/customer/products" className="prem-btn-primary text-xs py-2.5 px-6">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.priceOverride || product.finalPrice;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = currentStock === 0;
  const isPreOrder = product.preOrderEnabled && isOutOfStock;
  const allImages = [product.mainImageUrl, ...(product.additionalImages || [])];
  const isWish = isInWishlist(product.id);

  const priceHistoryData = [
    { date: '1 Aug', price: product.price },
    { date: '5 Aug', price: product.price },
    { date: '10 Aug', price: Math.round(product.price * 0.95) },
    { date: '14 Aug', price: Math.round(product.price * 0.92) },
    { date: 'Today', price: currentPrice },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24 md:pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-txt-muted">
        <Link to="/customer/products" className="hover:text-brand-crimson flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Catalog
        </Link>
        <ChevronRight className="w-3 h-3 text-txt-disabled" />
        <span className="text-txt-secondary">{product.categoryName || 'Hardware'}</span>
        <ChevronRight className="w-3 h-3 text-txt-disabled" />
        <span className="text-txt-primary font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT: Large Image Gallery with 3D Tilt & Zoom (6 cols) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          {/* Main 3D Tilt Image Stage */}
          <div
            ref={imageStageRef}
            onMouseMove={handleImageMouseMove}
            onMouseEnter={() => setIsHoveringImage(true)}
            onMouseLeave={handleImageMouseLeave}
            className="perspective-container relative group"
          >
            <div
              className="relative aspect-square w-full rounded-[36px] bg-white flex items-center justify-center p-8 sm:p-12 border border-black/[0.08] shadow-prem-md overflow-hidden transition-transform duration-200 ease-out"
              style={{
                transform: isHoveringImage
                  ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Background Ambient Glow */}
              <div className="absolute w-64 h-64 rounded-full bg-[#FAF7F2] blur-2xl pointer-events-none" />

              <img
                src={selectedImage || product.mainImageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                style={{
                  transform: isHoveringImage ? 'translateZ(30px)' : 'translateZ(0px)',
                }}
              />

              {/* Fullscreen Zoom Trigger */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] text-txt-secondary hover:text-brand-crimson flex items-center justify-center shadow-sm hover:scale-105 transition-all"
                title="Full Screen Zoom Preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Top Category Badge */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
                <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-black/[0.08] text-[11px] font-bold text-brand-crimson uppercase tracking-wider">
                  {product.categoryName}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="px-3 py-1 rounded-full bg-brand-crimson text-white text-[11px] font-bold shadow-sm">
                    {Math.round(product.discountPercentage)}% SAVINGS
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden bg-white p-2 border flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-crimson ring-2 ring-brand-crimson/20 shadow-md scale-105'
                      : 'border-black/[0.08] opacity-65 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Information & Purchase Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand, Title & Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-crimson uppercase tracking-wider bg-brand-crimson/10 border border-brand-crimson/20 px-3 py-1 rounded-full">
                {product.brandName || 'Verified Brand'}
              </span>
              <span className="text-xs text-txt-muted font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-txt-primary leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-txt-muted">
              <div className="flex items-center gap-1 text-brand-gold font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-txt-primary text-sm font-semibold">{product.rating || 4.8}</span>
                <span className="text-txt-muted font-normal">({product.reviewCount || 42} verified customer reviews)</span>
              </div>
              <span>•</span>
              <span className="text-[#2A7B4C] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A7B4C] animate-pulse" /> 98.5% fulfillment assurance
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="prem-card p-6 flex items-center justify-between bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
            <div>
              <div className="text-[11px] text-txt-muted mb-0.5">Verified Current Price:</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-txt-primary font-sans">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-xs text-txt-muted line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson text-white text-[10px] font-bold">
                      Save ₹{(product.price - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              {isPreOrder ? (
                <span className="px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-bold border border-brand-gold/30">
                  ● Pre-Order Active
                </span>
              ) : isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-brand-crimson/15 text-brand-crimson text-xs font-bold border border-brand-crimson/25">
                  ● Out of Stock
                </span>
              ) : currentStock <= 8 ? (
                <span className="px-3 py-1 rounded-full bg-brand-crimson/15 text-brand-crimson text-xs font-bold border border-brand-crimson/25">
                  ● Only {currentStock} Units Left
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#2A7B4C]/15 text-[#2A7B4C] text-xs font-bold border border-[#2A7B4C]/25">
                  ● In Stock ({currentStock})
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-txt-muted uppercase tracking-wider">
                Configuration & Options:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
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
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        selectedVariant?.id === v.id
                          ? 'bg-brand-crimson/10 border-brand-crimson text-txt-primary shadow-sm font-semibold ring-2 ring-brand-crimson/20'
                          : 'bg-white border-black/[0.08] text-txt-secondary hover:border-black/[0.2]'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{label}</div>
                      <div className="text-[10px] text-txt-muted mt-0.5 font-mono">
                        {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Suite (Quantity + Add to Cart + Buy Now + Wishlist) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-black/[0.12] rounded-full px-3 py-2 bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1 text-txt-muted hover:text-txt-primary disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-txt-primary font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock || 10, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="p-1 text-txt-muted hover:text-txt-primary disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 prem-btn-primary py-3.5 text-xs font-bold transition-all ${
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
                className={`p-3.5 rounded-full border transition-all ${
                  isWish
                    ? 'bg-brand-crimson text-white border-brand-crimson'
                    : 'bg-white border-black/[0.12] text-txt-secondary hover:text-brand-crimson'
                }`}
                title={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now & Price Watch CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="prem-btn-dark py-3 text-xs font-bold w-full"
              >
                Instant Checkout
              </button>

              <button
                onClick={() => setShowWatchModal(true)}
                className="prem-btn-secondary py-3 text-xs font-semibold w-full"
              >
                <Bell className="w-3.5 h-3.5 text-brand-crimson" /> Set Price Alert
              </button>
            </div>
          </div>

          {/* Postal Code Delivery Checker */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-black/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-txt-primary">
              <MapPin className="w-3.5 h-3.5 text-brand-crimson" />
              <span>Check Express Delivery Date:</span>
            </div>
            <form onSubmit={handleCheckDelivery} className="flex gap-2">
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 560001)"
                className="prem-input text-xs flex-1 py-1.5 font-mono"
              />
              <button type="submit" className="prem-btn-secondary text-xs py-1.5 px-4">
                Check
              </button>
            </form>
            {deliveryDate && (
              <div className="text-xs text-[#2A7B4C] font-semibold pt-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Guaranteed Express Delivery by <strong>{deliveryDate}</strong></span>
              </div>
            )}
          </div>

          {/* Expandable "Why You'll Love It" Section */}
          <div className="prem-card p-5 space-y-3 bg-white border border-black/[0.08] rounded-3xl">
            <button
              onClick={() => setBenefitsOpen(!benefitsOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-txt-primary uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-crimson" />
                Why You'll Love It
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${benefitsOpen ? 'rotate-180' : ''}`} />
            </button>

            {benefitsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-black/[0.04] flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-brand-crimson flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-txt-primary">Pro-Grade Performance</div>
                    <div className="text-[11px] text-txt-secondary mt-0.5">Optimized thermal headroom with zero coil whine.</div>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-black/[0.04] flex items-start gap-2.5">
                  <BatteryCharging className="w-4 h-4 text-[#2A7B4C] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-txt-primary">All-Day Endurance</div>
                    <div className="text-[11px] text-txt-secondary mt-0.5">Rapid charging with USB-C Power Delivery 3.0.</div>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-black/[0.04] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-txt-primary">2-Year Hardware Shield</div>
                    <div className="text-[11px] text-txt-secondary mt-0.5">Direct OEM replacement guarantee on any defects.</div>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-black/[0.04] flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-brand-crimson flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-txt-primary">7-Day Return Policy</div>
                    <div className="text-[11px] text-txt-secondary mt-0.5">Hassle-free pickup and instant store refund.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Price Trend Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Specifications Matrix (7 cols) */}
        <div className="lg:col-span-7 prem-card p-6 sm:p-8 space-y-4 bg-white border border-black/[0.08] rounded-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-brand-crimson" />
              Verified Technical Specifications
            </h3>
            <span className="text-[11px] text-txt-muted">OEM Hardware Check</span>
          </div>

          {product.specifications && product.specifications.length > 0 ? (
            <div className="divide-y divide-black/[0.05] text-xs">
              {product.specifications.map((spec, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <span className="font-medium text-txt-muted">{spec.specKey}</span>
                  <span className="font-semibold text-txt-primary">{spec.specValue}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-txt-muted py-4">Standard manufacturer specifications apply.</div>
          )}
        </div>

        {/* 30-Day Minimal Price Trend Chart (5 cols) */}
        <div className="lg:col-span-5 prem-card p-6 sm:p-8 space-y-3 bg-white border border-black/[0.08] rounded-3xl">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-brand-crimson" />
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">30-Day Price Trend</h3>
            </div>
            <span className="text-[11px] text-brand-crimson font-bold font-mono">Current: ₹{currentPrice.toLocaleString()}</span>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#7E776F" fontSize={10} tickLine={false} />
                <YAxis stroke="#7E776F" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'rgba(20,20,20,0.12)',
                    borderRadius: '16px',
                    fontSize: '11px',
                    color: '#141414',
                    boxShadow: '0 8px 24px rgba(20,20,20,0.08)',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#D92338"
                  strokeWidth={2.5}
                  dot={{ fill: '#D92338', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-txt-muted text-center pt-1">
            Tracked across verified supply chains. Set a Price Watch to receive instant price drop alerts.
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div className="prem-card p-6 sm:p-8 space-y-4 bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
          <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-crimson" />
            Frequently Purchased Together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBought.map((rec, i) => {
              const prod = rec.product || rec;
              if (!prod) return null;
              return (
                <div
                  key={i}
                  onClick={() => navigate(`/customer/product/${prod.id}`)}
                  className="prem-card-hover p-4 rounded-2xl border border-black/[0.06] cursor-pointer flex flex-col justify-between bg-[#FAF8F5]"
                >
                  <div className="h-32 bg-white rounded-xl p-2 flex items-center justify-center mb-2">
                    <img
                      src={prod.mainImageUrl || ''}
                      alt={prod.name || ''}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-crimson font-bold uppercase">{rec.reason || 'Commonly paired'}</span>
                    <h4 className="text-xs font-bold text-txt-primary line-clamp-1 mt-0.5">{prod.name}</h4>
                    <div className="text-xs font-bold text-txt-primary mt-1 font-sans">
                      ₹{(prod.finalPrice || prod.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full-Screen Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage || product.mainImageUrl}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* Sticky Mobile Add-to-Cart Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-txt-muted">Price:</div>
          <div className="text-base font-black text-txt-primary font-sans">
            ₹{currentPrice.toLocaleString()}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 prem-btn-primary py-3 text-xs font-bold"
        >
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </button>
      </div>

      {/* Price Watch Modal */}
      {showWatchModal && (
        <PriceWatchModal
          product={product}
          isOpen={showWatchModal}
          onClose={() => setShowWatchModal(false)}
        />
      )}

      {/* Pre-Order Modal */}
      {showPreOrderModal && (
        <PreOrderModal
          product={product}
          isOpen={showPreOrderModal}
          onClose={() => setShowPreOrderModal(false)}
          onSuccess={() => fetchProductDetails(product.id)}
        />
      )}
    </div>
  );
};
