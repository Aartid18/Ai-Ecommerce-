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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Set Price Watch Alert</h3>
              <p className="text-xs text-slate-400">Demand Radar Powered Notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-850 rounded-xl border border-slate-800">
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">{product.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Current Price: <span className="text-emerald-400 font-bold">₹{currentPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notify me when price drops to:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={100}
                max={currentPrice - 1}
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Required drop: ~{discountNeeded}%</span>
              <span>Suggested: ₹{Math.round(currentPrice * 0.85).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How Demand Radar Works</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When enough customers set price watches, our system alerts sellers to run promotions around the target demand band. You'll receive an instant in-app notification when the price drops!
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
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
