import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Radio,
  Sparkles,
  PackageCheck,
  Boxes,
  ShieldAlert,
  RotateCcw,
  FileText,
  ArrowLeft,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const sections = [
    {
      heading: 'Intelligence & Overview',
      items: [
        {
          title: 'Executive Briefing',
          path: '/admin/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Demand Radar & Deals',
          path: '/admin/demand-radar',
          icon: Radio,
          badge: 'Radar',
        },
        {
          title: 'Seller AI Copilot',
          path: '/admin/ai-copilot',
          icon: Sparkles,
          badge: 'AI',
        },
      ],
    },
    {
      heading: 'Inventory & Operations',
      items: [
        {
          title: 'Smart Pre-Orders',
          path: '/admin/preorders',
          icon: PackageCheck,
          badge: 'Demand Inv',
        },
        {
          title: 'Inventory & Dead Stock',
          path: '/admin/inventory',
          icon: Boxes,
        },
      ],
    },
    {
      heading: 'Fulfillment & Risk',
      items: [
        {
          title: 'Orders & Risk Center',
          path: '/admin/orders',
          icon: ShieldAlert,
        },
        {
          title: 'Returns & Refunds',
          path: '/admin/returns',
          icon: RotateCcw,
        },
        {
          title: 'Coupons & Audit Log',
          path: '/admin/audit-logs',
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-black/[0.06] flex flex-col flex-shrink-0 min-h-screen text-txt-secondary">
      {/* Header */}
      <div className="p-4 border-b border-black/[0.06] bg-[#FDFBF7]">
        <Link to="/customer/products" className="flex items-center gap-1.5 text-xs text-txt-muted hover:text-brand-crimson mb-3 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-crimson text-white flex items-center justify-center font-bold text-xs shadow-sm">
            OP
          </div>
          <div>
            <h2 className="text-xs font-serif font-bold text-txt-primary">Operations Center</h2>
            <p className="text-[10px] text-txt-muted capitalize">
              Role: {user?.roles?.[0] ? user.roles[0].replace('_', ' ').toLowerCase() : 'Operator'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="text-[10px] font-bold text-txt-muted uppercase tracking-wider px-3 py-1">
              {section.heading}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-crimson/10 text-brand-crimson font-bold border border-brand-crimson/20 shadow-sm'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-[#F7F4EE] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-crimson' : 'text-txt-muted'}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-brand-crimson/10 text-brand-crimson border border-brand-crimson/20 px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-black/[0.06] text-[11px] text-txt-muted bg-[#FDFBF7]">
        <div className="flex items-center gap-1.5 text-txt-secondary font-medium mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-crimson animate-pulse" />
          <span>Demand Engine Active</span>
        </div>
        <div className="text-[10px]">Continuous behavioral tracking</div>
      </div>
    </aside>
  );
};
