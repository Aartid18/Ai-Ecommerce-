import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CommandPalette } from './CommandPalette';
import { NotificationDrawer } from './NotificationDrawer';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Bell,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Layers,
  Command,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchDemoPersona, isAdmin, isInventoryManager, isOrderManager } = useAuth();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-30 bg-surface-navbar/90 backdrop-blur-xl border-b border-border-subtle transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo & Identifier */}
            <Link to="/customer/products" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-xl bg-surface-card border border-border-primary p-0.5 flex items-center justify-center group-hover:border-accent-border transition-colors">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="font-bold text-xs tracking-tight text-txt-primary flex items-center gap-1.5">
                  AI Commerce <span className="text-accent text-[10px] px-1.5 py-0.2 bg-accent-subtle border border-accent-border rounded font-semibold">INTELLIGENCE</span>
                </div>
                <div className="text-[10px] text-txt-muted hidden sm:block">
                  Demand Radar & Operations
                </div>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/customer/products"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  location.pathname === '/customer/products'
                    ? 'text-accent bg-accent-subtle border border-accent-border'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card'
                }`}
              >
                Catalog
              </Link>
              <Link
                to="/admin/demand-radar"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  location.pathname.startsWith('/admin/demand-radar')
                    ? 'text-accent bg-accent-subtle border border-accent-border'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card'
                }`}
              >
                Demand Radar
              </Link>
              <Link
                to="/customer/ai-assistant"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/customer/ai-assistant'
                    ? 'text-accent bg-accent-subtle border border-accent-border'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                AI Shopping Copilot
              </Link>
              <Link
                to="/customer/dashboard"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  location.pathname.startsWith('/customer/dashboard') || location.pathname.startsWith('/customer/orders')
                    ? 'text-accent bg-accent-subtle border border-accent-border'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card'
                }`}
              >
                Orders & Watches
              </Link>
            </div>

            {/* Global Search / Command Bar Trigger */}
            <div className="flex-1 max-w-sm hidden lg:block">
              <button
                type="button"
                onClick={() => setShowCommandPalette(true)}
                className="w-full flex items-center justify-between bg-bg-primary border border-border-subtle hover:border-border-hover rounded-xl px-3 py-1.5 text-xs text-txt-muted transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-txt-muted" />
                  <span>Search products, specs, signals...</span>
                </div>
                <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-txt-muted bg-surface-card border border-border-subtle rounded">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Persona Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-card border border-border-subtle hover:border-border-hover text-xs text-txt-secondary transition-all"
                  title="Switch Role Persona"
                >
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span className="hidden sm:inline font-medium text-txt-muted">Role:</span>
                  <span className="text-txt-primary font-semibold capitalize text-[11px]">
                    {user?.roles?.[0] ? user.roles[0].replace('_', ' ').toLowerCase() : 'Guest'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-txt-muted" />
                </button>

                {showPersonaMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                    <div className="text-[10px] font-bold text-txt-muted uppercase tracking-wider px-2 py-1">
                      Select Demo Persona
                    </div>
                    <button
                      onClick={() => {
                        switchDemoPersona('admin', 'admin123');
                        setShowPersonaMenu(false);
                        navigate('/admin/dashboard');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-card text-xs text-txt-secondary hover:text-txt-primary flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-txt-primary">👑 Admin (Full Access)</div>
                        <div className="text-[10px] text-txt-muted">Demand Radar, Pricing, Analytics</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        switchDemoPersona('inventory_mgr', 'manager123');
                        setShowPersonaMenu(false);
                        navigate('/inventory/dashboard');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-card text-xs text-txt-secondary hover:text-txt-primary flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-txt-primary">📦 Inventory Manager</div>
                        <div className="text-[10px] text-txt-muted">Stockouts, Dead-stock, POs</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        switchDemoPersona('order_mgr', 'manager123');
                        setShowPersonaMenu(false);
                        navigate('/orders/dashboard');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-card text-xs text-txt-secondary hover:text-txt-primary flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-txt-primary">🛡️ Order & Risk Manager</div>
                        <div className="text-[10px] text-txt-muted">Order lifecycle, Risk review</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        switchDemoPersona('customer1', 'customer123');
                        setShowPersonaMenu(false);
                        navigate('/customer/products');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-card text-xs text-txt-secondary hover:text-txt-primary flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-txt-primary">🛍️ Customer (Alex Johnson)</div>
                        <div className="text-[10px] text-txt-muted">Storefront, Price watch, Pre-order</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Operations Shortcut */}
              {(isAdmin || isInventoryManager || isOrderManager) && (
                <Link
                  to={isAdmin ? '/admin/dashboard' : isInventoryManager ? '/inventory/dashboard' : '/orders/dashboard'}
                  className="p-2 text-txt-secondary hover:text-accent hover:bg-surface-card rounded-lg transition-colors"
                  title="Operations Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              )}

              {/* Notification Drawer Trigger */}
              <button
                onClick={() => setShowNotificationDrawer(true)}
                className="p-2 text-txt-secondary hover:text-txt-primary hover:bg-surface-card rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
              </button>

              {/* Shopping Cart Trigger */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-txt-secondary hover:text-accent hover:bg-surface-card rounded-lg transition-colors relative"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-accent text-bg-primary font-bold text-[9px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Menu / Sign In */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-surface-card text-txt-secondary"
                  >
                    <div className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle text-accent flex items-center justify-center font-bold text-[11px]">
                      {user?.username?.substring(0, 1).toUpperCase()}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border-primary rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-border-subtle">
                        <div className="font-semibold text-xs text-txt-primary truncate">{user?.fullName || user?.username}</div>
                        <div className="text-[10px] text-txt-muted truncate">{user?.email}</div>
                      </div>
                      <Link
                        to="/customer/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-card text-xs text-txt-secondary hover:text-txt-primary block mt-1"
                      >
                        Customer Dashboard
                      </Link>
                      {(isAdmin || isInventoryManager || isOrderManager) && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-card text-xs text-accent block font-medium"
                        >
                          Operations Center
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-status-danger-subtle text-xs text-status-danger flex items-center gap-2 mt-1 border-t border-border-subtle"
                      >
                        <LogOut className="w-3 h-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="prem-btn-primary text-xs py-1.5 px-3"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Global Command Palette */}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      {/* Global Notification Drawer */}
      <NotificationDrawer isOpen={showNotificationDrawer} onClose={() => setShowNotificationDrawer(false)} />
    </>
  );
};
