import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard3D } from '../../components/customer/ProductCard3D';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Bell,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  ChevronDown,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const StoreCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Price Watch & Pre-Order Modal States
  const [priceWatchProduct, setPriceWatchProduct] = useState<Product | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [priceWatchLoading, setPriceWatchLoading] = useState<boolean>(false);

  const [preOrderProduct, setPreOrderProduct] = useState<Product | null>(null);
  const [preOrderLoading, setPreOrderLoading] = useState<boolean>(false);

  // Filter Collapse Toggles
  const [catOpen, setCatOpen] = useState<boolean>(true);
  const [brandOpen, setBrandOpen] = useState<boolean>(true);
  const [priceOpen, setPriceOpen] = useState<boolean>(true);

  // Query Params
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'demandScore,desc';
  const page = parseInt(searchParams.get('page') || '0', 10);

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
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
    } catch (err) {
      console.error('Failed to load categories/brands', err);
      setCategories([]);
      setBrands([]);
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
      const content = Array.isArray(res.data?.content) ? res.data.content : (Array.isArray(res.data) ? res.data : []);
      setProducts(content);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || content.length);
    } catch (err) {
      console.error('Failed to load products', err);
      setProducts([]);
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

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set('page', '0');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleCreatePriceWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceWatchProduct) return;
    const targetPrice = parseFloat(targetPriceInput);
    if (isNaN(targetPrice) || targetPrice <= 0) {
      showToast('Please enter a valid target price', 'error');
      return;
    }
    setPriceWatchLoading(true);
    try {
      await api.post(`/price-watches?productId=${priceWatchProduct.id}&targetPrice=${targetPrice}`);
      showToast(`Price watch set! We'll alert you when ${priceWatchProduct.name} drops to ₹${targetPrice.toLocaleString()}`, 'success', 'Price Watch Active');
      setPriceWatchProduct(null);
      setTargetPriceInput('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create price watch', 'error');
    } finally {
      setPriceWatchLoading(false);
    }
  };

  const handleCreatePreOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preOrderProduct) return;
    setPreOrderLoading(true);
    try {
      await api.post(`/preorders?productId=${preOrderProduct.id}&quantity=1`);
      showToast(`Pre-order confirmed for ${preOrderProduct.name}! We reserved 1 unit for you.`, 'success', 'Pre-Order Reserved');
      setPreOrderProduct(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to join pre-order', 'error');
    } finally {
      setPreOrderLoading(false);
    }
  };

  const nlpPills = [
    'Laptop for coding',
    'Noise-cancelling headphones',
    'Mechanical keyboards',
    'Fast USB-C adapters',
  ];

  const selectedCategoryName = categories.find((c) => c.id.toString() === categoryId)?.name;
  const selectedBrandName = brands.find((b) => b.id.toString() === brandId)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative rounded-[36px] bg-[#EBE4D8] border border-black/[0.06] overflow-hidden p-8 sm:p-12 shadow-prem-sm">
        {/* Curved Warm Background Radial Layer */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-brand-crimson/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-brand-gold/[0.05] blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-black/[0.08] text-txt-primary text-xs font-semibold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-crimson" />
              <span className="uppercase text-[10px] tracking-wider font-bold">AI COMMERCE INTELLIGENCE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-serif text-txt-primary leading-[1.08] tracking-tight">
              Discover products with a smarter{' '}
              <span className="text-brand-crimson italic">point of view.</span>
            </h1>

            <p className="text-sm sm:text-base text-txt-secondary leading-relaxed max-w-lg">
              Explore products, track prices, understand demand and make better purchase decisions.
            </p>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchProducts();
              }}
              className="relative flex items-center max-w-xl"
            >
              <div className="absolute left-4 pointer-events-none text-txt-muted">
                <Search className="w-4 h-4 text-brand-crimson" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products, ask for recommendations, or describe what you need..."
                className="w-full bg-white border border-black/[0.12] hover:border-brand-crimson/50 focus:border-brand-crimson rounded-full pl-11 pr-28 py-3.5 text-xs sm:text-sm text-txt-primary placeholder:text-txt-muted shadow-sm focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-5 py-2.5 rounded-full bg-brand-crimson text-white font-semibold text-xs hover:bg-brand-crimsonHover transition-colors shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Suggested Query Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-txt-muted font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-crimson" />
                <span>Popular:</span>
              </span>
              {nlpPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('search', pill)}
                  className="text-xs px-3 py-1 rounded-full bg-white/70 hover:bg-white border border-black/[0.08] text-txt-secondary hover:text-txt-primary transition-all font-medium shadow-sm"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Editorial Asymmetrical 3D Product Cluster */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Primary Elevated Showcase Circle */}
            <div className="relative w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-white border border-black/[0.06] shadow-prem-lg flex items-center justify-center p-6">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                alt="Bose Headphones"
                className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
              />

              {/* Floating Mini Product 1: Apple Watch Ultra (Top Left) */}
              <div className="absolute -top-4 -left-6 p-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-prem-md flex items-center gap-2.5 animate-float-1">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                  alt="Apple Watch"
                  className="w-10 h-10 object-contain mix-blend-multiply rounded-lg"
                />
                <div className="text-left pr-1">
                  <div className="text-[11px] font-bold text-txt-primary">Apple Watch Ultra 2</div>
                  <div className="text-[10px] text-[#3A835C] font-semibold">● High Demand</div>
                </div>
              </div>

              {/* Floating Mini Product 2: ThinkPad X1 (Bottom Right) */}
              <div className="absolute -bottom-4 -right-4 p-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-prem-md flex items-center gap-2.5 animate-float-2">
                <img
                  src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
                  alt="ThinkPad X1"
                  className="w-10 h-10 object-contain mix-blend-multiply rounded-lg"
                />
                <div className="text-left pr-1">
                  <div className="text-[11px] font-bold text-txt-primary">ThinkPad X1 Carbon</div>
                  <div className="text-[10px] text-brand-crimson font-bold">15% Discount</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL CATEGORY CAPSULES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif text-txt-primary">
            Curated Categories
          </h2>
          <span className="text-xs text-txt-muted font-medium">Explore 5 hardware collections</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => {
            const isSelected = categoryId === c.id.toString();
            return (
              <button
                key={c.id}
                onClick={() => updateFilter('categoryId', isSelected ? '' : c.id.toString())}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-brand-crimson text-white border-brand-crimson shadow-prem-md'
                    : 'bg-white hover:bg-[#FDFBF7] text-txt-primary border-black/[0.06] shadow-prem-sm hover:-translate-y-1'
                }`}
              >
                <div className="text-xs font-bold truncate mb-1">{c.name}</div>
                <div className={`text-[11px] line-clamp-1 ${isSelected ? 'text-white/80' : 'text-txt-muted'}`}>
                  {c.description || 'Hardware essentials'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. ACTIVE FILTERS STRIP */}
      {(categoryId || brandId || search || minPrice || maxPrice) && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white border border-black/[0.06] shadow-prem-sm">
          <span className="text-xs text-txt-muted font-medium">Active Filters:</span>
          {selectedCategoryName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0E8] border border-black/[0.08] text-xs text-txt-primary">
              Category: <strong className="text-brand-crimson">{selectedCategoryName}</strong>
              <button onClick={() => removeFilter('categoryId')} className="hover:text-brand-crimson ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrandName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0E8] border border-black/[0.08] text-xs text-txt-primary">
              Brand: <strong className="text-brand-crimson">{selectedBrandName}</strong>
              <button onClick={() => removeFilter('brandId')} className="hover:text-brand-crimson ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0E8] border border-black/[0.08] text-xs text-txt-primary">
              Query: <strong className="text-brand-crimson">"{search}"</strong>
              <button onClick={() => removeFilter('search')} className="hover:text-brand-crimson ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F0E8] border border-black/[0.08] text-xs text-txt-primary">
              Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}
              <button onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }} className="hover:text-brand-crimson ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-brand-crimson hover:underline ml-auto flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        </div>
      )}

      {/* 4. PRODUCT DISCOVERY: Filter Sidebar + 3D Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR FILTERS (Clean White Surface) */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="prem-card p-5 space-y-5 sticky top-20 bg-white border border-black/[0.08] rounded-[24px]">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-crimson" />
                Refine Selection
              </span>
              <span className="text-[11px] text-txt-muted">{totalElements} items</span>
            </div>

            {/* Category Accordion */}
            <div className="space-y-2">
              <button
                onClick={() => setCatOpen(!catOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-txt-secondary hover:text-txt-primary uppercase tracking-wider"
              >
                <span>Category</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 pt-1">
                  <button
                    onClick={() => updateFilter('categoryId', '')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      !categoryId
                        ? 'bg-brand-crimson/10 text-brand-crimson font-bold border border-brand-crimson/20'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-[#F7F4EE]'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] text-txt-muted">{products.length}</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateFilter('categoryId', c.id.toString())}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between truncate ${
                        categoryId === c.id.toString()
                          ? 'bg-brand-crimson/10 text-brand-crimson font-bold border border-brand-crimson/20'
                          : 'text-txt-secondary hover:text-txt-primary hover:bg-[#F7F4EE]'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Accordion */}
            <div className="space-y-2 pt-2 border-t border-black/[0.06]">
              <button
                onClick={() => setBrandOpen(!brandOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-txt-secondary hover:text-txt-primary uppercase tracking-wider"
              >
                <span>Brand</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${brandOpen ? 'rotate-180' : ''}`} />
              </button>
              {brandOpen && (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 pt-1">
                  <button
                    onClick={() => updateFilter('brandId', '')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                      !brandId
                        ? 'bg-brand-crimson/10 text-brand-crimson font-bold border border-brand-crimson/20'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-[#F7F4EE]'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateFilter('brandId', b.id.toString())}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        brandId === b.id.toString()
                          ? 'bg-brand-crimson/10 text-brand-crimson font-bold border border-brand-crimson/20'
                          : 'text-txt-secondary hover:text-txt-primary hover:bg-[#F7F4EE]'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2 pt-2 border-t border-black/[0.06]">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-txt-secondary hover:text-txt-primary uppercase tracking-wider"
              >
                <span>Price Range (₹)</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
              </button>
              {priceOpen && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      placeholder="Min"
                      className="prem-input text-xs w-full py-1.5"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="prem-input text-xs w-full py-1.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sort Links */}
            <div className="pt-2 border-t border-black/[0.06] space-y-2">
              <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Quick Sort</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateFilter('sort', 'demandScore,desc')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                    sort.includes('demandScore')
                      ? 'bg-brand-crimson text-white border-brand-crimson'
                      : 'bg-[#F4F0E8] border-black/[0.06] text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  🔥 High Demand
                </button>
                <button
                  onClick={() => updateFilter('sort', 'price,asc')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                    sort === 'price,asc'
                      ? 'bg-brand-crimson text-white border-brand-crimson'
                      : 'bg-[#F4F0E8] border-black/[0.06] text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  💰 Best Price
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="text-xs text-txt-secondary">
              Showing <strong className="text-txt-primary">{products.length}</strong> of {totalElements} verified products
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-txt-muted font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="prem-input text-xs py-1.5 px-3 rounded-full cursor-pointer bg-white"
              >
                <option value="demandScore,desc">Demand Intelligence Score</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="rating,desc">Customer Rating</option>
                <option value="salesVelocity,desc">Sales Velocity</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid with 3D Interaction */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="prem-card p-5 space-y-4 animate-pulse bg-white">
                  <div className="w-full h-56 bg-[#F0EAE0] rounded-2xl" />
                  <div className="h-4 bg-[#F0EAE0] rounded w-3/4" />
                  <div className="h-3 bg-[#F0EAE0] rounded w-1/2" />
                  <div className="h-6 bg-[#F0EAE0] rounded w-1/3" />
                  <div className="h-10 bg-[#F0EAE0] rounded-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="prem-card p-12 text-center space-y-4 max-w-lg mx-auto bg-white">
              <div className="w-14 h-14 rounded-full bg-brand-crimson/10 flex items-center justify-center mx-auto text-brand-crimson">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif text-txt-primary">Nothing matched those filters</h3>
              <p className="text-xs text-txt-secondary">
                Try clearing your search filters or explore our trending technical categories.
              </p>
              <button
                onClick={clearFilters}
                className="prem-btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters & View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard3D
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => {
                    addItem(p.id, 1);
                    showToast(`Added ${p.name} to cart!`, 'success', 'Cart Updated');
                  }}
                  onWatchPrice={(p) => {
                    setPriceWatchProduct(p);
                    setTargetPriceInput(Math.round(p.finalPrice * 0.9).toString());
                  }}
                  onPreOrder={(p) => setPreOrderProduct(p)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 0}
                onClick={() => updateFilter('page', (page - 1).toString())}
                className="p-2 rounded-full bg-white border border-black/[0.08] text-txt-secondary hover:text-txt-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('page', idx.toString())}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                    page === idx
                      ? 'bg-brand-crimson text-white shadow-sm'
                      : 'bg-white border border-black/[0.08] text-txt-secondary hover:text-txt-primary shadow-sm'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => updateFilter('page', (page + 1).toString())}
                className="p-2 rounded-full bg-white border border-black/[0.08] text-txt-secondary hover:text-txt-primary disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 5. EDITORIAL PROMOTIONAL FEATURE SECTION */}
      <section className="relative rounded-[36px] bg-brand-crimson text-white p-8 sm:p-12 overflow-hidden shadow-prem-lg">
        {/* Decorative Curved Cream Shape */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/[0.07] blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              FEATURED HARDWARE SPOTLIGHT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif leading-tight">
              Technology worth bringing home.
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-lg">
              Lenovo ThinkPad X1 Carbon Gen 11 with 32GB LPDDR5 RAM and 2.8K OLED Display. Built for unmatched engineering productivity.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/customer/product/1"
                className="px-6 py-3 rounded-full bg-white text-brand-crimson font-bold text-xs hover:bg-[#F4F0E8] transition-all shadow-md inline-flex items-center gap-2"
              >
                Explore Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-xs font-mono font-bold text-white/90">
                ₹157,249 <span className="line-through text-white/60 text-[11px]">₹184,999</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-64 sm:w-72 h-64 sm:h-72 rounded-full bg-white/10 p-4 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
                alt="Featured Laptop"
                className="w-full h-full object-contain mix-blend-screen hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICE WATCH MODAL (Editorial White) */}
      {priceWatchProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="prem-card max-w-md w-full p-6 space-y-5 shadow-2xl border border-black/[0.12] bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-crimson" />
                <h3 className="text-sm font-bold text-txt-primary">Set Price Watch Alert</h3>
              </div>
              <button onClick={() => setPriceWatchProduct(null)} className="text-txt-muted hover:text-txt-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F4EE] border border-black/[0.04]">
              <img src={priceWatchProduct.mainImageUrl} alt="" className="w-12 h-12 object-cover rounded-xl mix-blend-multiply" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-txt-primary truncate">{priceWatchProduct.name}</div>
                <div className="text-xs text-txt-muted">Current: <span className="font-bold text-txt-primary">₹{priceWatchProduct.finalPrice.toLocaleString()}</span></div>
              </div>
            </div>

            <form onSubmit={handleCreatePriceWatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-txt-secondary mb-1">
                  Target Price Alert (₹):
                </label>
                <input
                  type="number"
                  required
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  className="prem-input text-sm w-full py-2"
                  placeholder="e.g. 25000"
                />
                <p className="text-[10px] text-txt-muted mt-1">
                  We will automatically notify you when this item drops to or below your target price.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriceWatchProduct(null)}
                  className="prem-btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={priceWatchLoading}
                  className="prem-btn-primary text-xs py-2 px-4"
                >
                  {priceWatchLoading ? 'Setting Alert...' : 'Activate Price Watch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. PRE-ORDER MODAL (Editorial White) */}
      {preOrderProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="prem-card max-w-md w-full p-6 space-y-5 shadow-2xl border border-black/[0.12] bg-white animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold" />
                <h3 className="text-sm font-bold text-txt-primary">Reserve Pre-Order</h3>
              </div>
              <button onClick={() => setPreOrderProduct(null)} className="text-txt-muted hover:text-txt-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F4EE] border border-black/[0.04]">
              <img src={preOrderProduct.mainImageUrl} alt="" className="w-12 h-12 object-cover rounded-xl mix-blend-multiply" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-txt-primary truncate">{preOrderProduct.name}</div>
                <div className="text-xs text-txt-muted">Price: ₹{preOrderProduct.finalPrice.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-gold/10 border border-brand-gold/25 text-xs text-txt-secondary space-y-1">
              <div className="font-semibold text-txt-primary">📦 Guaranteed Priority Allocation</div>
              <p className="text-[11px] text-txt-muted leading-relaxed">
                By reserving this pre-order, you secure priority shipping as soon as the factory shipment arrives.
              </p>
            </div>

            <form onSubmit={handleCreatePreOrder} className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreOrderProduct(null)}
                className="prem-btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={preOrderLoading}
                className="prem-btn-primary text-xs py-2 px-4"
              >
                {preOrderLoading ? 'Reserving...' : 'Confirm Pre-Order (1 Unit)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
