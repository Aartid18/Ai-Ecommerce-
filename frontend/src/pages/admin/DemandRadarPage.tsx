import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DemandSignal, SmartDealRecommendation } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Radar,
  Sparkles,
  Zap,
  TrendingUp,
  Bell,
  Eye,
  Heart,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';

export const DemandRadarPage: React.FC = () => {
  const [signals, setSignals] = useState<DemandSignal[]>([]);
  const [deals, setDeals] = useState<SmartDealRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingProductId, setApplyingProductId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDemandRadarData();
  }, []);

  const fetchDemandRadarData = async () => {
    setLoading(true);
    try {
      const [sigRes, dealRes] = await Promise.allSettled([
        api.get('/demand-radar/signals'),
        api.get('/demand-radar/smart-deals'),
      ]);

      if (sigRes.status === 'fulfilled') setSignals(sigRes.value.data);
      if (dealRes.status === 'fulfilled') setDeals(dealRes.value.data);
    } catch (err) {
      console.error('Failed to load demand radar signals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDeal = async (productId: number, discountPercentage: number) => {
    setApplyingProductId(productId);
    try {
      await api.post(`/demand-radar/apply-deal?productId=${productId}&discountPercentage=${discountPercentage}`);
      showToast(
        `Smart deal applied with ${discountPercentage}% discount! Price watch notifications triggered to waiting customers.`,
        'success',
        'Promotion Activated'
      );
      await fetchDemandRadarData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to apply smart deal';
      showToast(msg, 'error');
    } finally {
      setApplyingProductId(null);
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Radar className="w-3.5 h-3.5 animate-pulse" />
              <span>Signature Feature: Customer Demand → Seller Action</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Demand Radar & Smart Deal Engine
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitors unfulfilled buyer intent across search velocity, wishlist clustering, and target price watches. Automatically generates high-conversion promotional recommendations that notify interested buyers instantly.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-right">
            <div className="text-xs text-slate-400">Tracked Demand Signals</div>
            <div className="text-2xl font-extrabold text-emerald-400">{signals.length} Products</div>
          </div>
        </div>
      </div>

      {/* Smart Deal Engine 1-Click Promotional Opportunities */}
      {deals.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">Smart Deal Pricing Engine Recommendations</h2>
            </div>
            <Badge variant="emerald" size="sm">{deals.length} Actionable Deals</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.productId}
                className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{deal.productName}</span>
                    <Badge variant="emerald" size="sm">
                      Recommend {deal.recommendedDiscountPercentage}% OFF
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-slate-400">Current: ₹{deal.currentPrice.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">→</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      Target: ₹{deal.recommendedPrice.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">{deal.dealReason}</p>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-300 font-medium">
                    ⚡ {deal.potentialImpact}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyDeal(deal.productId, deal.recommendedDiscountPercentage)}
                  disabled={applyingProductId === deal.productId}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Tag className="w-4 h-4" />
                  {applyingProductId === deal.productId
                    ? 'Applying Promotion & Notifying Watchers...'
                    : `Apply ${deal.recommendedDiscountPercentage}% Deal & Notify Price Watchers`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demand Signal Matrix Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100">Live Demand Intelligence Signals</h2>
          <span className="text-xs text-slate-400">Aggregated real-time shopper intent metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Product / SKU</th>
                <th className="pb-3">Demand Score</th>
                <th className="pb-3">Signals (Search / Wish / Watch)</th>
                <th className="pb-3">Current Price</th>
                <th className="pb-3">Target Demand Band</th>
                <th className="pb-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {signals.map((sig) => (
                <tr key={sig.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 font-semibold text-slate-200">
                    <div>{sig.productName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{sig.productSku} • {sig.categoryName}</div>
                  </td>

                  <td className="py-4">
                    <Badge variant={sig.status === 'HIGH' ? 'emerald' : sig.status === 'MODERATE' ? 'amber' : 'slate'} dot>
                      Score: {sig.demandScore}/100 ({sig.status})
                    </Badge>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <span className="flex items-center gap-1" title="Search Queries">
                        <Eye className="w-3.5 h-3.5 text-slate-400" /> {sig.searchCount}
                      </span>
                      <span className="flex items-center gap-1" title="Wishlist Count">
                        <Heart className="w-3.5 h-3.5 text-rose-400" /> {sig.wishlistCount}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-400" title="Active Price Watches">
                        <Bell className="w-3.5 h-3.5" /> {sig.priceWatchCount}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 font-bold text-slate-200">
                    ₹{sig.currentPrice.toLocaleString()}
                  </td>

                  <td className="py-4">
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-md font-mono font-semibold">
                      {sig.targetDemandPriceRange}
                    </span>
                  </td>

                  <td className="py-4 max-w-xs text-slate-300">
                    {sig.recommendedAction}
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
