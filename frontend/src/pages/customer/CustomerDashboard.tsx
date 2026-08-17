import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Order, PriceWatch, PreOrder, ReturnRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/shared/Badge';
import { ReturnRequestModal } from '../../components/modals/ReturnRequestModal';
import {
  ShoppingBag,
  Bell,
  PackageCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
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

      if (ordRes.status === 'fulfilled') setOrders(ordRes.value.data);
      if (watchRes.status === 'fulfilled') setPriceWatches(watchRes.value.data);
      if (preRes.status === 'fulfilled') setPreOrders(preRes.value.data);
      if (retRes.status === 'fulfilled') setReturns(retRes.value.data);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data);
    } catch (err) {
      console.error('Error loading customer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="emerald" dot>Delivered</Badge>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="blue" dot>In Transit ({status.replace('_', ' ')})</Badge>;
      case 'CONFIRMED':
      case 'PACKED':
        return <Badge variant="amber" dot>Processing</Badge>;
      case 'CANCELLED':
        return <Badge variant="rose" dot>Cancelled</Badge>;
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return <Badge variant="purple" dot>Return in Progress</Badge>;
      default:
        return <Badge variant="slate" dot>Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Summary */}
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle border border-accent-border text-accent font-bold text-lg flex items-center justify-center">
            {user?.username?.substring(0, 2).toUpperCase() || 'CU'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-txt-primary">{user?.fullName || user?.username}</h1>
              <Badge variant="emerald" size="sm">Verified</Badge>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-center">
            <div className="text-[10px] text-txt-muted uppercase font-semibold">Orders</div>
            <div className="text-sm font-bold text-txt-primary mt-0.5">{orders.length}</div>
          </div>
          <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-center">
            <div className="text-[10px] text-txt-muted uppercase font-semibold">Price Alerts</div>
            <div className="text-sm font-bold text-accent mt-0.5">{priceWatches.length}</div>
          </div>
          <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-center">
            <div className="text-[10px] text-txt-muted uppercase font-semibold">Pre-Orders</div>
            <div className="text-sm font-bold text-indigo-accent mt-0.5">{preOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border-subtle gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-accent text-accent'
              : 'border-transparent text-txt-muted hover:text-txt-secondary'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('watches')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'watches'
              ? 'border-accent text-accent'
              : 'border-transparent text-txt-muted hover:text-txt-secondary'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Price Watches ({priceWatches.length})
        </button>

        <button
          onClick={() => setActiveTab('preorders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'preorders'
              ? 'border-accent text-accent'
              : 'border-transparent text-txt-muted hover:text-txt-secondary'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          Pre-Orders ({preOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'returns'
              ? 'border-accent text-accent'
              : 'border-transparent text-txt-muted hover:text-txt-secondary'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Returns ({returns.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-3.5">
          {orders.length === 0 ? (
            <div className="prem-card p-12 text-center">
              <ShoppingBag className="w-8 h-8 text-txt-disabled mx-auto mb-2" />
              <div className="text-xs font-semibold text-txt-secondary">No orders placed yet</div>
              <p className="text-[11px] text-txt-muted mt-0.5">Your confirmed orders will appear here with live tracking.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="prem-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border-subtle text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-txt-primary font-mono text-xs">{order.orderNumber}</span>
                    <span className="text-txt-muted text-[11px]">{order.createdAt?.substring(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {getOrderStatusBadge(order.orderStatus)}
                    <span className="font-bold text-txt-primary font-sans text-xs">
                      ₹{order.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="space-y-1.5">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-txt-secondary">{item.productName}</span>
                        <span className="text-txt-muted text-[11px]">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-txt-primary font-sans">₹{item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Address & Return */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-border-subtle text-[11px] text-txt-muted">
                  <div className="truncate max-w-md">
                    Ship to: <span className="text-txt-secondary">{order.shippingAddress}</span>
                  </div>

                  {order.orderStatus === 'DELIVERED' && (
                    <button
                      onClick={() => setSelectedOrderForReturn(order)}
                      className="prem-btn-secondary text-[11px] py-1 px-2.5 self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3 h-3" /> Request Return
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'watches' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {priceWatches.length === 0 ? (
            <div className="col-span-full prem-card p-12 text-center">
              <Bell className="w-8 h-8 text-txt-disabled mx-auto mb-2" />
              <div className="text-xs font-semibold text-txt-secondary">No active price watches</div>
              <p className="text-[11px] text-txt-muted mt-0.5">
                Click "Watch Price" on any product in the catalog to get automated price-drop alerts.
              </p>
            </div>
          ) : (
            priceWatches.map((watch) => (
              <div key={watch.id} className="prem-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111820] border border-border-subtle p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={watch.product.mainImageUrl}
                      alt={watch.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-txt-primary truncate">{watch.product.name}</h4>
                    <div className="text-[11px] text-txt-muted mt-0.5">
                      Current: <span className="text-txt-primary font-bold">₹{watch.product.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-bg-primary rounded-lg border border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-txt-muted text-[11px]">Target Alert:</span>
                  <span className="text-accent font-bold font-sans">₹{watch.targetPrice.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <Badge variant={watch.isNotified ? 'emerald' : 'amber'} size="sm">
                    {watch.isNotified ? 'Target Met' : 'Watching'}
                  </Badge>
                  <button
                    onClick={() => navigate(`/customer/product/${watch.product.id}`)}
                    className="text-xs text-accent hover:underline flex items-center gap-0.5"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'preorders' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {preOrders.length === 0 ? (
            <div className="col-span-full prem-card p-12 text-center">
              <PackageCheck className="w-8 h-8 text-txt-disabled mx-auto mb-2" />
              <div className="text-xs font-semibold text-txt-secondary">No active pre-orders</div>
              <p className="text-[11px] text-txt-muted mt-0.5">
                Join pre-orders for incoming hardware to reserve guaranteed stock allocation.
              </p>
            </div>
          ) : (
            preOrders.map((po) => (
              <div key={po.id} className="prem-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#111820] border border-border-subtle p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={po.mainImageUrl}
                      alt={po.productName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-txt-primary truncate">{po.productName}</h4>
                    <div className="text-xs text-accent font-bold mt-0.5 font-sans">
                      ₹{po.unitPrice.toLocaleString()} (Qty: {po.quantity})
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-bg-primary rounded-lg border border-border-subtle text-xs flex justify-between">
                  <span className="text-txt-muted text-[11px]">Expected ETA:</span>
                  <span className="text-status-warning font-semibold text-[11px]">{po.expectedAvailabilityDate}</span>
                </div>

                <Badge variant={po.status === 'FULFILLED' ? 'emerald' : 'purple'} size="sm">
                  {po.status === 'FULFILLED' ? 'Stock Arrived / Fulfilled' : 'Reserved - Awaiting Arrival'}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-2.5">
          {returns.length === 0 ? (
            <div className="prem-card p-12 text-center">
              <RotateCcw className="w-8 h-8 text-txt-disabled mx-auto mb-2" />
              <div className="text-xs font-semibold text-txt-secondary">No return requests</div>
              <p className="text-[11px] text-txt-muted mt-0.5">Delivered orders are eligible for 7-day returns.</p>
            </div>
          ) : (
            returns.map((ret) => (
              <div key={ret.id} className="prem-card p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-txt-primary font-mono">Order #{ret.orderNumber}</span>
                  <Badge variant={ret.status === 'APPROVED' || ret.status === 'REFUNDED' ? 'emerald' : ret.status === 'REJECTED' ? 'rose' : 'purple'}>
                    {ret.status}
                  </Badge>
                </div>
                <div className="text-txt-muted text-[11px]">Reason: <span className="text-txt-secondary">{ret.reason}</span></div>
                {ret.adminDecisionNotes && (
                  <div className="p-2 bg-bg-primary rounded-lg text-txt-secondary border border-border-subtle text-[11px]">
                    Decision Notes: {ret.adminDecisionNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Personalized Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="prem-card p-5 space-y-3.5 mt-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div
                key={i}
                onClick={() => navigate(`/customer/product/${rec.product.id}`)}
                className="prem-card-hover p-3 rounded-xl border border-border-subtle cursor-pointer flex flex-col justify-between"
              >
                <div className="h-28 bg-[#111820] rounded-lg p-2 flex items-center justify-center mb-2">
                  <img
                    src={rec.product.mainImageUrl}
                    alt={rec.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-accent font-semibold">{rec.reason}</span>
                  <h3 className="text-xs font-semibold text-txt-primary line-clamp-1 mt-0.5">{rec.product.name}</h3>
                  <div className="text-xs font-bold text-txt-primary mt-1 font-sans">₹{rec.product.finalPrice.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return Modal */}
      {selectedOrderForReturn && (
        <ReturnRequestModal
          order={selectedOrderForReturn}
          isOpen={!!selectedOrderForReturn}
          onClose={() => setSelectedOrderForReturn(null)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};
