import React, { useState } from 'react';
import api from '../../services/api';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { X, PackageCheck, Clock, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PreOrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PreOrderModal: React.FC<PreOrderModalProps> = ({ product, isOpen, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to join pre-orders', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/preorders/join', {
        productId: product.id,
        quantity,
      });
      showToast(
        `Pre-order confirmed for ${product.name}! Expected in ${product.preOrderExpectedAvailability || '14 days'}`,
        'success',
        'Pre-Order Reserved'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Failed to join pre-order', 'error');
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
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Join Smart Pre-Order</h3>
              <p className="text-xs text-slate-400">Demand-Driven Inventory Allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="mt-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-850 rounded-xl border border-slate-800">
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="w-14 h-14 rounded-lg object-cover bg-slate-800"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">{product.name}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span>Unit Price:</span>
                <span className="text-emerald-400 font-bold">₹{product.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Expected ETA
              </div>
              <div className="text-sm font-bold text-slate-100">
                {product.preOrderExpectedAvailability || '14 Days'}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Interested
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {product.preOrderCount || 127} customers
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Quantity:
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Priority stock allocation when supplier shipment arrives</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Cancel anytime before dispatch with zero penalty</span>
            </div>
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
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {submitting ? 'Confirming...' : 'Join Pre-Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
