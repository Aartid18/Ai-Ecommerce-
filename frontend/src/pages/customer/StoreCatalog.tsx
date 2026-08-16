import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../../components/shared/Badge';
import { PriceWatchModal } from '../../components/modals/PriceWatchModal';
import { PreOrderModal } from '../../components/modals/PreOrderModal';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Bell,
  Star,
  PackageCheck,
  TrendingDown,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const StoreCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'id,desc';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Modals
  const [selectedProductForWatch, setSelectedProductForWatch] = useState<Product | null>(null);
  const [selectedProductForPreOrder, setSelectedProductForPreOrder] = useState<Product | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products/brands'),
      ]);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error('Failed to load categories/brands', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId);
      if (brandId) params.append('brandId', brandId);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('sort', sort);
      params.append('page', page.toString());
      params.append('size', '12');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const nlpPills = [
    'Laptops for coding under 70000',
    'Wireless noise cancelling headphones',
    'Keyboards with mechanical switches',
    'Fast charging USB-C hub',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner with Value Proposition */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Demand Radar & AI Intelligence Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Discover Tech Grounded in <span className="text-emerald-400">Real Demand & Smart Pricing</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Watch product prices, join verified pre-orders, and consult our grounded AI Shopping Copilot for unbiased technical comparisons.
          </p>

          {/* NLP Search Queries */}
          <div className="pt-2">
            <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Try Natural Language Search:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {nlpPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('search', pill)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all font-medium"
                >
                  "{pill}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                Filters
              </span>
              {(categoryId || brandId || search || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => updateFilter('categoryId', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !categoryId ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter('categoryId', c.id.toString())}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors truncate ${
                      categoryId === c.id.toString()
                        ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Brand</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                <button
                  onClick={() => updateFilter('brandId', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !brandId ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateFilter('brandId', b.id.toString())}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      brandId === b.id.toString()
                        ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Price Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar: Results Count & Sort Dropdown */}
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400">
              Showing <span className="font-bold text-slate-200">{products.length}</span> verified products
              {search && <span> for "{search}"</span>}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="id,desc">Latest / Featured</option>
                <option value="finalPrice,asc">Price: Low to High</option>
                <option value="finalPrice,desc">Price: High to Low</option>
                <option value="rating,desc">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse bg-slate-900 border border-slate-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active catalog items matched your current filter selection. Try clearing filters or searching for alternative tech keywords.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isPreOrder = product.preOrderEnabled && isOutOfStock;

                return (
                  <div
                    key={product.id}
                    className="glass-card rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:border-slate-700"
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => navigate(`/customer/product/${product.id}`)}>
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {product.categoryName && (
                            <span className="text-[10px] bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700/50 px-2 py-0.5 rounded-md font-semibold">
                              {product.categoryName}
                            </span>
                          )}
                          {product.discountPercentage > 0 && (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-md">
                              {Math.round(product.discountPercentage)}% OFF
                            </span>
                          )}
                        </div>

                        {/* Stock Health Badge */}
                        <div className="absolute top-3 right-3">
                          {isPreOrder ? (
                            <Badge variant="purple" dot size="sm">Pre-Order</Badge>
                          ) : isOutOfStock ? (
                            <Badge variant="rose" dot size="sm">Out of Stock</Badge>
                          ) : product.stock <= 8 ? (
                            <Badge variant="amber" dot size="sm">Only {product.stock} left</Badge>
                          ) : (
                            <Badge variant="emerald" dot size="sm">In Stock</Badge>
                          )}
                        </div>
                      </div>

                      {/* Product Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">{product.brandName || 'Verified Brand'}</span>
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{product.rating}</span>
                            <span className="text-slate-500 font-normal">({product.reviewCount})</span>
                          </div>
                        </div>

                        <h3
                          onClick={() => navigate(`/customer/product/${product.id}`)}
                          className="text-sm font-bold text-slate-100 hover:text-emerald-400 cursor-pointer line-clamp-2 transition-colors leading-snug"
                        >
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-lg font-extrabold text-emerald-400">
                            ₹{product.finalPrice.toLocaleString()}
                          </span>
                          {product.discountPercentage > 0 && (
                            <span className="text-xs text-slate-500 line-through">
                              ₹{product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      {isPreOrder ? (
                        <button
                          onClick={() => setSelectedProductForPreOrder(product)}
                          className="col-span-2 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          <PackageCheck className="w-4 h-4" />
                          Join Pre-Order
                        </button>
                      ) : isOutOfStock ? (
                        <button
                          onClick={() => setSelectedProductForWatch(product)}
                          className="col-span-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                          Notify When in Stock
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => addToCart(product.id, undefined, 1)}
                            className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>

                          <button
                            onClick={() => setSelectedProductForWatch(product)}
                            className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                            title="Set target price alert"
                          >
                            <Bell className="w-3.5 h-3.5 text-emerald-400" />
                            Price Watch
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('page', idx.toString())}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    page === idx
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProductForWatch && (
        <PriceWatchModal
          product={selectedProductForWatch}
          isOpen={!!selectedProductForWatch}
          onClose={() => setSelectedProductForWatch(null)}
        />
      )}

      {selectedProductForPreOrder && (
        <PreOrderModal
          product={selectedProductForPreOrder}
          isOpen={!!selectedProductForPreOrder}
          onClose={() => setSelectedProductForPreOrder(null)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};
