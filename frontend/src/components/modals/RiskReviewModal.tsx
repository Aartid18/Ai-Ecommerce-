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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Order Risk Assessment</h3>
                <Badge variant={riskBadgeVariant} dot size="sm">
                  Risk Score: {order.riskScore}/100 ({order.riskLevel})
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainable Signals */}
        <div className="mt-5 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Explainable Risk Indicators
            </div>
            <ul className="space-y-1.5">
              {order.riskReasons && order.riskReasons.length > 0 ? (
                order.riskReasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-rose-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-emerald-400">Normal order risk profile.</li>
              )}
            </ul>
          </div>

          {/* Customer & Order Data Grounding */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer Info
              </div>
              <div className="font-semibold text-slate-200 truncate">{order.customerName}</div>
              <div className="text-slate-400 text-[11px] truncate">{order.customerEmail}</div>
              <div className="text-slate-400 text-[11px]">{order.phone}</div>
            </div>

            <div className="p-3 bg-slate-850 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Financial Impact
              </div>
              <div className="font-bold text-emerald-400 text-sm">₹{order.finalAmount.toLocaleString()}</div>
              <div className="text-slate-400 text-[11px]">Payment: {order.paymentMethod}</div>
              <div className="text-slate-400 text-[11px]">COGS: ₹{order.totalAmount ? (order.totalAmount * 0.6).toFixed(0) : '0'}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800/80 text-xs">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Delivery Destination
            </div>
            <div className="text-slate-300 font-medium">{order.shippingAddress}</div>
          </div>

          {/* Operator Decision Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Operator Decision Audit Notes:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified customer contact phone number and confirmed high-value corporate purchase intent."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('REJECT')}
              className="flex-1 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject & Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('REQUEST_VERIFICATION')}
              className="flex-1 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Request Verification
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('APPROVE')}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
