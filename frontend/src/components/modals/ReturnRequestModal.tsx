import React, { useState } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';
import { X, RotateCcw, ShieldCheck } from 'lucide-react';

interface ReturnRequestModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('Defective / Not functioning properly');
  const [customNotes, setCustomNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/returns/request', {
        orderId: order.id,
        reason,
        customNotes: customNotes.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
      });
      showToast('Return request submitted for Order #' + order.orderNumber, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit return request';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-5 space-y-4 text-txt-primary">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-subtle text-indigo-accent rounded-lg border border-indigo-accent/25">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Request Order Return</h3>
              <p className="text-[10px] text-txt-muted">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">
              Reason for Return:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="prem-input w-full text-xs"
            >
              <option value="Defective / Not functioning properly">Defective / Not functioning properly</option>
              <option value="Damaged in transit">Damaged in transit</option>
              <option value="Wrong product received">Wrong product received</option>
              <option value="Product not as described">Product not as described</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">
              Details / Description:
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Describe the issue with the delivered product..."
              className="prem-input w-full text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">
              Photo Evidence URL (Optional):
            </label>
            <input
              type="text"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://image-link-to-damaged-item.jpg"
              className="prem-input w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-bg-primary rounded-xl border border-border-subtle text-[11px] text-txt-muted">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
            <span>Eligible for 100% refund of ₹{order.finalAmount.toLocaleString()} upon approval</span>
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
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
