import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Order, PriceWatch, PreOrder, ReturnRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ReturnRequestModal } from '../../components/modals/ReturnRequestModal';
import {
  ShoppingBag,
  Bell,
  PackageCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [priceWatches, setPriceWatches] = useState<PriceWatch[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'orders' | 'watches' | 'preorders' | 'returns'>('orders');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordRes, watchRes, preRes, retRes, recRes] = await Promise.allSettled([
        api.get('/orders/my-orders'),
        api.get('/price-watches'),
        api.get('/preorders/my-preorders'),
        api.get('/returns/my-returns'),
        api.get('/recommendations/personalized'),
      ]);

      if (ordRes.status === 'fulfilled') setOrders(Array.isArray(ordRes.value.data) ? ordRes.value.data : []);
      if (watchRes.status === 'fulfilled') setPriceWatches(Array.isArray(watchRes.value.data) ? watchRes.value.data : []);
      if (preRes.status === 'fulfilled') setPreOrders(Array.isArray(preRes.value.data) ? preRes.value.data : []);
      if (retRes.status === 'fulfilled') setReturns(Array.isArray(retRes.value.data) ? retRes.value.data : []);
      if (recRes.status === 'fulfilled') setRecommendations(Array.isArray(recRes.value.data) ? recRes.value.data : []);
    } catch (err) {
      console.error('Error loading customer dashboard', err);
      setOrders([]);
      setPriceWatches([]);
      setPreOrders([]);
      setReturns([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full bg-[#3A835C]/15 text-[#3A835C] text-[10px] font-bold border border-[#3A835C]/25">● Delivered</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 text-[10px] font-bold border border-blue-500/25">● In Transit</span>;
      case 'CONFIRMED':
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold text-[10px] font-bold border border-brand-gold/25">● Confirmed</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full bg-black/10 text-txt-secondary text-[10px] font-bold">● Processing</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-black/10 text-txt-secondary text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="prem-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-crimson text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.username?.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif text-txt-primary">{user?.fullName || user?.username}</h1>
              <span className="px-2 py-0.5 rounded-full bg-[#3A835C]/15 text-[#3A835C] text-[10px] font-bold">
                Verified Shopper
              </span>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-[#F7F4EE] rounded-2xl border border-black/[0.04] text-center">
            <div className="text-[10px] text-txt-muted uppercase font-bold tracking-wider">Orders</div>
            <div className="text-sm font-bold text-txt-primary mt-0.5">{orders.length}</div>
          </div>
          <div className="p-3 bg-[#F7F4EE] rounded-2xl border border-black/[0.04] text-center">
            <div className="text-[10px] text-txt-muted uppercase font-bold tracking-wider">Price Watches</div>
            <div className="text-sm font-bold text-brand-crimson mt-0.5">{priceWatches.length}</div>
          </div>
          <div className="p-3 bg-[#F7F4EE] rounded-2xl border border-black/[0.04] text-center">
            <div className="text-[10px] text-txt-muted uppercase font-bold tracking-wider">Pre-Orders</div>
            <div className="text-sm font-bold text-brand-gold mt-0.5">{preOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-black/[0.08] gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-brand-crimson text-brand-crimson'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('watches')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'watches'
              ? 'border-brand-crimson text-brand-crimson'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Bell className="w-4 h-4" />
          Price Watches ({priceWatches.length})
        </button>

        <button
          onClick={() => setActiveTab('preorders')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'preorders'
              ? 'border-brand-crimson text-brand-crimson'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Pre-Orders ({preOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'returns'
              ? 'border-brand-crimson text-brand-crimson'
              : 'border-transparent text-txt-muted hover:text-txt-primary'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Returns ({returns.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="prem-card p-12 text-center bg-white border border-black/[0.08] rounded-3xl space-y-2">
              <ShoppingBag className="w-8 h-8 text-txt-muted mx-auto mb-2" />
              <div className="text-sm font-bold text-txt-primary">No orders placed yet</div>
              <p className="text-xs text-txt-muted">Your verified orders will appear here with live tracking telemetry.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="prem-card p-5 space-y-4 bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.06] text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-txt-primary font-mono text-sm">{order.orderNumber}</span>
                    <span className="text-txt-muted text-[11px]">{order.createdAt?.substring(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getOrderStatusBadge(order.orderStatus)}
                    <span className="font-bold text-txt-primary font-sans text-sm">
                      ₹{order.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-txt-primary">{item.productName}</span>
                        <span className="text-txt-muted text-[11px]">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-medium text-txt-secondary">
                        ₹{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-txt-muted">
                    <Truck className="w-3.5 h-3.5 text-[#3A835C]" />
                    <span>Verified Courier Tracking Active</span>
                  </div>
                  {order.orderStatus === 'DELIVERED' && (
                    <button
                      onClick={() => setSelectedOrderForReturn(order)}
                      className="text-brand-crimson hover:underline font-semibold text-xs"
                    >
                      Request Return or Refund
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Price Watches Tab */}
      {activeTab === 'watches' && (
        <div className="space-y-4">
          {priceWatches.length === 0 ? (
            <div className="prem-card p-12 text-center bg-white border border-black/[0.08] rounded-3xl space-y-2">
              <Bell className="w-8 h-8 text-txt-muted mx-auto mb-2" />
              <div className="text-sm font-bold text-txt-primary">No active price watches</div>
              <p className="text-xs text-txt-muted">Click the bell icon on any product to track target discounts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {priceWatches.map((pw) => (
                <div key={pw.id} className="p-5 rounded-3xl bg-white border border-black/[0.08] shadow-prem-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-txt-primary truncate max-w-[200px]">
                      {pw.product?.name || `Product #${pw.id}`}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson/10 text-brand-crimson text-[10px] font-bold">
                      Target: ₹{pw.targetPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-txt-muted">
                    <span>Current: <strong className="text-txt-primary">₹{(pw.product?.finalPrice || pw.initialPrice || 0).toLocaleString()}</strong></span>
                    <span className="text-[11px] text-[#3A835C] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live Tracking
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pre-Orders Tab */}
      {activeTab === 'preorders' && (
        <div className="space-y-4">
          {preOrders.length === 0 ? (
            <div className="prem-card p-12 text-center bg-white border border-black/[0.08] rounded-3xl space-y-2">
              <PackageCheck className="w-8 h-8 text-txt-muted mx-auto mb-2" />
              <div className="text-sm font-bold text-txt-primary">No active pre-orders</div>
              <p className="text-xs text-txt-muted">Pre-order out-of-stock items for guaranteed factory allocations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {preOrders.map((po) => (
                <div key={po.id} className="p-5 rounded-3xl bg-white border border-black/[0.08] shadow-prem-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-txt-primary truncate max-w-[200px]">
                      {po.productName || `Product #${po.productId}`}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold text-[10px] font-bold">
                      {po.status || 'RESERVED'}
                    </span>
                  </div>
                  <div className="text-xs text-txt-muted">
                    Quantity: <strong className="text-txt-primary">{po.quantity}</strong> unit(s)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="prem-card p-12 text-center bg-white border border-black/[0.08] rounded-3xl space-y-2">
              <RotateCcw className="w-8 h-8 text-txt-muted mx-auto mb-2" />
              <div className="text-sm font-bold text-txt-primary">No return requests</div>
              <p className="text-xs text-txt-muted">Delivered orders qualify for 7-day return coverage.</p>
            </div>
          ) : (
            returns.map((ret) => (
              <div key={ret.id} className="p-5 rounded-3xl bg-white border border-black/[0.08] shadow-prem-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-txt-primary">Return #{ret.id} (Order #{ret.orderId})</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson/10 text-brand-crimson text-[10px] font-bold">
                    {ret.status}
                  </span>
                </div>
                <p className="text-xs text-txt-secondary">{ret.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Return Request Modal */}
      {selectedOrderForReturn && (
        <ReturnRequestModal
          order={selectedOrderForReturn}
          isOpen={!!selectedOrderForReturn}
          onClose={() => setSelectedOrderForReturn(null)}
          onSuccess={() => {
            setSelectedOrderForReturn(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
