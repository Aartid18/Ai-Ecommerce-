import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Radar,
  Bot,
  PackageCheck,
  Boxes,
  ShieldAlert,
  RotateCcw,
  Tag,
  FileText,
  ShoppingBag,
  ArrowLeft,
  Users,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, isInventoryManager, isOrderManager } = useAuth();

  const navItems = [
    {
      title: 'Executive Briefing',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'INVENTORY_MANAGER', 'ORDER_MANAGER'],
    },
    {
      title: 'Demand Radar & Deals',
      path: '/admin/demand-radar',
      icon: Radar,
      badge: 'Radar',
      roles: ['ADMIN', 'INVENTORY_MANAGER'],
    },
    {
      title: 'Seller AI Copilot',
      path: '/admin/ai-copilot',
      icon: Bot,
      badge: 'AI Copilot',
      roles: ['ADMIN', 'INVENTORY_MANAGER', 'ORDER_MANAGER'],
    },
    {
      title: 'Smart Pre-Orders',
      path: '/admin/preorders',
      icon: PackageCheck,
      badge: 'Demand Inv',
      roles: ['ADMIN', 'INVENTORY_MANAGER'],
    },
    {
      title: 'Inventory & Dead Stock',
      path: '/admin/inventory',
      icon: Boxes,
      roles: ['ADMIN', 'INVENTORY_MANAGER'],
    },
    {
      title: 'Orders & Risk Center',
      path: '/admin/orders',
      icon: ShieldAlert,
      roles: ['ADMIN', 'ORDER_MANAGER'],
    },
    {
      title: 'Returns & Refunds',
      path: '/admin/returns',
      icon: RotateCcw,
      roles: ['ADMIN', 'ORDER_MANAGER'],
    },
    {
      title: 'Coupons & Audit Log',
      path: '/admin/audit-logs',
      icon: FileText,
      roles: ['ADMIN'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen">
      {/* Header */}
      <div className="p-5 border-b border-slate-800">
        <Link to="/customer/products" className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            OP
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Operations Hub</h2>
            <p className="text-[11px] text-slate-400 capitalize">
              Role: {user?.roles?.[0] ? user.roles[0].replace('_', ' ').toLowerCase() : 'Operator'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5">
          Intelligence & Actions
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/40">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Demand Engine Active</span>
        </div>
        <div>Aggregated signals tracking 24/7</div>
      </div>
    </aside>
  );
};
