import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PreOrderDemandSummary, PreOrder } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
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

      if (sumRes.status === 'fulfilled') setSummaries(Array.isArray(sumRes.value.data) ? sumRes.value.data : []);
      if (allRes.status === 'fulfilled') setAllPreOrders(Array.isArray(allRes.value.data) ? allRes.value.data : []);
    } catch (err) {
      console.error('Failed to load pre-order intelligence', err);
      setSummaries([]);
      setAllPreOrders([]);
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
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-subtle border border-indigo-accent/25 text-indigo-accent text-xs font-semibold mb-2">
            <PackageCheck className="w-3 h-3" />
            <span>Demand-Driven Pre-Orders</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary">
            Smart Pre-Order & Inventory Allocation
          </h1>
          <p className="text-xs text-txt-muted mt-1 max-w-2xl leading-relaxed">
            Eliminate speculative stock holding. Capture genuine customer reservations, factoring in supplier lead time + safety stock + expected cancellation rate.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-center">
            <div className="text-[10px] text-txt-muted uppercase font-semibold">Interested Shoppers</div>
            <div className="text-base font-bold text-indigo-accent font-sans mt-0.5">{totalWaitingCustomers}</div>
          </div>
          <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-center">
            <div className="text-[10px] text-txt-muted uppercase font-semibold">Pre-Order Demand</div>
            <div className="text-base font-bold text-accent font-sans mt-0.5">₹{totalPreOrderCommitment.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Demand Summaries Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Demand Allocation Analysis</h2>
          <span className="text-[11px] text-txt-muted">Optimal PO Sizing Formula</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {summaries.map((summary) => (
            <div
              key={summary.productId}
              className="prem-card p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-txt-primary">{summary.productName}</h3>
                    <div className="text-[10px] font-mono text-txt-muted mt-0.5">SKU: {summary.sku}</div>
                  </div>
                  <Badge variant="purple" dot size="sm">
                    {summary.totalPreOrdersCount} Pre-Orders
                  </Badge>
                </div>

                {/* Demand & Financial Calculation Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-bg-primary rounded-xl border border-border-subtle">
                    <div className="text-txt-muted text-[10px]">Expected Revenue</div>
                    <div className="text-xs font-bold text-accent mt-0.5 font-sans">
                      ₹{summary.expectedRevenue.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-2.5 bg-bg-primary rounded-xl border border-border-subtle">
                    <div className="text-txt-muted text-[10px]">Recommended Stock</div>
                    <div className="text-xs font-bold text-txt-primary mt-0.5">
                      {summary.recommendedStockQuantity} units
                    </div>
                  </div>

                  <div className="p-2.5 bg-bg-primary rounded-xl border border-border-subtle">
                    <div className="text-txt-muted text-[10px]">Recommended PO</div>
                    <div className="text-xs font-bold text-indigo-accent mt-0.5">
                      +{summary.recommendedPurchaseQuantity} units
                    </div>
                  </div>
                </div>

                {/* Supplier & Lead Time Intelligence */}
                <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-xs text-txt-secondary space-y-1">
                  <div className="flex items-center gap-1.5 text-txt-muted font-semibold text-[11px]">
                    <Truck className="w-3.5 h-3.5 text-indigo-accent" />
                    <span>Lead Time & Allocation Buffer</span>
                  </div>
                  <p className="text-txt-secondary text-[11px] leading-relaxed">
                    {summary.supplierLeadTimeInfo}
                  </p>
                  <div className="text-[11px] text-status-warning font-medium flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3" /> Batch arrival: {summary.expectedAvailabilityDate}
                  </div>
                </div>
              </div>

              {/* Fulfill Action Button */}
              <button
                onClick={() => handleFulfillPreOrders(summary.productId)}
                disabled={fulfillingId === summary.productId}
                className="prem-btn-primary w-full py-2.5 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {fulfillingId === summary.productId
                  ? 'Fulfilling Pre-Orders & Notifying Customers...'
                  : `Fulfill ${summary.totalPreOrdersCount} Pre-Orders & Allocate Arrived Stock`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Customer Pre-Orders Stream */}
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Active Customer Pre-Order Registry</h2>
          <span className="text-[11px] text-txt-muted">Customer reservations queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Product Name / SKU</th>
                <th className="pb-2.5">Quantity</th>
                <th className="pb-2.5">Unit Price</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Reserved Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {allPreOrders.map((po) => (
                <tr key={po.id} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-medium text-txt-primary">
                    <div>{po.productName}</div>
                    <div className="text-[10px] font-mono text-txt-muted">{po.productSku}</div>
                  </td>
                  <td className="py-3 font-semibold text-txt-secondary">{po.quantity}</td>
                  <td className="py-3 text-accent font-bold font-sans">₹{po.unitPrice.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge variant={po.status === 'FULFILLED' ? 'emerald' : 'purple'} size="sm">
                      {po.status === 'FULFILLED' ? 'Fulfilled' : 'Pending Stock'}
                    </Badge>
                  </td>
                  <td className="py-3 text-txt-muted text-[11px]">{po.createdAt?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
