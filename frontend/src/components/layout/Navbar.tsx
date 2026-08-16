import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { NotificationItem } from '../../types';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Heart,
  Bell,
  User,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Clock,
  ChevronDown,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchDemoPersona, isAdmin, isInventoryManager, isOrderManager } = useAuth();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/events/notifications');
      setNotifications(res.data);
      const countRes = await api.get('/events/notifications/unread-count');
      setUnreadCount(countRes.data.unreadCount || 0);
    } catch (err) {
      // Ignored
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await api.put(`/events/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNlpQuickSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/customer/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="glass-panel border-b border-slate-800/80 sticky top-0 z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tagline */}
          <Link to="/customer/products" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                AI Commerce <span className="text-emerald-400 text-[11px] px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 rounded-md font-semibold">INTELLIGENCE</span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Demand Radar & Operations Platform
              </div>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/customer/products"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                location.pathname === '/customer/products'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              Catalog
            </Link>
            <Link
              to="/customer/ai-assistant"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                location.pathname === '/customer/ai-assistant'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              AI Shopping Copilot
            </Link>
            <Link
              to="/customer/dashboard"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                location.pathname === '/customer/dashboard'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              My Orders & Watches
            </Link>
          </div>

          {/* Natural Language / Keyword Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, specs, or natural queries (e.g. laptop under 70000)..."
                className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </form>
          </div>

          {/* Action Icons & Controls */}
          <div className="flex items-center gap-2">
            {/* Interactive Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-850 border border-slate-700/80 hover:border-emerald-500/50 text-xs text-slate-300 transition-all"
                title="Switch Demo Persona"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-semibold">Persona:</span>
                <span className="text-emerald-400 font-bold capitalize">
                  {user?.roles?.[0] ? user.roles[0].replace('_', ' ').toLowerCase() : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-64 glass-panel bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Select 1-Click Demo Persona
                  </div>
                  <button
                    onClick={() => {
                      switchDemoPersona('admin', 'admin123');
                      setShowPersonaMenu(false);
                      navigate('/admin/dashboard');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">👑 Admin (Full Access)</div>
                      <div className="text-[10px] text-slate-400">Demand Radar, Pricing, Analytics</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoPersona('inventory_mgr', 'manager123');
                      setShowPersonaMenu(false);
                      navigate('/inventory/dashboard');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">📦 Inventory Manager</div>
                      <div className="text-[10px] text-slate-400">Stockouts, Dead-stock, POs</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoPersona('order_mgr', 'manager123');
                      setShowPersonaMenu(false);
                      navigate('/orders/dashboard');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">🛡️ Order & Risk Manager</div>
                      <div className="text-[10px] text-slate-400">Order lifecycle, Risk review</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchDemoPersona('customer1', 'customer123');
                      setShowPersonaMenu(false);
                      navigate('/customer/products');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">🛍️ Customer (Alex Johnson)</div>
                      <div className="text-[10px] text-slate-400">Storefront, Price watch, Pre-order</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Enterprise Dashboard Quick Link */}
            {(isAdmin || isInventoryManager || isOrderManager) && (
              <Link
                to={isAdmin ? '/admin/dashboard' : isInventoryManager ? '/inventory/dashboard' : '/orders/dashboard'}
                className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors relative"
                title="Operations Center"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200">Notifications</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{unreadCount} Unread</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkUrl) navigate(n.linkUrl);
                            setShowNotifications(false);
                          }}
                          className={`py-2.5 px-1.5 hover:bg-slate-800/50 cursor-pointer rounded-lg transition-colors text-xs ${
                            !n.isRead ? 'bg-slate-850/60 font-medium' : 'text-slate-400'
                          }`}
                        >
                          <div className="font-semibold text-slate-200 flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-scale">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user?.username?.substring(0, 1).toUpperCase()}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-panel bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-bold text-xs text-slate-200">{user?.fullName || user?.username}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/customer/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-300 block"
                    >
                      Customer Dashboard
                    </Link>
                    {(isAdmin || isInventoryManager || isOrderManager) && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs text-emerald-400 block font-semibold"
                      >
                        Operations Center
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-xs text-rose-400 flex items-center gap-2 mt-1 border-t border-slate-800/80"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
