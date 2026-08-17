import React, { useState } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../shared/Badge';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react';

interface RiskReviewModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onDecisionComplete: () => void;
}

export const RiskReviewModal: React.FC<RiskReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onDecisionComplete,
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDecision = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_VERIFICATION') => {
    if (!notes.trim()) {
      showToast('Please provide decision notes for audit log compliance', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/orders/manage/${order.id}/risk-review`, {
        action,
        notes: notes.trim(),
      });
      showToast(`Risk decision "${action}" recorded successfully for Order #${order.orderNumber}`, 'success');
      onDecisionComplete();
      onClose();
    } catch (err: any) {
      showToast('Failed to submit risk review decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const riskBadgeVariant =
    order.riskLevel === 'CRITICAL' || order.riskLevel === 'HIGH'
      ? 'rose'
      : order.riskLevel === 'MEDIUM'
      ? 'amber'
      : 'emerald';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-5 space-y-4 text-txt-primary">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-status-danger-subtle text-status-danger rounded-lg border border-status-danger/25">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Order Risk Assessment</h3>
                <Badge variant={riskBadgeVariant} dot size="sm">
                  {order.riskScore}/100 ({order.riskLevel})
                </Badge>
              </div>
              <p className="text-[10px] text-txt-muted">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explainable Signals */}
        <div className="space-y-3.5">
          <div className="p-3.5 bg-bg-primary rounded-xl border border-border-subtle">
            <div className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-status-warning" />
              Explainable Risk Indicators
            </div>
            <ul className="space-y-1">
              {order.riskReasons && order.riskReasons.length > 0 ? (
                order.riskReasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-status-danger flex items-start gap-1.5 text-[11px]">
                    <span className="font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-[11px] text-accent">Standard risk threshold met.</li>
              )}
            </ul>
          </div>

          {/* Customer & Order Data Grounding */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-surface-card rounded-xl border border-border-subtle">
              <div className="text-txt-muted flex items-center gap-1.5 mb-1 text-[10px] uppercase font-semibold">
                <User className="w-3 h-3 text-txt-muted" />
                Customer
              </div>
              <div className="font-semibold text-txt-primary truncate">{order.customerName}</div>
              <div className="text-txt-muted text-[10px] truncate">{order.customerEmail}</div>
              <div className="text-txt-muted text-[10px]">{order.phone}</div>
            </div>

            <div className="p-3 bg-surface-card rounded-xl border border-border-subtle">
              <div className="text-txt-muted flex items-center gap-1.5 mb-1 text-[10px] uppercase font-semibold">
                <CreditCard className="w-3 h-3 text-txt-muted" />
                Financial Impact
              </div>
              <div className="font-bold text-accent text-xs font-sans">₹{order.finalAmount.toLocaleString()}</div>
              <div className="text-txt-muted text-[10px]">Method: {order.paymentMethod}</div>
              <div className="text-txt-muted text-[10px]">Risk Level: {order.riskLevel}</div>
            </div>
          </div>

          <div className="p-3 bg-surface-card rounded-xl border border-border-subtle text-xs">
            <div className="text-txt-muted flex items-center gap-1.5 mb-1 text-[10px] uppercase font-semibold">
              <MapPin className="w-3 h-3 text-txt-muted" />
              Delivery Destination
            </div>
            <div className="text-txt-secondary text-[11px] font-medium">{order.shippingAddress}</div>
          </div>

          {/* Operator Decision Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-txt-muted" />
              Decision Audit Notes:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified customer contact and validated high-value purchase authorization."
              className="prem-input w-full text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('REJECT')}
              className="flex-1 py-2 bg-status-danger-subtle hover:bg-status-danger-subtle/80 text-status-danger border border-status-danger/25 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject & Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('REQUEST_VERIFICATION')}
              className="flex-1 py-2 bg-status-warning-subtle hover:bg-status-warning-subtle/80 text-status-warning border border-status-warning/25 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Request Verification
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('APPROVE')}
              className="prem-btn-primary flex-1 py-2 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
