import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { StatCard } from '../../components/shared/StatCard';
import { RiskReviewModal } from '../../components/modals/RiskReviewModal';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Filter,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';

export const OrderRiskManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [highRiskOrders, setHighRiskOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedOrderForRiskReview, setSelectedOrderForRiskReview] = useState<Order | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      const [allRes, riskRes] = await Promise.allSettled([
        api.get('/orders/manage'),
        api.get('/orders/manage/high-risk'),
      ]);

      if (allRes.status === 'fulfilled') setOrders(allRes.value.data);
      if (riskRes.status === 'fulfilled') setHighRiskOrders(riskRes.value.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await api.put(`/orders/manage/${orderId}/status`, {
        newStatus,
        reason: 'Operations fulfillment progression',
        notes: `Order moved to ${newStatus} by operator`,
      });
      showToast(`Order status updated to ${newStatus}`, 'success');
      await fetchOrdersData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getRiskBadge = (level: string, score: number) => {
    if (level === 'CRITICAL' || level === 'HIGH') {
      return (
        <Badge variant="rose" dot size="sm">
          High Risk ({score}/100)
        </Badge>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <Badge variant="amber" dot size="sm">
          Med Risk ({score}/100)
        </Badge>
      );
    }
    return (
      <Badge variant="emerald" dot size="sm">
        Low ({score}/100)
      </Badge>
    );
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fraud Risk Intelligence & Order Lifecycle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Order Fulfillment & Risk Review Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explainable fraud scoring, payment anomalies detection, and order status workflow execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrdersData}
            className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flagged High-Risk Orders Review Queue */}
      {highRiskOrders.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-rose-200">
                Flagged High-Risk Review Queue ({highRiskOrders.length})
              </h2>
            </div>
            <span className="text-xs text-rose-400 font-semibold">Requires Operator Sign-off</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskOrders.map((order) => (
              <div
                key={order.id}
                className="glass-card p-4 rounded-2xl border border-rose-500/30 space-y-3 bg-slate-900/90 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-200">{order.orderNumber}</span>
                    <Badge variant="rose" dot size="sm">
                      Score: {order.riskScore}/100
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="font-semibold">{order.customerName}</span> ({order.customerEmail})
                  </div>

                  <div className="text-xs text-slate-400">
                    Total: <span className="text-emerald-400 font-bold">₹{order.finalAmount.toLocaleString()}</span> • Payment: {order.paymentMethod}
                  </div>

                  {/* Explainable Signals */}
                  <div className="space-y-1 pt-1">
                    {order.riskReasons?.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="text-xs text-rose-300 flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrderForRiskReview(order)}
                  className="w-full py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  Review Risk Factors & Decide
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Filter & Management Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Email..."
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Final Amount</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3">Order Status</th>
                <th className="pb-3">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-200">
                    <div>{order.orderNumber}</div>
                    <div className="text-[11px] font-normal text-slate-500">{order.createdAt?.substring(0, 10)}</div>
                  </td>

                  <td className="py-3 text-slate-300">
                    <div className="font-semibold text-slate-200">{order.customerName}</div>
                    <div className="text-slate-400 text-[11px]">{order.customerEmail}</div>
                  </td>

                  <td className="py-3 font-extrabold text-emerald-400">
                    ₹{order.finalAmount.toLocaleString()}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getRiskBadge(order.riskLevel, order.riskScore)}
                      {(order.riskLevel === 'HIGH' || order.riskLevel === 'CRITICAL') && !order.isRiskReviewed && (
                        <button
                          onClick={() => setSelectedOrderForRiskReview(order)}
                          className="text-[11px] text-rose-400 hover:underline font-bold"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="py-3">
                    <Badge variant={order.orderStatus === 'DELIVERED' ? 'emerald' : order.orderStatus === 'CANCELLED' ? 'rose' : 'blue'}>
                      {order.orderStatus}
                    </Badge>
                  </td>

                  <td className="py-3">
                    {order.orderStatus === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg text-xs"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.orderStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                        className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold rounded-lg text-xs"
                      >
                        Mark Packed
                      </button>
                    )}
                    {order.orderStatus === 'PACKED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                        className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold rounded-lg text-xs"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.orderStatus === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg text-xs"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.orderStatus === 'DELIVERED' && (
                      <span className="text-slate-500 font-medium">Completed</span>
                    )}
                    {order.orderStatus === 'CANCELLED' && (
                      <span className="text-rose-500 font-medium">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Review Modal */}
      {selectedOrderForRiskReview && (
        <RiskReviewModal
          order={selectedOrderForRiskReview}
          isOpen={!!selectedOrderForRiskReview}
          onClose={() => setSelectedOrderForRiskReview(null)}
          onDecisionComplete={fetchOrdersData}
        />
      )}
    </div>
  );
};
