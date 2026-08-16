import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ExecutiveBriefing, WhyRevenueChanged, ChartDataPoint } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/shared/Badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Package,
  ShieldAlert,
  ArrowRight,
  Zap,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [briefing, setBriefing] = useState<ExecutiveBriefing | null>(null);
  const [whyRevenue, setWhyRevenue] = useState<WhyRevenueChanged | null>(null);
  const [salesTrend, setSalesTrend] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
    setLoading(true);
    try {
      const [briefRes, whyRes, chartRes] = await Promise.allSettled([
        api.get('/analytics/executive-briefing'),
        api.get('/analytics/why-revenue-changed'),
        api.get('/analytics/sales-trend'),
      ]);

      if (briefRes.status === 'fulfilled') setBriefing(briefRes.value.data);
      if (whyRes.status === 'fulfilled') setWhyRevenue(whyRes.value.data);
      if (chartRes.status === 'fulfilled') setSalesTrend(chartRes.value.data);
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const financial = briefing?.financialSnapshot;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Morning Executive Briefing Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily AI Intelligence Briefing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {briefing?.greeting || "Good morning! Here's what needs attention today."}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time synchronization across sales velocity, customer price alerts, and inventory health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/demand-radar')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" /> Demand Radar
            </button>
            <button
              onClick={() => navigate('/admin/ai-copilot')}
              className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" /> Seller AI Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Critical Issues & Opportunities Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Issues */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Critical Operations Needs
              </h2>
            </div>
            <Badge variant="rose" size="sm">
              {briefing?.criticalIssues?.length || 0} Urgent
            </Badge>
          </div>

          <div className="space-y-3">
            {briefing?.criticalIssues?.map((issue, idx) => (
              <div
                key={idx}
                onClick={() => navigate(issue.actionPath)}
                className="glass-card p-3.5 rounded-xl border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-200 group-hover:text-rose-300 transition-colors">
                    {issue.title}
                  </div>
                  <div className="text-slate-400 leading-snug">{issue.description}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 flex-shrink-0 mt-0.5">
                  <span>{issue.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Opportunities */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Demand Radar Opportunities
              </h2>
            </div>
            <Badge variant="emerald" size="sm">
              {briefing?.opportunities?.length || 0} Actions
            </Badge>
          </div>

          <div className="space-y-3">
            {briefing?.opportunities?.map((opp, idx) => (
              <div
                key={idx}
                onClick={() => navigate(opp.actionPath)}
                className="glass-card p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {opp.title}
                  </div>
                  <div className="text-slate-400 leading-snug">{opp.description}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 flex-shrink-0 mt-0.5">
                  <span>{opp.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Snapshot KPI Grid */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Platform Financial Performance
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={`₹${financial ? financial.totalRevenue.toLocaleString() : '0'}`}
            subtitle="Gross completed & active sales"
            icon={DollarSign}
            changePercentage={18.4}
            tone="emerald"
          />

          <StatCard
            title="Estimated Gross Profit"
            value={`₹${financial ? financial.estimatedProfit.toLocaleString() : '0'}`}
            subtitle={`Margin: ${financial ? financial.profitMarginPercentage : '0'}%`}
            icon={TrendingUp}
            changePercentage={14.2}
            tone="emerald"
          />

          <StatCard
            title="Cost of Goods (COGS)"
            value={`₹${financial ? financial.totalCOGS.toLocaleString() : '0'}`}
            subtitle="Supplier procurement outlay"
            icon={Package}
            tone="blue"
          />

          <StatCard
            title="Total Orders Placed"
            value={financial ? financial.totalOrders : 0}
            subtitle={`AOV: ₹${financial ? financial.averageOrderValue.toLocaleString() : '0'}`}
            icon={ShoppingBag}
            changePercentage={12.0}
            tone="purple"
          />
        </div>
      </div>

      {/* "Why Revenue Changed" Root Cause Analysis Breakdown */}
      {whyRevenue && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-slate-100">Why Did Revenue Change?</h2>
                <Badge variant={whyRevenue.overallChangePercentage >= 0 ? 'emerald' : 'rose'}>
                  {whyRevenue.overallChangePercentage >= 0 ? '+' : ''}{whyRevenue.overallChangePercentage}% {whyRevenue.periodComparison}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Root Cause Attribution: <strong className="text-slate-200">{whyRevenue.primaryRootCause}</strong>
              </p>
            </div>

            <div className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-md">
              <span className="font-bold text-emerald-400">AI Root Cause Summary: </span>
              {whyRevenue.aiInsightSummary}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyRevenue.topContributors?.map((factor, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{factor.factorName}</span>
                  <span
                    className={`text-xs font-extrabold ${
                      factor.impactType === 'POSITIVE'
                        ? 'text-emerald-400'
                        : factor.impactType === 'NEGATIVE'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {factor.changePercentage >= 0 ? '+' : ''}{factor.changePercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue & Profit Trends Recharts Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Revenue vs Profit Trend</h3>
              <p className="text-xs text-slate-400">Daily gross revenue and net profit realization</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-400" />
                <span className="text-slate-300">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#2dd4bf" strokeWidth={2} fillOpacity={1} fill="url(#profGrad)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Volume Chart (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Orders Velocity</h3>
            <p className="text-xs text-slate-400">Daily transaction checkout volume</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="orders" fill="#818cf8" radius={[6, 6, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
