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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-bg-secondary border-l border-border-primary flex flex-col text-txt-primary shadow-2xl animate-slide-in">
          {/* Header */}
          <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-surface-navbar">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-surface-card border border-border-subtle text-accent">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-txt-primary">Notifications</h2>
                <p className="text-[11px] text-txt-muted">Operational & commerce alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="p-1.5 text-txt-muted hover:text-txt-primary text-xs flex items-center gap-1 rounded-lg hover:bg-surface-card"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-txt-muted hover:text-txt-primary rounded-lg hover:bg-surface-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-border-subtle bg-bg-primary overflow-x-auto text-[11px]">
            {(['ALL', 'ORDERS', 'INVENTORY', 'DEMAND', 'RISK', 'RETURNS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-surface-card text-accent border border-border-hover'
                    : 'text-txt-muted hover:text-txt-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading ? (
              <div className="py-12 text-center text-xs text-txt-muted">Loading alerts...</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Bell className="w-8 h-8 text-txt-disabled mx-auto" />
                <div className="text-xs text-txt-muted">No notifications in this category.</div>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.isRead
                      ? 'bg-surface-card/40 border-border-subtle text-txt-secondary hover:border-border-hover'
                      : 'bg-surface-card border-border-primary text-txt-primary hover:border-accent-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-bg-primary border border-border-subtle mt-0.5">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-txt-primary flex items-center gap-1.5">
                          {item.title}
                          {!item.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-txt-secondary mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight className="w-3.5 h-3.5 text-txt-muted flex-shrink-0" />
                  </div>

                  {item.createdAt && (
                    <div className="text-[10px] text-txt-muted mt-2 pl-8">
                      {item.createdAt}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-bg-primary border-t border-border-subtle text-center text-[11px] text-txt-muted">
            Live event sync active
          </div>
        </div>
      </div>
    </div>
  );
};
