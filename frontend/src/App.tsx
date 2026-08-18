import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { ActivityFeedBanner } from './components/layout/ActivityFeedBanner';
import { CartDrawer } from './components/layout/CartDrawer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Customer Pages
import { StoreCatalog } from './pages/customer/StoreCatalog';
import { ProductDetail } from './pages/customer/ProductDetail';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerAiCopilot } from './pages/customer/CustomerAiCopilot';

// Operations / Seller Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DemandRadarPage } from './pages/admin/DemandRadarPage';
import { SellerAiCopilot } from './pages/admin/SellerAiCopilot';
import { InventoryOperationsPage } from './pages/admin/InventoryOperationsPage';
import { SmartPreOrdersPage } from './pages/admin/SmartPreOrdersPage';
import { OrderRiskManagementPage } from './pages/admin/OrderRiskManagementPage';
import { ReturnsManagementPage } from './pages/admin/ReturnsManagementPage';
import { CouponsAndAuditPage } from './pages/admin/CouponsAndAuditPage';

import { LivingBackground } from './components/layout/LivingBackground';

// Customer Layout Layout Wrapper
const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-txt-primary selection:bg-accent selection:text-bg-primary relative">
      <LivingBackground />
      <ActivityFeedBanner />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <CartDrawer />
      <MobileBottomNav />
      {/* Large Premium Editorial Footer */}
      <footer className="relative z-10 bg-[#141414] text-[#FAF8F5] pt-16 pb-20 md:pb-12 px-6 sm:px-12 mt-16 rounded-t-[48px] shadow-2xl border-t border-black/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
            {/* Column 1: Brand & Vision */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-crimson text-white flex items-center justify-center font-bold text-sm">
                  AI
                </div>
                <div className="font-serif text-xl font-normal tracking-wide text-white">
                  AI Commerce <span className="text-brand-crimson italic">Intelligence</span>
                </div>
              </div>
              <p className="text-xs text-white/70 max-w-sm leading-relaxed">
                Next-generation editorial hardware marketplace backed by real-time demand radar signals, price-drop telemetry, and autonomous inventory operations.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-white/60">
                <span className="w-2 h-2 rounded-full bg-brand-crimson animate-pulse" />
                <span>Demand Intelligence Engine Live</span>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="md:col-span-2 space-y-3 text-xs">
              <div className="font-bold text-white uppercase tracking-widest text-[11px]">Platform</div>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/customer/products" className="hover:text-white transition-colors">Curated Catalog</Link></li>
                <li><Link to="/admin/demand-radar" className="hover:text-white transition-colors">Demand Radar</Link></li>
                <li><Link to="/customer/ai-assistant" className="hover:text-white transition-colors">Shopping Copilot</Link></li>
                <li><Link to="/customer/dashboard" className="hover:text-white transition-colors">Price Watches</Link></li>
              </ul>
            </div>

            {/* Column 3: Operations & Roles */}
            <div className="md:col-span-2 space-y-3 text-xs">
              <div className="font-bold text-white uppercase tracking-widest text-[11px]">Operations</div>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Executive Briefing</Link></li>
                <li><Link to="/inventory/dashboard" className="hover:text-white transition-colors">Inventory Telemetry</Link></li>
                <li><Link to="/admin/preorders" className="hover:text-white transition-colors">Smart Pre-Orders</Link></li>
                <li><Link to="/admin/orders" className="hover:text-white transition-colors">Order Risk Review</Link></li>
              </ul>
            </div>

            {/* Column 4: Governance & Support */}
            <div className="md:col-span-3 space-y-3 text-xs">
              <div className="font-bold text-white uppercase tracking-widest text-[11px]">Trust & Assurance</div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Every verified hardware order is backed by automated stock-reservation guarantees and real-time reverse logistics support.
              </p>
              <div className="pt-1 text-[11px] text-white/50">
                Enterprise Support: <span className="text-white font-mono">ops@commerce.ai</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
            <div>
              © 2026 AI Commerce Intelligence Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Security Audit</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Admin / Operations Layout Wrapper
const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-txt-primary relative">
      <LivingBackground />
      <ActivityFeedBanner />
      <div className="flex-1 flex overflow-hidden relative z-10">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-bg-primary/70 backdrop-blur-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Customer Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Navigate to="/customer/products" replace />} />
                    <Route path="/customer/products" element={<StoreCatalog />} />
                    <Route path="/customer/product/:id" element={<ProductDetail />} />
                    <Route path="/customer/cart" element={<CartPage />} />
                    <Route path="/customer/checkout" element={<CheckoutPage />} />
                    <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                    <Route path="/customer/orders" element={<CustomerDashboard />} />
                    <Route path="/customer/wishlist" element={<CustomerDashboard />} />
                    <Route path="/customer/preorders" element={<CustomerDashboard />} />
                    <Route path="/customer/price-watches" element={<CustomerDashboard />} />
                    <Route path="/customer/profile" element={<CustomerDashboard />} />
                    <Route path="/customer/ai-assistant" element={<CustomerAiCopilot />} />
                  </Route>

                  {/* Admin & Operations Routes */}
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/analytics" element={<AdminDashboard />} />
                    <Route path="/admin/demand-radar" element={<DemandRadarPage />} />
                    <Route path="/admin/ai-copilot" element={<SellerAiCopilot />} />
                    <Route path="/admin/inventory" element={<InventoryOperationsPage />} />
                    <Route path="/admin/products" element={<InventoryOperationsPage />} />
                    <Route path="/admin/categories" element={<InventoryOperationsPage />} />
                    <Route path="/admin/brands" element={<InventoryOperationsPage />} />
                    <Route path="/admin/preorders" element={<SmartPreOrdersPage />} />
                    <Route path="/admin/orders" element={<OrderRiskManagementPage />} />
                    <Route path="/admin/risk" element={<OrderRiskManagementPage />} />
                    <Route path="/admin/returns" element={<ReturnsManagementPage />} />
                    <Route path="/admin/coupons" element={<CouponsAndAuditPage />} />
                    <Route path="/admin/users" element={<CouponsAndAuditPage />} />
                    <Route path="/admin/audit-logs" element={<CouponsAndAuditPage />} />

                    {/* Direct Manager Shortcuts */}
                    <Route path="/inventory/dashboard" element={<InventoryOperationsPage />} />
                    <Route path="/inventory/products" element={<InventoryOperationsPage />} />
                    <Route path="/inventory/forecast" element={<InventoryOperationsPage />} />
                    <Route path="/inventory/dead-stock" element={<InventoryOperationsPage />} />
                    <Route path="/inventory/reorders" element={<InventoryOperationsPage />} />
                    <Route path="/inventory/suppliers" element={<InventoryOperationsPage />} />

                    <Route path="/orders/dashboard" element={<OrderRiskManagementPage />} />
                    <Route path="/orders/manage" element={<OrderRiskManagementPage />} />
                    <Route path="/orders/risk" element={<OrderRiskManagementPage />} />
                    <Route path="/orders/returns" element={<ReturnsManagementPage />} />
                  </Route>

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/customer/products" replace />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
