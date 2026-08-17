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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-5 space-y-4 text-txt-primary">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-subtle text-indigo-accent rounded-lg border border-indigo-accent/25">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Join Smart Pre-Order</h3>
              <p className="text-[10px] text-txt-muted">Demand-Driven Inventory Allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-3.5">
          <div className="flex items-center gap-3 p-3 bg-surface-card rounded-xl border border-border-subtle">
            <div className="w-12 h-12 rounded-lg bg-[#111820] border border-border-subtle p-0.5 flex items-center justify-center flex-shrink-0">
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-txt-primary truncate">{product.name}</div>
              <div className="text-xs font-bold text-accent mt-0.5 font-sans">
                ₹{product.finalPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-bg-primary rounded-xl border border-border-subtle text-center">
              <div className="text-[10px] text-txt-muted flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-status-warning" />
                Expected ETA
              </div>
              <div className="text-xs font-bold text-txt-primary">
                {product.preOrderExpectedAvailability || '14 Days'}
              </div>
            </div>
            <div className="p-2.5 bg-bg-primary rounded-xl border border-border-subtle text-center">
              <div className="text-[10px] text-txt-muted flex items-center justify-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-indigo-accent" />
                Interested
              </div>
              <div className="text-xs font-bold text-indigo-accent">
                {product.preOrderCount || 127} shoppers
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">
              Select Quantity:
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="prem-input w-full font-bold font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5 text-[11px] text-txt-muted bg-bg-primary p-3 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-1.5 text-txt-secondary font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Priority stock allocation upon arrival</span>
            </div>
            <div className="flex items-center gap-1.5 text-txt-secondary font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Zero-penalty cancellation before dispatch</span>
            </div>
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
              {submitting ? 'Confirming...' : 'Join Pre-Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
