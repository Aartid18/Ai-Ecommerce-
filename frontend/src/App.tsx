import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { ActivityFeedBanner } from './components/layout/ActivityFeedBanner';
import { CartDrawer } from './components/layout/CartDrawer';

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
      <footer className="relative z-10 bg-bg-secondary/80 backdrop-blur-md border-t border-border-primary/60 py-8 px-4 text-center text-xs text-txt-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-txt-primary">AI Commerce Intelligence Platform</span>
            <span>•</span>
            <span className="text-txt-secondary">Demand Radar & Real-Time Commerce</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-txt-muted">
            <span className="text-accent font-medium">Customer Demand</span>
            <span>→</span>
            <span className="text-indigo-accent font-medium">Intelligence Engine</span>
            <span>→</span>
            <span className="text-status-warning font-medium">Smart Deals</span>
            <span>→</span>
            <span className="text-status-success font-medium">Guaranteed Margin</span>
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
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
