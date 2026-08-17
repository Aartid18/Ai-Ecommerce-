import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DemandSignal, SmartDealRecommendation } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Radio,
  Sparkles,
  Eye,
  Heart,
  Bell,
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

      if (sigRes.status === 'fulfilled') setSignals(Array.isArray(sigRes.value.data) ? sigRes.value.data : []);
      if (dealRes.status === 'fulfilled') setDeals(Array.isArray(dealRes.value.data) ? dealRes.value.data : []);
    } catch (err) {
      console.error('Failed to load demand radar signals', err);
      setSignals([]);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDeal = async (productId: number, discountPercentage: number) => {
    setApplyingProductId(productId);
    try {
      await api.post(`/demand-radar/apply-deal?productId=${productId}&discountPercentage=${discountPercentage}`);
      showToast(
        `Smart deal applied with ${discountPercentage}% discount! Price watch notifications dispatched.`,
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
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-subtle border border-accent-border text-accent text-xs font-semibold mb-2">
            <Radio className="w-3 h-3" />
            <span>Demand Radar Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary tracking-tight">
            Understand what customers want before they buy.
          </h1>
          <p className="text-xs text-txt-muted mt-1 max-w-2xl leading-relaxed">
            Aggregates buyer intent across search velocity, wishlist clustering, and target price watches. Generates explainable promotional actions with 1-click execution.
          </p>
        </div>

        <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-right">
          <div className="text-[10px] text-txt-muted uppercase font-semibold">Tracked Signals</div>
          <div className="text-lg font-bold text-accent font-sans">{signals.length} Products</div>
        </div>
      </div>

      {/* Smart Deal Recommendations */}
      {deals.length > 0 && (
        <div className="prem-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Smart Deal Center Recommendations</h2>
            </div>
            <Badge variant="emerald" size="sm">{deals.length} Opportunities</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.productId}
                className="prem-card-hover p-4 rounded-xl border border-border-subtle space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-txt-primary truncate">{deal.productName}</span>
                    <Badge variant="emerald" size="sm">
                      {deal.recommendedDiscountPercentage}% OFF
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs text-txt-muted line-through">Current: ₹{deal.currentPrice.toLocaleString()}</span>
                    <span className="text-xs text-txt-disabled">→</span>
                    <span className="text-sm font-bold text-accent font-sans">
                      Target: ₹{deal.recommendedPrice.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-txt-secondary leading-snug">{deal.dealReason}</p>

                  <div className="p-2.5 bg-bg-primary rounded-lg border border-border-subtle text-[11px] text-accent font-medium">
                    ⚡ {deal.potentialImpact}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyDeal(deal.productId, deal.recommendedDiscountPercentage)}
                  disabled={applyingProductId === deal.productId}
                  className="prem-btn-primary w-full py-2.5 text-xs"
                >
                  <Tag className="w-3.5 h-3.5" />
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
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Live Demand Opportunity Signals</h2>
          <span className="text-[11px] text-txt-muted">Real-time shopper intent metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Product / SKU</th>
                <th className="pb-2.5">Demand Score</th>
                <th className="pb-2.5">Signals (Search / Wish / Watch)</th>
                <th className="pb-2.5">Current Price</th>
                <th className="pb-2.5">Target Demand Band</th>
                <th className="pb-2.5">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {signals.map((sig) => (
                <tr key={sig.id} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-medium text-txt-primary">
                    <div>{sig.productName}</div>
                    <div className="text-[10px] font-mono text-txt-muted">{sig.productSku} • {sig.categoryName}</div>
                  </td>

                  <td className="py-3">
                    <Badge variant={sig.status === 'HIGH' ? 'emerald' : sig.status === 'MODERATE' ? 'amber' : 'slate'} dot>
                      {sig.demandScore}/100 ({sig.status})
                    </Badge>
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2.5 text-txt-secondary text-[11px]">
                      <span className="flex items-center gap-1" title="Search Queries">
                        <Eye className="w-3 h-3 text-txt-muted" /> {sig.searchCount}
                      </span>
                      <span className="flex items-center gap-1" title="Wishlist Count">
                        <Heart className="w-3 h-3 text-status-danger" /> {sig.wishlistCount}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-accent" title="Active Price Watches">
                        <Bell className="w-3 h-3" /> {sig.priceWatchCount}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 font-semibold text-txt-primary font-sans">
                    ₹{sig.currentPrice.toLocaleString()}
                  </td>

                  <td className="py-3">
                    <span className="bg-accent-subtle text-accent border border-accent-border px-2 py-0.5 rounded font-mono text-[11px]">
                      {sig.targetDemandPriceRange}
                    </span>
                  </td>

                  <td className="py-3 max-w-xs text-txt-secondary text-[11px]">
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
