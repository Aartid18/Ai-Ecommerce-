import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  ExternalLink,
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
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-slate-900/60">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            {user?.username?.substring(0, 2).toUpperCase() || 'CU'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-100">{user?.fullName || user?.username}</h1>
              <Badge variant="emerald" size="sm">Verified Customer</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Total Orders</div>
            <div className="text-base font-extrabold text-slate-100">{orders.length}</div>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Price Alerts</div>
            <div className="text-base font-extrabold text-emerald-400">{priceWatches.length}</div>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Pre-Orders</div>
            <div className="text-base font-extrabold text-purple-400">{preOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('watches')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'watches'
              ? 'border-emerald-500 text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-400" />
          Active Price Watches ({priceWatches.length})
        </button>

        <button
          onClick={() => setActiveTab('preorders')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'preorders'
              ? 'border-emerald-500 text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-purple-400" />
          Pre-Orders ({preOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'returns'
              ? 'border-emerald-500 text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          Returns & Refunds ({returns.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">No orders placed yet</div>
              <p className="text-xs text-slate-500 mt-1">Your confirmed orders will appear here with live tracking.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200 font-mono text-sm">{order.orderNumber}</span>
                    <span className="text-slate-400">{order.createdAt?.substring(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getOrderStatusBadge(order.orderStatus)}
                    <span className="font-extrabold text-emerald-400 text-sm">
                      ₹{order.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{item.productName}</span>
                        <span className="text-slate-500">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-300">₹{item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Action Stepper */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <div className="truncate max-w-md">
                    Ship to: <span className="text-slate-300 font-medium">{order.shippingAddress}</span>
                  </div>

                  {order.orderStatus === 'DELIVERED' && (
                    <button
                      onClick={() => setSelectedOrderForReturn(order)}
                      className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Request Return
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
            <div className="col-span-full glass-panel p-12 text-center rounded-2xl border border-slate-800">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">No active price watches</div>
              <p className="text-xs text-slate-500 mt-1">
                Click "Price Watch" on any product in the catalog to get notified when prices drop!
              </p>
            </div>
          ) : (
            priceWatches.map((watch) => (
              <div key={watch.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={watch.product.mainImageUrl}
                    alt={watch.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-900"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{watch.product.name}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Current: <span className="text-slate-200 font-bold">₹{watch.product.finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target Alert:</span>
                  <span className="text-emerald-400 font-extrabold">₹{watch.targetPrice.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <Badge variant={watch.isNotified ? 'emerald' : 'amber'} size="sm">
                    {watch.isNotified ? 'Alert Triggered' : 'Watching Price'}
                  </Badge>
                  <button
                    onClick={() => navigate(`/customer/product/${watch.product.id}`)}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    View Product <ChevronRight className="w-3 h-3" />
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
            <div className="col-span-full glass-panel p-12 text-center rounded-2xl border border-slate-800">
              <PackageCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">No active pre-orders</div>
              <p className="text-xs text-slate-500 mt-1">
                Pre-order out-of-stock or upcoming products to guarantee priority allocation.
              </p>
            </div>
          ) : (
            preOrders.map((po) => (
              <div key={po.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={po.mainImageUrl}
                    alt={po.productName}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-900"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{po.productName}</h4>
                    <div className="text-xs text-emerald-400 font-bold mt-0.5">
                      ₹{po.unitPrice.toLocaleString()} (Qty: {po.quantity})
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
                  <span className="text-slate-400">Expected ETA:</span>
                  <span className="text-amber-400 font-bold">{po.expectedAvailabilityDate}</span>
                </div>

                <Badge variant={po.status === 'FULFILLED' ? 'emerald' : 'purple'} size="sm">
                  {po.status === 'FULFILLED' ? 'Stock Arrived / Fulfilled' : 'Reserved - Awaiting Stock'}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-3">
          {returns.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
              <RotateCcw className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">No return requests</div>
              <p className="text-xs text-slate-500 mt-1">Delivered orders are eligible for 7-day returns.</p>
            </div>
          ) : (
            returns.map((ret) => (
              <div key={ret.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Order #{ret.orderNumber}</span>
                  <Badge variant={ret.status === 'APPROVED' || ret.status === 'REFUNDED' ? 'emerald' : ret.status === 'REJECTED' ? 'rose' : 'purple'}>
                    {ret.status}
                  </Badge>
                </div>
                <div className="text-slate-400">Reason: <span className="text-slate-200">{ret.reason}</span></div>
                {ret.adminDecisionNotes && (
                  <div className="p-2.5 bg-slate-950 rounded-xl text-slate-300 border border-slate-800">
                    Decision: {ret.adminDecisionNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Personalized Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div
                key={i}
                onClick={() => navigate(`/customer/product/${rec.product.id}`)}
                className="glass-card p-3.5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <img
                  src={rec.product.mainImageUrl}
                  alt={rec.product.name}
                  className="w-full h-32 object-cover rounded-xl bg-slate-900 mb-2"
                />
                <div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{rec.reason}</span>
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1 mt-0.5">{rec.product.name}</h3>
                  <div className="text-xs font-extrabold text-emerald-400 mt-1">₹{rec.product.finalPrice.toLocaleString()}</div>
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
