import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  X,
  Package,
  Boxes,
  Radio,
  ShieldAlert,
  RotateCcw,
  CheckCheck,
  ArrowUpRight,
} from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string; // SYSTEM, ORDER, INVENTORY, DEMAND, RISK, RETURN
  linkUrl?: string;
  isRead: boolean;
  createdAt?: string;
}

export const NotificationDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ORDERS' | 'INVENTORY' | 'DEMAND' | 'RISK' | 'RETURNS'>('ALL');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/my');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
      } else {
        setNotifications([
          {
            id: 101,
            title: 'Price Watch Alert',
            message: 'Wireless Studio Headphones target price met (₹2,599).',
            type: 'DEMAND',
            linkUrl: '/customer/product/5',
            isRead: false,
            createdAt: 'Just now',
          },
          {
            id: 102,
            title: 'Stockout Predicted',
            message: 'USB-C Hub may reach zero stock in under 48 hours.',
            type: 'INVENTORY',
            linkUrl: '/admin/inventory',
            isRead: false,
            createdAt: '12m ago',
          },
          {
            id: 103,
            title: 'High-Risk Order Flagged',
            message: 'Order #ORD-10287-RISK flagged with risk score 82/100.',
            type: 'RISK',
            linkUrl: '/admin/orders',
            isRead: true,
            createdAt: '1h ago',
          },
        ]);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
      } catch (err) {}
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
    }
    onClose();
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ORDERS') return n.type === 'ORDER';
    if (activeTab === 'INVENTORY') return n.type === 'INVENTORY';
    if (activeTab === 'DEMAND') return n.type === 'DEMAND' || n.type === 'PRICE_WATCH';
    if (activeTab === 'RISK') return n.type === 'RISK';
    if (activeTab === 'RETURNS') return n.type === 'RETURN';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-3.5 h-3.5 text-txt-primary" />;
      case 'INVENTORY':
        return <Boxes className="w-3.5 h-3.5 text-status-warning" />;
      case 'DEMAND':
      case 'PRICE_WATCH':
        return <Radio className="w-3.5 h-3.5 text-accent" />;
      case 'RISK':
        return <ShieldAlert className="w-3.5 h-3.5 text-status-danger" />;
      case 'RETURN':
        return <RotateCcw className="w-3.5 h-3.5 text-indigo-accent" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-txt-muted" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] border-l border-black/[0.10] flex flex-col text-txt-primary shadow-2xl animate-slide-in">
          {/* Header */}
          <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-serif font-bold text-txt-primary">Notifications</h2>
                <p className="text-[11px] text-txt-muted">Operational & demand alerts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-txt-muted hover:text-txt-primary rounded-full hover:bg-[#F4F0E8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-black/[0.06] bg-white">
            {(['ALL', 'ORDERS', 'INVENTORY', 'DEMAND', 'RISK', 'RETURNS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-crimson text-white shadow-sm'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-[#F4F0E8]'
                }`}
              >
                {tab.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="px-5 py-2.5 bg-[#F7F4EE] border-b border-black/[0.04] flex items-center justify-between text-xs text-txt-muted">
            <span>{filtered.length} updates</span>
            <button
              onClick={handleMarkAllRead}
              className="text-brand-crimson hover:underline flex items-center gap-1 text-[11px] font-semibold"
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading ? (
              <div className="space-y-3 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-black/[0.04]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-txt-muted space-y-2">
                <Bell className="w-8 h-8 text-txt-muted/40 mx-auto" />
                <div className="text-xs font-semibold text-txt-primary">No notifications</div>
                <div className="text-[11px]">You're all caught up with events.</div>
              </div>
            ) : (
              filtered.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${
                    notif.isRead
                      ? 'bg-white border-black/[0.06] text-txt-secondary hover:border-black/[0.15] shadow-prem-sm'
                      : 'bg-white border-brand-crimson/30 shadow-prem-md text-txt-primary'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#F7F4EE] border border-black/[0.04] flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="text-xs font-bold text-txt-primary truncate">{notif.title}</h4>
                      <span className="text-[10px] text-txt-muted whitespace-nowrap">{notif.createdAt || 'Just now'}</span>
                    </div>
                    <p className="text-xs text-txt-secondary leading-snug">{notif.message}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-txt-muted flex-shrink-0 mt-0.5" />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t border-black/[0.06] text-center text-[11px] text-txt-muted">
            Live telemetry stream active
          </div>
        </div>
      </div>
    </div>
  );
};
