import React, { useState } from 'react';
import api from '../../services/api';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { X, TrendingDown, Bell, ShieldCheck } from 'lucide-react';

interface PriceWatchModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceWatchModal: React.FC<PriceWatchModalProps> = ({ product, isOpen, onClose }) => {
  const [targetPrice, setTargetPrice] = useState<number>(Math.round(product.finalPrice * 0.85));
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const currentPrice = product.finalPrice;
  const discountNeeded = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login to set price alerts', 'warning');
      return;
    }
    if (targetPrice >= currentPrice) {
      showToast('Target price should be lower than current price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/price-watches/set', {
        productId: product.id,
        targetPrice,
      });
      showToast(
        `Price watch set! We'll notify you when ${product.name} reaches ₹${targetPrice.toLocaleString()}`,
        'success',
        'Watch Active'
      );
      onClose();
    } catch (err: any) {
      showToast('Failed to set price watch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-5 space-y-4 text-txt-primary">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent-subtle text-accent rounded-lg border border-accent-border">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Set Price Watch Alert</h3>
              <p className="text-[10px] text-txt-muted">Demand Radar Automated Notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex items-center gap-3 p-3 bg-surface-card rounded-xl border border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-[#111820] border border-border-subtle p-0.5 flex items-center justify-center flex-shrink-0">
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-txt-primary truncate">{product.name}</div>
              <div className="text-[11px] text-txt-muted mt-0.5">
                Current: <span className="text-txt-primary font-bold font-sans">₹{currentPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">
              Notify me when price reaches (₹):
            </label>
            <div className="relative">
              <input
                type="number"
                min={100}
                max={currentPrice - 1}
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="prem-input w-full font-bold font-mono text-xs"
                required
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-txt-muted mt-1">
              <span>Required drop: ~{discountNeeded}%</span>
              <span>Suggested: ₹{Math.round(currentPrice * 0.85).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-bg-primary rounded-xl border border-border-subtle text-[11px] text-txt-muted space-y-1">
            <div className="flex items-center gap-1.5 text-txt-secondary font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Demand Radar Synchronization</span>
            </div>
            <p className="leading-relaxed">
              When buyer price watches cluster, sellers receive instant promotion alerts to bridge the demand gap.
            </p>
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="prem-btn-secondary flex-1 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="prem-btn-primary flex-1 py-2 text-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              {submitting ? 'Setting Alert...' : 'Confirm Price Watch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
