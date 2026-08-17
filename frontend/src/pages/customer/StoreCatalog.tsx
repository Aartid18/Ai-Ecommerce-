import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Product, Category, Brand } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell,
  Eye,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Radio,
  ChevronDown,
  X,
  Package,
} from 'lucide-react';

export const StoreCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem, setIsOpen: setCartOpen } = useCart();
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

  // Hovered product card for intelligence overlay
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

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
    'Laptop for coding under ₹70,000',
    'Best wireless headphones under ₹3,000',
    'Keyboard for programming',
    'Accessories for my laptop',
  ];

  const trendingItems = [
    { name: 'ThinkPad X1 Carbon', trend: '+18.2%', score: 94, status: 'In Stock' },
    { name: 'Bose QC Ultra', trend: '+34.5%', score: 89, status: 'Smart Deal' },
    { name: 'Keychron Q1 Pro', trend: '+42.0%', score: 82, status: 'Pre-Order' },
    { name: 'Apple Watch Ultra 2', trend: '+15.4%', score: 95, status: 'In Stock' },
    { name: 'Dell 7-in-1 Hub', trend: '+21.0%', score: 78, status: 'Low Stock' },
  ];

  const selectedCategoryName = categories.find((c) => c.id.toString() === categoryId)?.name;
  const selectedBrandName = brands.find((b) => b.id.toString() === brandId)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. HERO SECTION: Two-Column Live Commerce Entrance */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-surface-card/90 to-surface-card/60 border border-border-primary/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-accent/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT COLUMN: Main Headline & Interactive Query Bar */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold tracking-wide">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="uppercase text-[10px] tracking-wider font-bold">LIVE DEMAND INTELLIGENCE</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-txt-primary tracking-tight leading-[1.12]">
              Shop with <span className="text-accent">signals.</span><br />
              Not guesswork.
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-sm sm:text-base text-txt-secondary leading-relaxed max-w-xl">
              Track prices, availability, demand trends and personalized recommendations in real time.
            </p>

            {/* Search Input Bar */}
            <div className="pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchProducts();
                }}
                className="relative flex items-center"
              >
                <div className="absolute left-4 pointer-events-none text-txt-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search products, ask for recommendations, or describe what you need..."
                  className="w-full bg-bg-primary/90 border border-border-primary hover:border-border-hover focus:border-accent rounded-2xl pl-11 pr-24 py-3.5 text-xs sm:text-sm text-txt-primary placeholder:text-txt-muted shadow-inner focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-3.5 py-2 rounded-xl bg-accent text-bg-primary font-bold text-xs hover:bg-accent-hover transition-colors shadow-sm"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Suggested Technical Query Pills */}
            <div className="pt-1">
              <div className="text-[11px] text-txt-muted font-medium mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-accent" />
                <span>Suggested Queries:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {nlpPills.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateFilter('search', pill)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-bg-secondary/70 hover:bg-surface-card border border-border-primary hover:border-border-hover text-txt-secondary hover:text-txt-primary transition-all font-medium"
                  >
                    "{pill}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Commerce Intelligence Panel */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-bg-secondary/90 border border-border-primary/80 p-5 shadow-2xl backdrop-blur-md space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                    COMMERCE SIGNALS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-txt-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Real-Time Engine Active</span>
                </div>
              </div>

              {/* Signals Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Metric 1: Demand */}
                <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
                  <div className="text-[10px] uppercase font-bold text-txt-muted tracking-wider flex items-center justify-between">
                    <span>Demand Index</span>
                    <TrendingUp className="w-3 h-3 text-accent" />
                  </div>
                  <div className="text-lg font-black text-accent flex items-baseline gap-1">
                    ↑ 24%
                    <span className="text-[10px] font-medium text-txt-muted">vs last week</span>
                  </div>
                </div>

                {/* Metric 2: Price Movement */}
                <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
                  <div className="text-[10px] uppercase font-bold text-txt-muted tracking-wider flex items-center justify-between">
                    <span>Price Drop Index</span>
                    <TrendingDown className="w-3 h-3 text-indigo-accent" />
                  </div>
                  <div className="text-lg font-black text-txt-primary flex items-baseline gap-1 font-mono">
                    ↓ 8%
                    <span className="text-[10px] font-medium text-txt-muted">on smart deals</span>
                  </div>
                </div>

                {/* Metric 3: Inventory */}
                <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
                  <div className="text-[10px] uppercase font-bold text-txt-muted tracking-wider flex items-center justify-between">
                    <span>Inventory</span>
                    <ShieldCheck className="w-3 h-3 text-accent" />
                  </div>
                  <div className="text-sm font-bold text-txt-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Healthy (92%)
                  </div>
                </div>

                {/* Metric 4: Watchers */}
                <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
                  <div className="text-[10px] uppercase font-bold text-txt-muted tracking-wider flex items-center justify-between">
                    <span>Active Watchers</span>
                    <Eye className="w-3 h-3 text-txt-secondary" />
                  </div>
                  <div className="text-sm font-bold text-txt-primary font-mono">
                    1,284 Shoppers
                  </div>
                </div>
              </div>

              {/* Mini Sparkline Chart Visual */}
              <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-txt-muted font-medium">Sales Velocity Telemetry:</span>
                  <span className="text-accent font-bold font-mono">6.2 units/day</span>
                </div>
                {/* SVG Sparkline Graphic */}
                <div className="h-10 w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2DD4A8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2DD4A8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,32 Q25,28 50,18 T100,22 T150,8 T200,4 L200,40 L0,40 Z"
                      fill="url(#sparklineGrad)"
                    />
                    <path
                      d="M0,32 Q25,28 50,18 T100,22 T150,8 T200,4"
                      fill="none"
                      stroke="#2DD4A8"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRENDING DEMAND TICKER STRIP */}
      <section className="rounded-2xl bg-surface-card/70 border border-border-primary/60 backdrop-blur-md p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-txt-primary uppercase tracking-wider flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span>TRENDING DEMAND:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto py-1">
          {trendingItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-primary/80 border border-border-subtle"
            >
              <span className="font-semibold text-txt-primary">{item.name}</span>
              <span className="font-mono text-accent font-bold">{item.trend}</span>
              <span className="text-[10px] text-txt-muted px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle">
                Score: {item.score}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ACTIVE FILTERS CHIPS BAR */}
      {(categoryId || brandId || search || minPrice || maxPrice) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-xs text-txt-muted font-medium">Active Filters:</span>
          {selectedCategoryName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-card border border-border-primary text-xs text-txt-primary">
              Category: <strong className="text-accent">{selectedCategoryName}</strong>
              <button onClick={() => removeFilter('categoryId')} className="hover:text-status-danger ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrandName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-card border border-border-primary text-xs text-txt-primary">
              Brand: <strong className="text-accent">{selectedBrandName}</strong>
              <button onClick={() => removeFilter('brandId')} className="hover:text-status-danger ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-card border border-border-primary text-xs text-txt-primary">
              Query: <strong className="text-accent">"{search}"</strong>
              <button onClick={() => removeFilter('search')} className="hover:text-status-danger ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-card border border-border-primary text-xs text-txt-primary font-mono">
              Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}
              <button onClick={() => { removeFilter('minPrice'); removeFilter('maxPrice'); }} className="hover:text-status-danger ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-status-danger hover:underline ml-2 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* 4. MAIN DISCOVERY: Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* SIDEBAR FILTERS */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="prem-card p-5 space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
                Filters
              </span>
              <span className="text-[11px] text-txt-muted font-mono">{totalElements} products</span>
            </div>

            {/* Category Accordion */}
            <div className="space-y-2">
              <button
                onClick={() => setCatOpen(!catOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-txt-secondary hover:text-txt-primary uppercase tracking-wider"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 pt-1">
                  <button
                    onClick={() => updateFilter('categoryId', '')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      !categoryId
                        ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] text-txt-muted">{products.length}</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateFilter('categoryId', c.id.toString())}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between truncate ${
                        categoryId === c.id.toString()
                          ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                          : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Accordion */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => setBrandOpen(!brandOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-txt-secondary hover:text-txt-primary uppercase tracking-wider"
              >
                <span>Brands</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${brandOpen ? 'rotate-180' : ''}`} />
              </button>
              {brandOpen && (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 pt-1">
                  <button
                    onClick={() => updateFilter('brandId', '')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      !brandId
                        ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateFilter('brandId', b.id.toString())}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        brandId === b.id.toString()
                          ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                          : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card-hover'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
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

            {/* Demand Intelligence Quick Filter */}
            <div className="pt-2 border-t border-border-subtle space-y-2">
              <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Demand Status</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateFilter('sort', 'demandScore,desc')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${
                    sort.includes('demandScore')
                      ? 'bg-accent/15 border-accent/30 text-accent font-bold'
                      : 'bg-surface-card border-border-subtle text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  🔥 High Demand
                </button>
                <button
                  onClick={() => updateFilter('sort', 'price,asc')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${
                    sort === 'price,asc'
                      ? 'bg-accent/15 border-accent/30 text-accent font-bold'
                      : 'bg-surface-card border-border-subtle text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  💰 Lowest Price
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* PRODUCTS DISCOVERY SECTION */}
        <main className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Sort + Total Display */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="text-xs text-txt-secondary">
              Showing <strong className="text-txt-primary">{products.length}</strong> of {totalElements} demand-ranked products
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-txt-muted font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="prem-input text-xs py-1.5 px-3 rounded-xl cursor-pointer"
              >
                <option value="demandScore,desc">Demand Intelligence Score (Highest)</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="rating,desc">Customer Rating</option>
                <option value="salesVelocity,desc">Sales Velocity (Fastest)</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            /* SKELETON LOADING GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="prem-card p-4 space-y-4 animate-pulse">
                  <div className="w-full h-56 bg-bg-secondary rounded-2xl" />
                  <div className="h-4 bg-bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-bg-secondary rounded w-1/2" />
                  <div className="h-6 bg-bg-secondary rounded w-1/3" />
                  <div className="h-10 bg-bg-secondary rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* REFINED EMPTY STATE */
            <div className="prem-card p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-txt-primary">Nothing matched those filters</h3>
              <p className="text-xs text-txt-secondary">
                Try clearing your search filters or explore our trending technical categories.
              </p>
              <button
                onClick={clearFilters}
                className="prem-btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters & View All
              </button>
            </div>
          ) : (
            /* LIVE PRODUCT CARDS */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                const isHovered = hoveredCardId === product.id;
                const isOutOfStock = product.stock === 0;

                return (
                  <div
                    key={product.id}
                    onMouseEnter={() => setHoveredCardId(product.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="group prem-card hover:bg-surface-card-hover border border-border-primary hover:border-border-hover rounded-[20px] p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl relative"
                  >
                    <div>
                      {/* Product Image Stage */}
                      <div className="relative w-full h-56 rounded-2xl bg-bg-primary overflow-hidden mb-4 border border-border-subtle flex items-center justify-center">
                        <img
                          src={product.mainImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                          <span className="px-2 py-0.5 rounded-md bg-bg-secondary/90 backdrop-blur-md border border-border-subtle text-[10px] font-semibold text-txt-secondary">
                            {product.categoryName}
                          </span>
                          {product.discountPercentage > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-[10px] font-black text-accent">
                              {Math.round(product.discountPercentage)}% OFF
                            </span>
                          )}
                        </div>

                        {/* Stock & Availability Pill */}
                        <div className="absolute top-2.5 right-2.5">
                          {isOutOfStock ? (
                            <span className="px-2 py-0.5 rounded-md bg-status-warning/20 border border-status-warning/30 text-[10px] font-bold text-status-warning flex items-center gap-1">
                              ● Pre-Order
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="px-2 py-0.5 rounded-md bg-status-danger/20 border border-status-danger/30 text-[10px] font-bold text-status-danger flex items-center gap-1">
                              ● Only {product.stock} Left
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              ● In Stock
                            </span>
                          )}
                        </div>

                        {/* Quick View Intelligence Overlay on Hover */}
                        <div
                          className={`absolute inset-x-2 bottom-2 p-2.5 rounded-xl bg-bg-secondary/95 backdrop-blur-md border border-border-primary text-[11px] transition-all duration-200 shadow-xl ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                          }`}
                        >
                          <div className="flex items-center justify-between text-txt-muted text-[10px] pb-1 border-b border-border-subtle">
                            <span>Demand Score:</span>
                            <span className="font-bold text-accent font-mono">{product.inventoryHealthScore || 90}/100</span>
                          </div>
                          <div className="flex items-center justify-between text-txt-secondary text-[10px] pt-1">
                            <span>Sales Velocity:</span>
                            <span className="font-bold text-txt-primary font-mono">{product.salesVelocity || 2.5} units/day</span>
                          </div>
                        </div>
                      </div>

                      {/* Brand & Rating */}
                      <div className="flex items-center justify-between text-xs text-txt-muted mb-1">
                        <span className="font-semibold text-txt-secondary">{product.brandName}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{product.rating || 4.8}</span>
                          <span className="text-txt-muted font-normal">({product.reviewCount || 34})</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <Link
                        to={`/customer/product/${product.id}`}
                        className="font-bold text-sm text-txt-primary hover:text-accent line-clamp-2 leading-snug transition-colors mb-2.5 block"
                      >
                        {product.name}
                      </Link>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-black text-txt-primary font-mono">
                          ₹{product.finalPrice.toLocaleString()}
                        </span>
                        {product.discountPercentage > 0 && (
                          <span className="text-xs text-txt-muted line-through font-mono">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                        {product.discountPercentage > 0 && (
                          <span className="text-[10px] font-bold text-accent flex items-center">
                            ↓ {Math.round(product.discountPercentage)}%
                          </span>
                        )}
                      </div>

                      {/* Live Commerce Signal Pill */}
                      <div className="flex items-center justify-between text-[11px] text-txt-muted mb-4 pt-1 border-t border-border-subtle">
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          <span>Demand: High</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <Eye className="w-3 h-3 text-txt-muted" />
                          <span>120+ watching</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      {isOutOfStock ? (
                        <button
                          onClick={() => setPreOrderProduct(product)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-accent/20 border border-indigo-accent/40 text-indigo-accent font-bold text-xs hover:bg-indigo-accent/30 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5" /> Join Pre-Order
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            addItem(product.id, 1);
                            showToast(`Added ${product.name} to cart!`, 'success', 'Cart Updated');
                          }}
                          className="flex-1 prem-btn-primary text-xs py-2.5"
                        >
                          Add to Cart
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setPriceWatchProduct(product);
                          setTargetPriceInput(Math.round(product.finalPrice * 0.9).toString());
                        }}
                        className="p-2.5 rounded-xl bg-surface-card border border-border-primary hover:border-accent hover:text-accent text-txt-secondary transition-all"
                        title="Set Price Watch Alert"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 0}
                onClick={() => updateFilter('page', (page - 1).toString())}
                className="p-2 rounded-xl bg-surface-card border border-border-primary text-txt-secondary hover:text-txt-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('page', idx.toString())}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    page === idx
                      ? 'bg-accent text-bg-primary'
                      : 'bg-surface-card border border-border-primary text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => updateFilter('page', (page + 1).toString())}
                className="p-2 rounded-xl bg-surface-card border border-border-primary text-txt-secondary hover:text-txt-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 5. PRICE OPPORTUNITIES & PRE-ORDERS SHOWCASE */}
      <section className="rounded-3xl bg-surface-card/60 border border-border-primary/80 backdrop-blur-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-subtle">
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Intelligence Radar
            </div>
            <h2 className="text-xl font-bold text-txt-primary">Price Opportunities & Smart Pre-Orders</h2>
          </div>
          <Link
            to="/admin/demand-radar"
            className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
          >
            Explore Full Demand Radar <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Smart Pre-Order Card */}
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-indigo-accent/20 text-indigo-accent font-bold">
                COMING SOON
              </span>
              <span className="text-txt-muted">Expected in 10 Days</span>
            </div>
            <h3 className="font-bold text-sm text-txt-primary">Keychron Q1 Pro Wireless Mechanical Keyboard</h3>
            <p className="text-xs text-txt-secondary">
              CNC machined aluminum body with hot-swappable switches and double-gasket dampening.
            </p>
            {/* Progress Bar for Demand Target */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-txt-muted">Accumulated Demand:</span>
                <span className="text-accent font-mono">127 / 150 Target Units</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-card overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: '84%' }} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-black text-txt-primary font-mono">₹18,999</span>
              <button
                onClick={() => {
                  const q1 = products.find((p) => p.sku === 'GAM-KEYC-Q1PRO') || products[0];
                  setPreOrderProduct(q1);
                }}
                className="prem-btn-primary text-xs py-2 px-3"
              >
                Join Pre-Order
              </button>
            </div>
          </div>

          {/* Clustered Price Opportunity Card */}
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-bold">
                PRICE OPPORTUNITY
              </span>
              <span className="text-txt-muted font-mono">18 Watchers Clustered</span>
            </div>
            <h3 className="font-bold text-sm text-txt-primary">Bose QuietComfort Ultra Headphones</h3>
            <p className="text-xs text-txt-secondary">
              World-class active noise cancellation with breakthrough spatialized audio architecture.
            </p>
            <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between text-xs">
              <span className="text-txt-muted">Target Price Met:</span>
              <span className="font-bold text-emerald-400 font-mono">₹29,999 (Saved ₹2,311)</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-black text-txt-primary font-mono">₹29,999</span>
              <button
                onClick={() => {
                  const bose = products.find((p) => p.sku === 'AUD-BOSE-STUDIO') || products[0];
                  if (bose) addItem(bose.id, 1);
                  showToast('Smart deal item added to cart!', 'success');
                }}
                className="prem-btn-primary text-xs py-2 px-3"
              >
                Claim Deal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICE WATCH MODAL */}
      {priceWatchProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="prem-card max-w-md w-full p-6 space-y-5 shadow-2xl border border-border-hover animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-txt-primary">Set Price Watch Alert</h3>
              </div>
              <button onClick={() => setPriceWatchProduct(null)} className="text-txt-muted hover:text-txt-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-subtle">
              <img src={priceWatchProduct.mainImageUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-txt-primary truncate">{priceWatchProduct.name}</div>
                <div className="text-xs text-txt-muted">Current Price: <span className="font-mono text-txt-primary font-bold">₹{priceWatchProduct.finalPrice.toLocaleString()}</span></div>
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
                  We will automatically dispatch a notification when this item reaches or falls below your target.
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

      {/* 7. PRE-ORDER MODAL */}
      {preOrderProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="prem-card max-w-md w-full p-6 space-y-5 shadow-2xl border border-border-hover animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-accent" />
                <h3 className="text-sm font-bold text-txt-primary">Reserve Smart Pre-Order</h3>
              </div>
              <button onClick={() => setPreOrderProduct(null)} className="text-txt-muted hover:text-txt-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border-subtle">
              <img src={preOrderProduct.mainImageUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-txt-primary truncate">{preOrderProduct.name}</div>
                <div className="text-xs text-txt-muted font-mono">Price: ₹{preOrderProduct.finalPrice.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-accent/10 border border-indigo-accent/20 text-xs text-txt-secondary space-y-1">
              <div className="font-semibold text-txt-primary">📦 Guaranteed Restock Allocation</div>
              <p className="text-[11px] text-txt-muted leading-relaxed">
                By joining this pre-order, you secure priority fulfillment as soon as the supplier batch arrives (Estimated: 10-15 days).
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
                className="prem-btn-primary text-xs py-2 px-4 bg-indigo-accent text-white hover:bg-indigo-accent/80"
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
