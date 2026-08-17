import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';
import { useCart } from '../../context/CartContext';
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
  RotateCcw,
  Radio,
  TrendingUp,
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
    'Laptops for coding under ₹70,000',
    'Wireless headphones under ₹3,000',
    'Mechanical keyboards',
    'Fast charging USB-C hubs',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intelligent Discovery Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-card border border-border-primary p-7 sm:p-9">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-subtle border border-accent-border text-accent text-xs font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>Demand Intelligence Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-txt-primary tracking-tight leading-snug">
            Discover products backed by <span className="text-accent">real demand intelligence</span>.
          </h1>

          <p className="text-xs text-txt-secondary leading-relaxed">
            Track prices, explore verified availability, and get personalized recommendations powered by real commerce signals.
          </p>

          {/* Quick Search Chips */}
          <div className="pt-2">
            <div className="text-[11px] text-txt-muted font-medium mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Suggested Technical Queries:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {nlpPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('search', pill)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-surface-card-hover hover:bg-surface-card border border-border-subtle hover:border-border-hover text-txt-secondary hover:text-txt-primary transition-all"
                >
                  "{pill}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="prem-card p-5 space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
                Filters
              </span>
              {(categoryId || brandId || search || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">Category</label>
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilter('categoryId', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !categoryId ? 'bg-accent-subtle text-accent font-semibold' : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
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
                        ? 'bg-accent-subtle text-accent font-semibold'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">Brand</label>
              <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilter('brandId', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !brandId ? 'bg-accent-subtle text-accent font-semibold' : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
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
                        ? 'bg-accent-subtle text-accent font-semibold'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="prem-input w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="prem-input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3 space-y-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-surface-card p-3.5 rounded-xl border border-border-subtle">
            <div className="text-xs text-txt-muted">
              Showing <span className="font-semibold text-txt-primary">{products.length}</span> products
              {search && <span> matching "{search}"</span>}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-txt-muted">Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="prem-input py-1 text-xs"
              >
                <option value="id,desc">Latest / Featured</option>
                <option value="finalPrice,asc">Price: Low to High</option>
                <option value="finalPrice,desc">Price: High to Low</option>
                <option value="rating,desc">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="prem-card h-84 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="prem-card p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-txt-disabled mx-auto" />
              <h3 className="text-sm font-bold text-txt-primary">No products found</h3>
              <p className="text-xs text-txt-muted max-w-sm mx-auto">
                No active catalog items matched your current selection. Try resetting filters or querying alternative tech hardware.
              </p>
              <button onClick={clearFilters} className="prem-btn-primary text-xs">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isPreOrder = product.preOrderEnabled && isOutOfStock;

                return (
                  <div
                    key={product.id}
                    className="prem-card-hover flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Contextual Image Container */}
                      <div
                        className="relative aspect-[4/3] bg-[#111820] p-4 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/customer/product/${product.id}`)}
                      >
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {product.categoryName && (
                            <span className="text-[10px] bg-bg-primary/90 text-txt-secondary border border-border-subtle px-2 py-0.5 rounded font-medium">
                              {product.categoryName}
                            </span>
                          )}
                          {product.discountPercentage > 0 && (
                            <span className="text-[10px] bg-accent-subtle text-accent border border-accent-border font-bold px-1.5 py-0.5 rounded">
                              {Math.round(product.discountPercentage)}% OFF
                            </span>
                          )}
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute top-3 right-3">
                          {isPreOrder ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-subtle text-indigo-accent border border-indigo-accent/20 font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-accent" /> Pre-order
                            </span>
                          ) : isOutOfStock ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-status-danger-subtle text-status-danger border border-status-danger/20 font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-danger" /> Out of stock
                            </span>
                          ) : product.stock <= 8 ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-status-warning-subtle text-status-warning border border-status-warning/20 font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-warning" /> Low stock ({product.stock})
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent-border font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> In stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-txt-muted">
                          <span className="font-medium text-txt-secondary">{product.brandName || 'Verified'}</span>
                          <div className="flex items-center gap-1 text-status-warning font-semibold">
                            <Star className="w-3 h-3 fill-status-warning text-status-warning" />
                            <span>{product.rating}</span>
                            <span className="text-txt-muted font-normal">({product.reviewCount})</span>
                          </div>
                        </div>

                        <h3
                          onClick={() => navigate(`/customer/product/${product.id}`)}
                          className="text-xs font-bold text-txt-primary hover:text-accent cursor-pointer line-clamp-2 transition-colors leading-snug"
                        >
                          {product.name}
                        </h3>

                        {/* Price & Demand Trend */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-extrabold text-txt-primary font-sans">
                              ₹{product.finalPrice.toLocaleString()}
                            </span>
                            {product.discountPercentage > 0 && (
                              <span className="text-xs text-txt-muted line-through">
                                ₹{product.price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Subtle Demand Sparkline Indicator */}
                          {product.salesVelocity > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-accent font-medium">
                              <TrendingUp className="w-3 h-3" />
                              <span>Demand: High</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      {isPreOrder ? (
                        <button
                          onClick={() => setSelectedProductForPreOrder(product)}
                          className="col-span-2 py-2 bg-indigo-subtle hover:bg-indigo-subtle/80 text-indigo-accent border border-indigo-accent/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <PackageCheck className="w-4 h-4" />
                          Join Pre-Order
                        </button>
                      ) : isOutOfStock ? (
                        <button
                          onClick={() => setSelectedProductForWatch(product)}
                          className="col-span-2 py-2 bg-surface-card-hover text-txt-secondary hover:text-txt-primary border border-border-subtle font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Bell className="w-3.5 h-3.5 text-status-warning" />
                          Notify When in Stock
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => addToCart(product.id, undefined, 1)}
                            className="prem-btn-primary py-2 text-xs"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>

                          <button
                            onClick={() => setSelectedProductForWatch(product)}
                            className="prem-btn-secondary py-2 text-xs"
                            title="Set target price watch"
                          >
                            <Bell className="w-3.5 h-3.5 text-accent" />
                            Watch Price
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
            <div className="flex items-center justify-center gap-1.5 pt-6">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('page', idx.toString())}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    page === idx
                      ? 'bg-accent text-bg-primary font-bold'
                      : 'bg-surface-card hover:bg-surface-card-hover text-txt-secondary'
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
