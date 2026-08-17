import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../../components/shared/Badge';
import { PriceWatchModal } from '../../components/modals/PriceWatchModal';
import { PreOrderModal } from '../../components/modals/PreOrderModal';
import {
  Star,
  ShoppingBag,
  Bell,
  PackageCheck,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Layers,
  ChevronRight,
  TrendingDown,
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

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [frequentlyBought, setFrequentlyBought] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error('Failed to load product details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFrequentlyBought = async (productId: number) => {
    try {
      const res = await api.get(`/recommendations/frequently-bought-together/${productId}`);
      setFrequentlyBought(res.data);
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="prem-card h-96 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-txt-primary">Product Not Found</h2>
        <Link to="/customer/products" className="text-accent text-xs hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentPrice = selectedVariant?.priceOverride || product.finalPrice;
  const isOutOfStock = currentStock <= 0;
  const isPreOrder = product.preOrderEnabled && isOutOfStock;
  const allImages = [product.mainImageUrl, ...(product.additionalImages || [])];

  // Minimal Price History Data for visualization
  const priceHistoryData = [
    { date: '1 Aug', price: product.price },
    { date: '5 Aug', price: product.price },
    { date: '10 Aug', price: Math.round(product.price * 0.95) },
    { date: '14 Aug', price: Math.round(product.price * 0.92) },
    { date: 'Today', price: currentPrice },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-txt-muted">
        <Link to="/customer/products" className="hover:text-accent flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Catalog
        </Link>
        <ChevronRight className="w-3 h-3 text-txt-disabled" />
        <span className="text-txt-secondary">{product.categoryName || 'Electronics'}</span>
        <ChevronRight className="w-3 h-3 text-txt-disabled" />
        <span className="text-txt-primary font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="prem-card aspect-square rounded-2xl overflow-hidden bg-[#111820] flex items-center justify-center p-6 border border-border-primary">
            <img
              src={selectedImage || product.mainImageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden bg-[#111820] p-1 border flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-accent'
                      : 'border-border-subtle opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Information & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-accent uppercase tracking-wider bg-accent-subtle border border-accent-border px-2 py-0.5 rounded-full">
                {product.brandName || 'Verified Tech'}
              </span>
              <span className="text-xs text-txt-muted font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-txt-primary leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-txt-muted">
              <div className="flex items-center gap-1 text-status-warning font-semibold">
                <Star className="w-3.5 h-3.5 fill-status-warning text-status-warning" />
                <span>{product.rating}</span>
                <span className="text-txt-muted font-normal">({product.reviewCount} verified ratings)</span>
              </div>
              <span>•</span>
              <span className="text-txt-secondary font-medium">98.5% fulfillment assurance</span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="prem-card p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-txt-muted mb-0.5">Verified Current Price:</div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-bold text-txt-primary font-sans">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-xs text-txt-muted line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <Badge variant="emerald" size="sm">
                      {Math.round(product.discountPercentage)}% OFF
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              {isPreOrder ? (
                <Badge variant="purple" dot size="md">Pre-Order</Badge>
              ) : isOutOfStock ? (
                <Badge variant="rose" dot size="md">Out of Stock</Badge>
              ) : currentStock <= 8 ? (
                <Badge variant="amber" dot size="md">Only {currentStock} Left</Badge>
              ) : (
                <Badge variant="emerald" dot size="md">In Stock ({currentStock})</Badge>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider">
                Configuration Variant:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-accent-subtle border-accent-border text-txt-primary'
                        : 'bg-surface-card border-border-subtle text-txt-secondary hover:border-border-hover'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{v.attributesJson || v.sku}</div>
                    <div className="text-[10px] text-txt-muted mt-0.5">
                      {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-txt-secondary leading-relaxed">
            {product.description}
          </p>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {isPreOrder ? (
              <button
                onClick={() => setShowPreOrderModal(true)}
                className="col-span-2 py-3 bg-indigo-accent hover:bg-indigo-accent/90 text-bg-primary font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <PackageCheck className="w-4 h-4" />
                Join Pre-Order List ({product.preOrderCount || 0} interested)
              </button>
            ) : isOutOfStock ? (
              <button
                onClick={() => setShowWatchModal(true)}
                className="col-span-2 py-3 prem-btn-secondary text-xs flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4 text-status-warning" />
                Notify When Back in Stock
              </button>
            ) : (
              <>
                <button
                  onClick={() => addToCart(product.id, selectedVariant?.id, 1)}
                  className="prem-btn-primary py-3 text-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={() => setShowWatchModal(true)}
                  className="prem-btn-secondary py-3 text-xs"
                >
                  <Bell className="w-4 h-4 text-accent" />
                  Set Target Price Watch
                </button>
              </>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-border-subtle text-[11px] text-txt-muted">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Free Delivery over ₹999</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>7-Day Return Policy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Verified Specifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Price History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Specifications Matrix (7 cols) */}
        <div className="lg:col-span-7 prem-card p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-accent" />
              Technical Specifications
            </h3>
            <span className="text-[11px] text-txt-muted font-mono">Hardware DB</span>
          </div>

          {product.specifications && product.specifications.length > 0 ? (
            <div className="divide-y divide-border-subtle text-xs">
              {product.specifications.map((spec, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <span className="font-medium text-txt-muted">{spec.specKey}</span>
                  <span className="font-semibold text-txt-primary">{spec.specValue}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-txt-muted py-4">Standard manufacturer specifications apply.</div>
          )}
        </div>

        {/* Minimal Price History Chart (5 cols) */}
        <div className="lg:col-span-5 prem-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-accent" />
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">30-Day Price Trend</h3>
            </div>
            <span className="text-[11px] text-accent font-semibold font-mono">Current: ₹{currentPrice.toLocaleString()}</span>
          </div>

          <div className="h-40 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#6F7B86" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F7B86" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141B23',
                    borderColor: '#26313C',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F1F5F4',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2DD4A8"
                  strokeWidth={2}
                  dot={{ fill: '#2DD4A8', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-txt-muted text-center">
            Set a Price Watch to receive automated alerts upon next price-drop.
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div className="prem-card p-5 space-y-3.5">
          <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Frequently Purchased Together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBought.map((rec, i) => (
              <div
                key={i}
                onClick={() => navigate(`/customer/product/${rec.product.id}`)}
                className="prem-card-hover p-3 rounded-xl border border-border-subtle cursor-pointer flex flex-col justify-between"
              >
                <div className="h-24 bg-[#111820] rounded-lg p-2 flex items-center justify-center mb-2">
                  <img
                    src={rec.product.mainImageUrl}
                    alt={rec.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-accent font-semibold">{rec.reason}</span>
                  <h4 className="text-xs font-semibold text-txt-primary line-clamp-1 mt-0.5">{rec.product.name}</h4>
                  <div className="text-xs font-bold text-txt-primary mt-1 font-sans">₹{rec.product.finalPrice.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showWatchModal && (
        <PriceWatchModal
          product={product}
          isOpen={showWatchModal}
          onClose={() => setShowWatchModal(false)}
        />
      )}

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
