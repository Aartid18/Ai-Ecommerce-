import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  InventoryHealthItem,
  DeadStockItem,
  ReorderRecommendation,
  PurchaseOrder,
  InventoryTransaction,
  Product,
} from '../../types';
import { Badge } from '../../components/shared/Badge';
import { StatCard } from '../../components/shared/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  Boxes,
  AlertTriangle,
  Package,
  TrendingDown,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const InventoryOperationsPage: React.FC = () => {
  const [healthItems, setHealthItems] = useState<InventoryHealthItem[]>([]);
  const [deadStock, setDeadStock] = useState<DeadStockItem[]>([]);
  const [reorders, setReorders] = useState<ReorderRecommendation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('RESTOCK');
  const [adjustNotes, setAdjustNotes] = useState('Supplier shipment delivered to warehouse');
  const [adjusting, setAdjusting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [healthRes, deadRes, reorderRes, poRes, txRes, prodRes] = await Promise.allSettled([
        api.get('/inventory/health-scorecard'),
        api.get('/inventory/dead-stock'),
        api.get('/inventory/reorders'),
        api.get('/inventory/purchase-orders'),
        api.get('/inventory/transactions'),
        api.get('/products?size=50'),
      ]);

      if (healthRes.status === 'fulfilled') setHealthItems(healthRes.value.data);
      if (deadRes.status === 'fulfilled') setDeadStock(deadRes.value.data);
      if (reorderRes.status === 'fulfilled') setReorders(reorderRes.value.data);
      if (poRes.status === 'fulfilled') setPurchaseOrders(poRes.value.data);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.content || []);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setAdjusting(true);
    try {
      await api.post('/inventory/adjust', {
        productId: Number(selectedProductId),
        quantityChange: adjustQuantity,
        reason: adjustReason,
        notes: adjustNotes,
      });
      showToast('Inventory adjusted & audit log recorded successfully!', 'success');
      setShowAdjustModal(false);
      await fetchInventoryData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to adjust stock';
      showToast(msg, 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const handleReceivePO = async (poId: number) => {
    try {
      await api.put(`/inventory/purchase-orders/${poId}/receive`);
      showToast('Purchase Order received and stock automatically updated!', 'success');
      await fetchInventoryData();
    } catch (err: any) {
      showToast('Failed to receive purchase order', 'error');
    }
  };

  const criticalCount = healthItems.filter((i) => i.status === 'CRITICAL' || i.status === 'LOW_STOCK').length;
  const totalDeadStockValue = deadStock.reduce((sum, item) => sum + item.deadStockValue, 0);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Boxes className="w-3.5 h-3.5" />
            <span>Warehouse & Inventory Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Inventory Health & Dead Stock Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic reorder points based on daily velocity, lead times, and capital idle detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Stock Adjustment
          </button>
          <button
            onClick={fetchInventoryData}
            className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Critical / Low Stock"
          value={`${criticalCount} SKUs`}
          subtitle="Require immediate PO placement"
          icon={AlertTriangle}
          tone={criticalCount > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Dead Stock Capital Locked"
          value={`₹${totalDeadStockValue.toLocaleString()}`}
          subtitle={`${deadStock.length} items idle >30 days`}
          icon={TrendingDown}
          tone="amber"
        />
        <StatCard
          title="Active Purchase Orders"
          value={purchaseOrders.filter((p) => p.status !== 'RECEIVED').length}
          subtitle="Inbound supplier shipments"
          icon={Package}
          tone="blue"
        />
        <StatCard
          title="Catalog Health Score"
          value="88 / 100"
          subtitle="Velocity vs Reorder balanced"
          icon={ShieldCheck}
          tone="emerald"
        />
      </div>

      {/* Reorder Recommendations with Supplier Lead Times */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100">Intelligent Reorder Recommendations</h2>
            <p className="text-xs text-slate-400">Calculated from 7-day sales velocity & supplier lead times</p>
          </div>
          <Badge variant="amber" size="sm">{reorders.length} Recommendations</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Product / SKU</th>
                <th className="pb-3">Current Stock</th>
                <th className="pb-3">Sales Velocity</th>
                <th className="pb-3">Predicted Stockout</th>
                <th className="pb-3">Suggested Reorder Qty</th>
                <th className="pb-3">Preferred Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reorders.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">
                    <div>{item.productName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.sku}</div>
                  </td>
                  <td className="py-3">
                    <span className="text-rose-400 font-bold">{item.currentStock} units</span>
                  </td>
                  <td className="py-3 text-slate-300">
                    {item.salesVelocity} units / day
                  </td>
                  <td className="py-3">
                    <Badge variant={item.predictedStockoutDays <= 3 ? 'rose' : 'amber'} size="sm">
                      {item.predictedStockoutDays <= 0 ? 'Stockout Now' : `In ${item.predictedStockoutDays} Days`}
                    </Badge>
                  </td>
                  <td className="py-3 font-extrabold text-emerald-400">
                    +{item.recommendedReorderQuantity} units
                  </td>
                  <td className="py-3 text-slate-300">
                    {item.suggestedSupplierName || 'TechSupply Global'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Stock Liquidation Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100">Dead Stock Analytics & Liquidation</h2>
            <p className="text-xs text-slate-400">Products with zero sales &gt;30 days tying up operational working capital</p>
          </div>
          <Badge variant="rose" size="sm">Total Value: ₹{totalDeadStockValue.toLocaleString()}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Product / SKU</th>
                <th className="pb-3">Idle Units</th>
                <th className="pb-3">Unit Price</th>
                <th className="pb-3">Locked Capital</th>
                <th className="pb-3">Days Idle</th>
                <th className="pb-3">Liquidation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deadStock.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">
                    <div>{item.productName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.sku}</div>
                  </td>
                  <td className="py-3 font-bold text-amber-400">{item.stockQuantity}</td>
                  <td className="py-3 text-slate-300">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 font-extrabold text-rose-400">₹{item.deadStockValue.toLocaleString()}</td>
                  <td className="py-3 text-slate-400">{item.daysSinceLastSale} days</td>
                  <td className="py-3 text-emerald-400 font-medium">{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inbound Purchase Orders Lifecycle */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100">Inbound Purchase Orders</h2>
          <span className="text-xs text-slate-400">Supplier deliveries tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">PO Number</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Expected Date</th>
                <th className="pb-3">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-200">{po.poNumber}</td>
                  <td className="py-3 text-slate-300">{po.supplier?.name}</td>
                  <td className="py-3 font-semibold text-slate-200">{po.product?.name}</td>
                  <td className="py-3 font-bold text-emerald-400">+{po.quantity} units</td>
                  <td className="py-3 text-slate-400">{po.expectedDeliveryDate}</td>
                  <td className="py-3">
                    {po.status === 'RECEIVED' ? (
                      <Badge variant="emerald" size="sm">Received & Restocked</Badge>
                    ) : (
                      <button
                        onClick={() => handleReceivePO(po.id)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg transition-colors"
                      >
                        Receive & Restock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Transactions Audit Log */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Inventory Transactions Audit Trail
          </h2>
          <span className="text-xs text-slate-500 font-mono">Immutable stock logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Before → Change → After</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 8).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 text-slate-400 font-mono">{tx.timestamp?.substring(0, 19)}</td>
                  <td className="py-3 font-semibold text-slate-200">{tx.productName}</td>
                  <td className="py-3 font-mono">
                    <span className="text-slate-400">{tx.quantityBefore}</span>
                    <span className="text-slate-500"> → </span>
                    <span className={tx.quantityChange >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {tx.quantityChange >= 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                    </span>
                    <span className="text-slate-500"> → </span>
                    <span className="text-slate-200 font-bold">{tx.quantityAfter}</span>
                  </td>
                  <td className="py-3 text-slate-300">
                    <Badge variant="slate" size="sm">{tx.reason}</Badge>
                  </td>
                  <td className="py-3 text-slate-400">{tx.changedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowAdjustModal(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Adjust Warehouse Stock</h3>

            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Select a product to adjust...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock} units)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantity Change (+ to add, - to reduce)
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="RESTOCK">Supplier Restock / Arrival</option>
                  <option value="DAMAGE">Damaged / Expired Write-off</option>
                  <option value="CYCLE_COUNT_CORRECTION">Cycle Count Audit Correction</option>
                  <option value="RETURN_TO_VENDOR">Return to Vendor (RTV)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Notes</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || !selectedProductId}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
                >
                  {adjusting ? 'Updating Stock...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
