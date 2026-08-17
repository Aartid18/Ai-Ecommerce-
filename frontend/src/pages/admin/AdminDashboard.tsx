import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ExecutiveBriefing, WhyRevenueChanged, ChartDataPoint } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/shared/Badge';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Package,
  ArrowRight,
  Radio,
  BarChart3,
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
      {/* Morning Executive Briefing */}
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-subtle border border-accent-border text-accent text-xs font-semibold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Executive Morning Briefing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary tracking-tight">
            {briefing?.greeting || "Good morning! Here's what needs attention today."}
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Real-time synchronization across sales velocity, customer price alerts, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/demand-radar')}
            className="prem-btn-primary text-xs py-2 px-3.5"
          >
            <Radio className="w-3.5 h-3.5" /> Demand Radar
          </button>
          <button
            onClick={() => navigate('/admin/ai-copilot')}
            className="prem-btn-secondary text-xs py-2 px-3.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" /> Seller AI Copilot
          </button>
        </div>
      </div>

      {/* Critical Issues & Opportunities Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Issues */}
        <div className="prem-card p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-danger" />
              <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                Priority Operations Items
              </h2>
            </div>
            <Badge variant="rose" size="sm">
              {briefing?.criticalIssues?.length || 0} Urgent
            </Badge>
          </div>

          <div className="space-y-2.5">
            {briefing?.criticalIssues?.map((issue, idx) => (
              <div
                key={idx}
                onClick={() => navigate(issue.actionPath)}
                className="prem-card-hover p-3 rounded-xl border border-border-subtle cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-txt-primary group-hover:text-status-danger transition-colors">
                    {issue.title}
                  </div>
                  <div className="text-txt-muted text-[11px] leading-snug">{issue.description}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-status-danger flex-shrink-0 mt-0.5">
                  <span>{issue.actionText}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Opportunities */}
        <div className="prem-card p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-accent" />
              <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                Demand Radar Opportunities
              </h2>
            </div>
            <Badge variant="emerald" size="sm">
              {briefing?.opportunities?.length || 0} Deals
            </Badge>
          </div>

          <div className="space-y-2.5">
            {briefing?.opportunities?.map((opp, idx) => (
              <div
                key={idx}
                onClick={() => navigate(opp.actionPath)}
                className="prem-card-hover p-3 rounded-xl border border-border-subtle cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-txt-primary group-hover:text-accent transition-colors">
                    {opp.title}
                  </div>
                  <div className="text-txt-muted text-[11px] leading-snug">{opp.description}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-accent flex-shrink-0 mt-0.5">
                  <span>{opp.actionText}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Snapshot KPI Grid */}
      <div>
        <div className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-3">
          Platform Performance Metrics
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₹${financial ? financial.totalRevenue.toLocaleString() : '0'}`}
            subtitle="Gross completed & active sales"
            icon={DollarSign}
            changePercentage={18.4}
            sparklineData={[40, 55, 45, 70, 65, 80, 95]}
          />

          <StatCard
            title="Estimated Profit"
            value={`₹${financial ? financial.estimatedProfit.toLocaleString() : '0'}`}
            subtitle={`Margin: ${financial ? financial.profitMarginPercentage : '0'}%`}
            icon={TrendingUp}
            changePercentage={14.2}
            sparklineData={[30, 40, 35, 60, 55, 70, 85]}
          />

          <StatCard
            title="Cost of Goods (COGS)"
            value={`₹${financial ? financial.totalCOGS.toLocaleString() : '0'}`}
            subtitle="Procurement outlay"
            icon={Package}
            sparklineData={[60, 55, 65, 50, 45, 55, 50]}
          />

          <StatCard
            title="Total Orders"
            value={financial ? financial.totalOrders : 0}
            subtitle={`AOV: ₹${financial ? financial.averageOrderValue.toLocaleString() : '0'}`}
            icon={ShoppingBag}
            changePercentage={12.0}
            sparklineData={[20, 35, 40, 55, 50, 65, 75]}
          />
        </div>
      </div>

      {/* "Why Revenue Changed" Analysis */}
      {whyRevenue && (
        <div className="prem-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Why Did Revenue Change?</h2>
                <Badge variant={whyRevenue.overallChangePercentage >= 0 ? 'emerald' : 'rose'}>
                  {whyRevenue.overallChangePercentage >= 0 ? '+' : ''}{whyRevenue.overallChangePercentage}% {whyRevenue.periodComparison}
                </Badge>
              </div>
              <p className="text-xs text-txt-muted mt-1">
                Root Cause Attribution: <strong className="text-txt-primary">{whyRevenue.primaryRootCause}</strong>
              </p>
            </div>

            <div className="text-[11px] text-txt-secondary bg-surface-card-hover border border-border-subtle p-2.5 rounded-xl max-w-md">
              <span className="font-semibold text-accent">Analysis: </span>
              {whyRevenue.aiInsightSummary}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {whyRevenue.topContributors?.map((factor, idx) => (
              <div key={idx} className="prem-card p-3.5 border border-border-subtle space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-txt-primary">{factor.factorName}</span>
                  <span
                    className={`text-xs font-bold font-sans ${
                      factor.impactType === 'POSITIVE'
                        ? 'text-accent'
                        : factor.impactType === 'NEGATIVE'
                        ? 'text-status-danger'
                        : 'text-txt-muted'
                    }`}
                  >
                    {factor.changePercentage >= 0 ? '+' : ''}{factor.changePercentage}%
                  </span>
                </div>
                <p className="text-[11px] text-txt-muted leading-snug">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue & Profit Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 prem-card p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Revenue & Profit Trend</h3>
              <p className="text-[11px] text-txt-muted">Gross daily revenue and net profit margin</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-txt-secondary">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-accent" />
                <span className="text-txt-secondary">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2DD4A8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2DD4A8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7185D8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7185D8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2731" vertical={false} />
                <XAxis dataKey="label" stroke="#6F7B86" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F7B86" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141B23',
                    borderColor: '#26313C',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F1F5F4',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2DD4A8" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#7185D8" strokeWidth={2} fillOpacity={1} fill="url(#profGrad)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Volume Chart */}
        <div className="lg:col-span-4 prem-card p-5 space-y-3.5">
          <div className="pb-3 border-b border-border-subtle">
            <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Orders Velocity</h3>
            <p className="text-[11px] text-txt-muted">Daily transaction volume</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2731" vertical={false} />
                <XAxis dataKey="label" stroke="#6F7B86" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F7B86" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141B23',
                    borderColor: '#26313C',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F1F5F4',
                  }}
                />
                <Bar dataKey="orders" fill="#7185D8" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
