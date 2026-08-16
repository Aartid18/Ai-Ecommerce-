import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Coupon, AuditLogItem } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Tag,
  FileText,
  Plus,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export const CouponsAndAuditPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(999);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(1000);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [creating, setCreating] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coupRes, logRes] = await Promise.allSettled([
        api.get('/coupons'),
        api.get('/events/audit-logs'),
      ]);

      if (coupRes.status === 'fulfilled') setCoupons(coupRes.value.data);
      if (logRes.status === 'fulfilled') setAuditLogs(logRes.value.data);
    } catch (err) {
      console.error('Failed to load coupons or audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCreating(true);
    try {
      await api.post('/coupons', {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount: discountType === 'PERCENTAGE' ? maxDiscountAmount : undefined,
        usageLimit,
        perUserLimit: 1,
        active: true,
      });
      showToast(`Coupon "${code.toUpperCase()}" created successfully!`, 'success');
      setCode('');
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create coupon';
      showToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Governance & Promotions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Promotional Coupons & Enterprise Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-validated discounts and immutable audit tracking for all critical state changes.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Coupons Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Coupon Form (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
            <Plus className="w-4 h-4 text-emerald-400" />
            Create Promotional Coupon
          </h2>

          <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. FLASH25"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Value ({discountType === 'PERCENTAGE' ? '%' : '₹'})</label>
                <input
                  type="number"
                  min={1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Min Order (₹)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Cap (₹)</label>
                <input
                  type="number"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Usage Limit</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating || !code.trim()}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all pt-2"
            >
              {creating ? 'Saving Coupon...' : 'Create Active Coupon'}
            </button>
          </form>
        </div>

        {/* Active Coupons List (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
            Active Platform Coupons ({coupons.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Min Order</th>
                  <th className="pb-3">Usage</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      {c.code}
                    </td>
                    <td className="py-3 font-semibold text-slate-200">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </td>
                    <td className="py-3 text-slate-300">
                      ₹{c.minOrderAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-300">
                      <span className="font-bold text-slate-100">{c.timesUsed}</span> / {c.usageLimit}
                    </td>
                    <td className="py-3">
                      <Badge variant={c.active ? 'emerald' : 'slate'} size="sm">
                        {c.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enterprise Audit Logs Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Enterprise Immutable Audit Logs</h2>
          </div>
          <span className="text-xs text-slate-400">All administrative operations logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 text-slate-400 font-mono">{log.timestamp?.substring(0, 19)}</td>
                  <td className="py-3 font-semibold text-slate-200">{log.actor}</td>
                  <td className="py-3">
                    <Badge variant="blue" size="sm">{log.action}</Badge>
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {log.entityName} #{log.entityId}
                  </td>
                  <td className="py-3 text-slate-300 max-w-sm">
                    {log.reason || 'Standard operational update'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
