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
  CheckCircle2,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

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
        <div className="glass-panel h-96 rounded-3xl animate-pulse bg-slate-900" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Product Not Found</h2>
        <Link to="/customer/products" className="text-emerald-400 text-sm hover:underline">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentPrice = selectedVariant?.priceOverride || product.finalPrice;
  const isOutOfStock = currentStock <= 0;
  const isPreOrder = product.preOrderEnabled && isOutOfStock;

  const allImages = [product.mainImageUrl, ...(product.additionalImages || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/customer/products" className="hover:text-emerald-400 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Catalog
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-300">{product.categoryName || 'Electronics'}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-100 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel aspect-square rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center p-2">
            <img
              src={selectedImage || product.mainImageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Intelligence & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {product.brandName || 'Brand'}
              </span>
              <span className="text-xs text-slate-400 font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-sm">{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} verified reviews)</span>
              </div>
              <span>•</span>
              <span className="text-emerald-400 font-medium">98.5% positive customer satisfaction</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Guaranteed Current Price:</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-emerald-400">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-sm text-slate-500 line-through">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <Badge variant="emerald" size="sm">
                      {Math.round(product.discountPercentage)}% Discount Applied
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              {isPreOrder ? (
                <Badge variant="purple" dot size="md">Pre-Order Available</Badge>
              ) : isOutOfStock ? (
                <Badge variant="rose" dot size="md">Out of Stock</Badge>
              ) : currentStock <= 8 ? (
                <Badge variant="amber" dot size="md">Only {currentStock} Left</Badge>
              ) : (
                <Badge variant="emerald" dot size="md">In Stock ({currentStock} units)</Badge>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Configuration / Variant:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{v.attributesJson || v.sku}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {isPreOrder ? (
              <button
                onClick={() => setShowPreOrderModal(true)}
                className="col-span-2 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
              >
                <PackageCheck className="w-5 h-5" />
                Join Pre-Order (Expected in {product.preOrderExpectedAvailability || '15 Days'})
              </button>
            ) : isOutOfStock ? (
              <button
                onClick={() => setShowWatchModal(true)}
                className="col-span-2 py-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Bell className="w-5 h-5 text-amber-400" />
                Notify When Back in Stock
              </button>
            ) : (
              <>
                <button
                  onClick={() => addToCart(product.id, selectedVariant?.id, 1)}
                  className="py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={() => setShowWatchModal(true)}
                  className="py-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  Set Price Watch Alert
                </button>
              </>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Free Express Delivery over ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>7-Day Easy Returns Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Genuine Technical Specs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Seller Reliability Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Specifications Matrix (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Technical Specifications
            </h3>
            <span className="text-xs text-slate-500 font-mono">Grounded DB Specs</span>
          </div>

          {product.specifications && product.specifications.length > 0 ? (
            <div className="divide-y divide-slate-800/60 text-xs">
              {product.specifications.map((spec, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-400">{spec.specKey}</span>
                  <span className="font-bold text-slate-200">{spec.specValue}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4">Standard manufacturer specifications apply.</div>
          )}
        </div>

        {/* Seller Reliability Scorecard (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-slate-100">Seller Reliability</h3>
            <span className="text-sm font-extrabold text-emerald-400">96 / 100</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>On-Time Shipping</span>
                <span className="font-bold text-emerald-400">98%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Product Accuracy</span>
                <span className="font-bold text-emerald-400">97%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '97%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cancellation Rate</span>
                <span className="font-bold text-emerald-400">1.2% (Low)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '98.8%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Bundle Recommendations */}
      {frequentlyBought.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Frequently Purchased Together
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {frequentlyBought.map((rec, i) => (
              <div
                key={i}
                onClick={() => navigate(`/customer/product/${rec.product.id}`)}
                className="glass-card p-3.5 rounded-xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <img
                  src={rec.product.mainImageUrl}
                  alt={rec.product.name}
                  className="w-full h-28 object-cover rounded-lg bg-slate-800 mb-2"
                />
                <div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{rec.reason}</span>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mt-0.5">{rec.product.name}</h4>
                  <div className="text-xs font-extrabold text-emerald-400 mt-1">₹{rec.product.finalPrice.toLocaleString()}</div>
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
