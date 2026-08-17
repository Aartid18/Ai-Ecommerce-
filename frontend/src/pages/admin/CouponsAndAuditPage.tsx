import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Coupon, AuditLogItem, UserProfile } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  FileText,
  Users,
  Tag,
  Search,
  CheckCircle,
  XCircle,
  Lock,
} from 'lucide-react';

export const CouponsAndAuditPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'coupons' | 'users' | 'audit'>('coupons');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
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
    if (location.pathname.includes('/users')) {
      setActiveTab('users');
    } else if (location.pathname.includes('/audit')) {
      setActiveTab('audit');
    } else {
      setActiveTab('coupons');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coupRes, logRes, usersRes] = await Promise.allSettled([
        api.get('/coupons'),
        api.get('/events/audit-logs'),
        api.get('/admin/users'),
      ]);

      if (coupRes.status === 'fulfilled') setCoupons(coupRes.value.data);
      if (logRes.status === 'fulfilled') setAuditLogs(logRes.value.data);
      if (usersRes.status === 'fulfilled') {
        setUsersList(usersRes.value.data.content || usersRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load coupons, audit logs, or users', err);
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

  const handleToggleUserStatus = async (userId: number, currentEnabled: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status?enabled=${!currentEnabled}`);
      showToast(`User status ${!currentEnabled ? 'enabled' : 'disabled'} successfully`, 'success');
      await fetchData();
    } catch (err: any) {
      showToast('Failed to update user status', 'error');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-subtle border border-accent-border text-accent text-xs font-semibold mb-2">
            <ShieldCheck className="w-3 h-3" />
            <span>Governance & Administration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary">
            Coupons, User Directory & Enterprise Audit Logs
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Server-validated discounts, user role administration, and immutable audit logs tracking administrative state mutations.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="prem-btn-secondary p-2"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'coupons'
              ? 'bg-accent-subtle text-accent border border-accent-border font-semibold'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card border border-transparent'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Coupons & Promotions ({coupons.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-accent-subtle text-accent border border-accent-border font-semibold'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card border border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Directory ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'audit'
              ? 'bg-accent-subtle text-accent border border-accent-border font-semibold'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card border border-transparent'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Enterprise Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Coupons Section */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Coupon Form (4 cols) */}
          <div className="lg:col-span-4 prem-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Plus className="w-3.5 h-3.5 text-accent" />
              Create Coupon
            </h2>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="FLASH25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="prem-input w-full uppercase font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="prem-input w-full"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Value ({discountType === 'PERCENTAGE' ? '%' : '₹'})</label>
                  <input
                    type="number"
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="prem-input w-full font-bold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="prem-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                    className="prem-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Total Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="prem-input w-full"
                />
              </div>

              <button
                type="submit"
                disabled={creating || !code.trim()}
                className="prem-btn-primary w-full py-2.5 text-xs pt-2"
              >
                {creating ? 'Saving Coupon...' : 'Create Active Coupon'}
              </button>
            </form>
          </div>

          {/* Active Coupons List (8 cols) */}
          <div className="lg:col-span-8 prem-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider pb-3 border-b border-border-subtle">
              Active Platform Coupons ({coupons.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5">Code</th>
                    <th className="pb-2.5">Discount</th>
                    <th className="pb-2.5">Min Order</th>
                    <th className="pb-2.5">Usage</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-card-hover/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-accent">
                        {c.code}
                      </td>
                      <td className="py-3 font-semibold text-txt-primary">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="py-3 text-txt-secondary">
                        ₹{c.minOrderAmount.toLocaleString()}
                      </td>
                      <td className="py-3 text-txt-secondary">
                        <span className="font-bold text-txt-primary">{c.timesUsed}</span> / {c.usageLimit}
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
      )}

      {/* Tab 2: Users Directory Section */}
      {activeTab === 'users' && (
        <div className="prem-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div>
              <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">User Directory & Roles</h2>
              <span className="text-[11px] text-txt-muted">Manage system users, customer accounts, and access permissions</span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search username, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="prem-input w-full pl-8 text-xs py-1.5"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">User</th>
                  <th className="pb-2.5">Roles</th>
                  <th className="pb-2.5">Orders</th>
                  <th className="pb-2.5">Total Spent</th>
                  <th className="pb-2.5">Account Status</th>
                  <th className="pb-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-card-hover/40 transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-txt-primary">{u.fullName || u.username}</div>
                      <div className="text-[11px] text-txt-muted font-mono">{u.email}</div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((role) => (
                          <Badge
                            key={role}
                            variant={role.includes('ADMIN') ? 'purple' : role.includes('MANAGER') ? 'blue' : 'slate'}
                            size="sm"
                          >
                            {role.replace('ROLE_', '')}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-txt-primary">
                      {u.totalOrdersPlaced || 0}
                    </td>
                    <td className="py-3 font-mono font-semibold text-accent">
                      ₹{(u.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <Badge variant={u.enabled ? 'emerald' : 'rose'} size="sm" dot>
                        {u.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.enabled)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          u.enabled
                            ? 'border-status-danger/30 text-status-danger hover:bg-status-danger-subtle'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Enterprise Audit Logs Table */}
      {activeTab === 'audit' && (
        <div className="prem-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Enterprise Immutable Audit Logs</h2>
            </div>
            <span className="text-[11px] text-txt-muted">All administrative state changes logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Timestamp</th>
                  <th className="pb-2.5">Actor</th>
                  <th className="pb-2.5">Action</th>
                  <th className="pb-2.5">Entity</th>
                  <th className="pb-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-card-hover/40 transition-colors">
                    <td className="py-2.5 text-txt-muted font-mono text-[11px]">{log.timestamp?.substring(0, 19)}</td>
                    <td className="py-2.5 font-medium text-txt-primary">{log.actor}</td>
                    <td className="py-2.5">
                      <Badge variant="blue" size="sm">{log.action}</Badge>
                    </td>
                    <td className="py-2.5 font-mono text-txt-secondary text-[11px]">
                      {log.entityName} #{log.entityId}
                    </td>
                    <td className="py-2.5 text-txt-muted max-w-sm text-[11px]">
                      {log.reason || 'Standard operational update'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
