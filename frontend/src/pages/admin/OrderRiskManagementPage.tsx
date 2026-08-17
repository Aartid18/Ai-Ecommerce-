import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { RiskReviewModal } from '../../components/modals/RiskReviewModal';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
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
          High ({score}/100)
        </Badge>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <Badge variant="amber" dot size="sm">
          Med ({score}/100)
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
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-danger-subtle border border-status-danger/25 text-status-danger text-xs font-semibold mb-2">
            <ShieldAlert className="w-3 h-3" />
            <span>Fraud Risk Intelligence & Fulfillment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary">
            Order Fulfillment & Risk Review Center
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Explainable fraud scoring, payment anomalies detection, and order status workflow progression.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrdersData}
            className="prem-btn-secondary p-2"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Flagged High-Risk Orders Review Queue */}
      {highRiskOrders.length > 0 && (
        <div className="prem-card p-5 border border-status-danger/25 bg-status-danger-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-status-danger/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-status-danger" />
              <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                Flagged High-Risk Review Queue ({highRiskOrders.length})
              </h2>
            </div>
            <span className="text-[11px] text-status-danger font-semibold">Requires Operator Decision</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskOrders.map((order) => (
              <div
                key={order.id}
                className="prem-card p-4 border border-status-danger/30 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-txt-primary text-xs">{order.orderNumber}</span>
                    <Badge variant="rose" dot size="sm">
                      Risk: {order.riskScore}/100
                    </Badge>
                  </div>

                  <div className="text-xs text-txt-secondary">
                    <span className="font-semibold text-txt-primary">{order.customerName}</span> ({order.customerEmail})
                  </div>

                  <div className="text-xs text-txt-muted">
                    Total: <span className="text-txt-primary font-bold">₹{order.finalAmount.toLocaleString()}</span> • Payment: {order.paymentMethod}
                  </div>

                  {/* Explainable Signals */}
                  <div className="space-y-1 pt-1">
                    {order.riskReasons?.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="text-[11px] text-status-danger flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrderForRiskReview(order)}
                  className="prem-btn-primary w-full py-2 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review Risk Factors & Decide
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Filter & Management Table */}
      <div className="prem-card p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-txt-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order #, Customer, Email..."
              className="prem-input w-64 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-txt-muted text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="prem-input py-1 text-xs"
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
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Order Number</th>
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Final Amount</th>
                <th className="pb-2.5">Risk Assessment</th>
                <th className="pb-2.5">Order Status</th>
                <th className="pb-2.5">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-mono font-semibold text-txt-primary">
                    <div>{order.orderNumber}</div>
                    <div className="text-[10px] font-normal text-txt-muted">{order.createdAt?.substring(0, 10)}</div>
                  </td>

                  <td className="py-3 text-txt-secondary">
                    <div className="font-semibold text-txt-primary">{order.customerName}</div>
                    <div className="text-txt-muted text-[10px]">{order.customerEmail}</div>
                  </td>

                  <td className="py-3 font-bold text-txt-primary font-sans">
                    ₹{order.finalAmount.toLocaleString()}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getRiskBadge(order.riskLevel, order.riskScore)}
                      {(order.riskLevel === 'HIGH' || order.riskLevel === 'CRITICAL') && !order.isRiskReviewed && (
                        <button
                          onClick={() => setSelectedOrderForRiskReview(order)}
                          className="text-[11px] text-status-danger hover:underline font-semibold"
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
                        className="prem-btn-primary py-1 px-2.5 text-[11px]"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.orderStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                        className="prem-btn-secondary py-1 px-2.5 text-[11px]"
                      >
                        Mark Packed
                      </button>
                    )}
                    {order.orderStatus === 'PACKED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                        className="prem-btn-secondary py-1 px-2.5 text-[11px]"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.orderStatus === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="prem-btn-primary py-1 px-2.5 text-[11px]"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.orderStatus === 'DELIVERED' && (
                      <span className="text-txt-muted text-[11px]">Completed</span>
                    )}
                    {order.orderStatus === 'CANCELLED' && (
                      <span className="text-status-danger text-[11px]">Cancelled</span>
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
