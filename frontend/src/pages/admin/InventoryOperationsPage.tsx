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
  Plus,
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

      if (healthRes.status === 'fulfilled') setHealthItems(Array.isArray(healthRes.value.data) ? healthRes.value.data : []);
      if (deadRes.status === 'fulfilled') setDeadStock(Array.isArray(deadRes.value.data) ? deadRes.value.data : []);
      if (reorderRes.status === 'fulfilled') setReorders(Array.isArray(reorderRes.value.data) ? reorderRes.value.data : []);
      if (poRes.status === 'fulfilled') setPurchaseOrders(Array.isArray(poRes.value.data) ? poRes.value.data : []);
      if (txRes.status === 'fulfilled') setTransactions(Array.isArray(txRes.value.data) ? txRes.value.data : []);
      if (prodRes.status === 'fulfilled') {
        const pList = Array.isArray(prodRes.value.data?.content) ? prodRes.value.data.content : (Array.isArray(prodRes.value.data) ? prodRes.value.data : []);
        setProducts(pList);
      }
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
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-subtle border border-accent-border text-accent text-xs font-semibold mb-2">
            <Boxes className="w-3 h-3" />
            <span>Warehouse & Inventory Health</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary">
            Inventory Health & Dead Stock Operations
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Dynamic reorder calculations based on daily velocity, lead times, and dead stock idle tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="prem-btn-primary text-xs py-2 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" /> Stock Adjustment
          </button>
          <button
            onClick={fetchInventoryData}
            className="prem-btn-secondary p-2"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical / Low Stock"
          value={`${criticalCount} SKUs`}
          subtitle="Immediate supplier PO required"
          icon={AlertTriangle}
          sparklineData={[70, 60, 50, 40, 30, 20, 15]}
        />
        <StatCard
          title="Dead Stock Locked Capital"
          value={`₹${totalDeadStockValue.toLocaleString()}`}
          subtitle={`${deadStock.length} items idle >30 days`}
          icon={TrendingDown}
          sparklineData={[80, 80, 80, 80, 80, 80, 80]}
        />
        <StatCard
          title="Active Purchase Orders"
          value={purchaseOrders.filter((p) => p.status !== 'RECEIVED').length}
          subtitle="Inbound supplier shipments"
          icon={Package}
          sparklineData={[10, 20, 30, 40, 50, 40, 30]}
        />
        <StatCard
          title="Inventory Health Score"
          value="88 / 100"
          subtitle="Velocity vs Reorder balanced"
          icon={ShieldCheck}
          sparklineData={[75, 80, 82, 85, 84, 88, 88]}
        />
      </div>

      {/* Reorder Recommendations */}
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Automated Reorder Recommendations</h2>
            <p className="text-[11px] text-txt-muted">Calculated from 7-day sales velocity & supplier lead times</p>
          </div>
          <Badge variant="amber" size="sm">{reorders.length} Recommendations</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Product / SKU</th>
                <th className="pb-2.5">Current Stock</th>
                <th className="pb-2.5">Sales Velocity</th>
                <th className="pb-2.5">Predicted Stockout</th>
                <th className="pb-2.5">Suggested Reorder Qty</th>
                <th className="pb-2.5">Preferred Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {reorders.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-medium text-txt-primary">
                    <div>{item.productName}</div>
                    <div className="text-[10px] font-mono text-txt-muted">{item.sku}</div>
                  </td>
                  <td className="py-3">
                    <span className="text-status-danger font-semibold">{item.currentStock} units</span>
                  </td>
                  <td className="py-3 text-txt-secondary">
                    {item.salesVelocity} units / day
                  </td>
                  <td className="py-3">
                    <Badge variant={item.predictedStockoutDays <= 3 ? 'rose' : 'amber'} size="sm">
                      {item.predictedStockoutDays <= 0 ? 'Stockout Now' : `In ${item.predictedStockoutDays} Days`}
                    </Badge>
                  </td>
                  <td className="py-3 font-bold text-accent font-sans">
                    +{item.recommendedReorderQuantity} units
                  </td>
                  <td className="py-3 text-txt-secondary">
                    {item.suggestedSupplierName || 'TechSupply Global'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Stock Liquidation Panel */}
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Dead Stock Analytics & Liquidation</h2>
            <p className="text-[11px] text-txt-muted">Products with zero sales &gt;30 days tying up capital</p>
          </div>
          <Badge variant="rose" size="sm">Tied Capital: ₹{totalDeadStockValue.toLocaleString()}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Product / SKU</th>
                <th className="pb-2.5">Idle Units</th>
                <th className="pb-2.5">Unit Price</th>
                <th className="pb-2.5">Locked Capital</th>
                <th className="pb-2.5">Days Idle</th>
                <th className="pb-2.5">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {deadStock.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-medium text-txt-primary">
                    <div>{item.productName}</div>
                    <div className="text-[10px] font-mono text-txt-muted">{item.sku}</div>
                  </td>
                  <td className="py-3 font-semibold text-status-warning">{item.stockQuantity}</td>
                  <td className="py-3 text-txt-secondary">₹{item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 font-bold text-status-danger font-sans">₹{item.deadStockValue.toLocaleString()}</td>
                  <td className="py-3 text-txt-muted">{item.daysSinceLastSale} days</td>
                  <td className="py-3 text-accent font-medium text-[11px]">{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inbound Purchase Orders Lifecycle */}
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Inbound Purchase Orders</h2>
          <span className="text-[11px] text-txt-muted">Supplier shipment tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">PO Reference</th>
                <th className="pb-2.5">Supplier</th>
                <th className="pb-2.5">Product</th>
                <th className="pb-2.5">Quantity</th>
                <th className="pb-2.5">Expected Delivery</th>
                <th className="pb-2.5">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-mono font-semibold text-txt-primary">{po.poNumber}</td>
                  <td className="py-3 text-txt-secondary">{po.supplier?.name}</td>
                  <td className="py-3 font-medium text-txt-primary">{po.product?.name}</td>
                  <td className="py-3 font-bold text-accent">+{po.quantity} units</td>
                  <td className="py-3 text-txt-muted">{po.expectedDeliveryDate}</td>
                  <td className="py-3">
                    {po.status === 'RECEIVED' ? (
                      <Badge variant="emerald" size="sm">Received & Restocked</Badge>
                    ) : (
                      <button
                        onClick={() => handleReceivePO(po.id)}
                        className="prem-btn-primary text-[11px] py-1 px-2.5"
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

      {/* Inventory Transactions Audit Trail */}
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-accent" />
            Inventory Transactions Audit Trail
          </h2>
          <span className="text-[10px] text-txt-muted font-mono">Immutable logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Product</th>
                <th className="pb-2.5">Quantity Delta</th>
                <th className="pb-2.5">Reason</th>
                <th className="pb-2.5">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {transactions.slice(0, 8).map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-2.5 text-txt-muted font-mono text-[11px]">{tx.timestamp?.substring(0, 19)}</td>
                  <td className="py-2.5 font-medium text-txt-primary">{tx.productName}</td>
                  <td className="py-2.5 font-mono text-[11px]">
                    <span className="text-txt-muted">{tx.quantityBefore}</span>
                    <span className="text-txt-disabled"> → </span>
                    <span className={tx.quantityChange >= 0 ? 'text-accent font-bold' : 'text-status-danger font-bold'}>
                      {tx.quantityChange >= 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                    </span>
                    <span className="text-txt-disabled"> → </span>
                    <span className="text-txt-primary font-bold">{tx.quantityAfter}</span>
                  </td>
                  <td className="py-2.5 text-txt-secondary">
                    <Badge variant="slate" size="sm">{tx.reason}</Badge>
                  </td>
                  <td className="py-2.5 text-txt-muted">{tx.changedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-txt-primary">Adjust Warehouse Stock</h3>

            <form onSubmit={handleStockAdjustment} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="prem-input w-full"
                  required
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock} units)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">
                  Quantity Delta (+ to restock, - to reduce)
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="prem-input w-full font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="prem-input w-full"
                >
                  <option value="RESTOCK">Supplier Restock / Arrival</option>
                  <option value="DAMAGE">Damaged / Write-off</option>
                  <option value="CYCLE_COUNT_CORRECTION">Cycle Count Correction</option>
                  <option value="RETURN_TO_VENDOR">Return to Vendor (RTV)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Audit Notes</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="prem-input w-full"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="prem-btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || !selectedProductId}
                  className="prem-btn-primary flex-1 py-2 text-xs"
                >
                  {adjusting ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
