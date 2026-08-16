import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PreOrderDemandSummary, PreOrder } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  PackageCheck,
  Sparkles,
  Users,
  DollarSign,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const SmartPreOrdersPage: React.FC = () => {
  const [summaries, setSummaries] = useState<PreOrderDemandSummary[]>([]);
  const [allPreOrders, setAllPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfillingId, setFulfillingId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPreOrderIntelligence();
  }, []);

  const fetchPreOrderIntelligence = async () => {
    setLoading(true);
    try {
      const [sumRes, allRes] = await Promise.allSettled([
        api.get('/preorders/demand-summary'),
        api.get('/preorders/all-pending'),
      ]);

      if (sumRes.status === 'fulfilled') setSummaries(sumRes.value.data);
      if (allRes.status === 'fulfilled') setAllPreOrders(allRes.value.data);
    } catch (err) {
      console.error('Failed to load pre-order intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillPreOrders = async (productId: number) => {
    setFulfillingId(productId);
    try {
      await api.post(`/preorders/fulfill/${productId}`);
      showToast(
        'Pre-orders fulfilled! Stock allocated and arrival notifications dispatched to customers.',
        'success',
        'Pre-Orders Processed'
      );
      await fetchPreOrderIntelligence();
    } catch (err: any) {
      showToast('Failed to fulfill pre-orders', 'error');
    } finally {
      setFulfillingId(null);
    }
  };

  const totalPreOrderCommitment = summaries.reduce((acc, s) => acc + s.expectedRevenue, 0);
  const totalWaitingCustomers = summaries.reduce((acc, s) => acc + s.totalPreOrdersCount, 0);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Signature Feature: Demand-Driven Pre-Order Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Smart Pre-Order & Demand-Based Inventory Allocation
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Eliminate speculative stock holding. Capture genuine customer pre-order reservations, automatically factor in supplier lead time + safety stock + expected cancellation rate buffer to calculate optimal Purchase Orders.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Waiting Customers</div>
              <div className="text-xl font-extrabold text-purple-400">{totalWaitingCustomers}</div>
            </div>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Pre-Order Demand</div>
              <div className="text-xl font-extrabold text-emerald-400">₹{totalPreOrderCommitment.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demand Summaries Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">Pre-Order Demand Allocation Analysis</h2>
          <span className="text-xs text-slate-400">AI-computed optimal order sizing</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summaries.map((summary) => (
            <div
              key={summary.productId}
              className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{summary.productName}</h3>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">SKU: {summary.sku}</div>
                  </div>
                  <Badge variant="purple" dot size="sm">
                    {summary.totalPreOrdersCount} Pre-Orders
                  </Badge>
                </div>

                {/* Demand & Financial Calculation Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Expected Revenue</div>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                      ₹{summary.expectedRevenue.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Recommended Stock</div>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">
                      {summary.recommendedStockQuantity} units
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Recommended PO</div>
                    <div className="text-sm font-extrabold text-purple-400 mt-0.5">
                      +{summary.recommendedPurchaseQuantity} units
                    </div>
                  </div>
                </div>

                {/* Supplier & Lead Time Intelligence */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Supplier Lead Time & Reliability Analysis</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {summary.supplierLeadTimeInfo}
                  </p>
                  <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Expected batch delivery: {summary.expectedAvailabilityDate}
                  </div>
                </div>
              </div>

              {/* Fulfill Action Button */}
              <button
                onClick={() => handleFulfillPreOrders(summary.productId)}
                disabled={fulfillingId === summary.productId}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {fulfillingId === summary.productId
                  ? 'Fulfilling Pre-Orders & Notifying Customers...'
                  : `Fulfill ${summary.totalPreOrdersCount} Pre-Orders & Allocate Arrived Stock`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Customer Pre-Orders Stream */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100">Active Customer Pre-Order Registry</h2>
          <span className="text-xs text-slate-400">All customer reservations queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Product Name / SKU</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Unit Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allPreOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">
                    <div>{po.productName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{po.productSku}</div>
                  </td>
                  <td className="py-3 font-bold text-slate-300">{po.quantity}</td>
                  <td className="py-3 text-emerald-400 font-bold">₹{po.unitPrice.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge variant={po.status === 'FULFILLED' ? 'emerald' : 'purple'} size="sm">
                      {po.status === 'FULFILLED' ? 'Fulfilled' : 'Pending Stock'}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-400">{po.createdAt?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
