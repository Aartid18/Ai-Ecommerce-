import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ReturnRequest } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export const ReturnsManagementPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState<{ [key: number]: string }>({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns/manage');
      setReturns(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load returns', err);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (returnId: number, status: 'APPROVED' | 'REJECTED' | 'REFUNDED') => {
    const notes = decisionNotes[returnId] || (status === 'APPROVED' ? 'Approved based on customer documentation' : 'Rejected after condition review');
    try {
      await api.put(`/returns/manage/${returnId}/decision`, {
        status,
        adminNotes: notes,
      });
      showToast(`Return request marked as ${status}`, 'success');
      await fetchReturns();
    } catch (err: any) {
      showToast('Failed to update return decision', 'error');
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="prem-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-subtle border border-indigo-accent/25 text-indigo-accent text-xs font-semibold mb-2">
            <RotateCcw className="w-3 h-3" />
            <span>Reverse Logistics & Returns</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary">
            Returns & Refund Management
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Review customer claims, inspect defect evidence, process refunds, and adjust reverse inventory.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          className="prem-btn-secondary p-2"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Return Requests Table */}
      <div className="prem-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Customer Return Claims ({returns.length})</h2>
          <span className="text-[11px] text-txt-muted">7-Day standard claims queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-txt-muted font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5">Order Number</th>
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Reason / Details</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Operator Decision & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-surface-card-hover/40 transition-colors">
                  <td className="py-3 font-mono font-semibold text-txt-primary">
                    <div>{ret.orderNumber}</div>
                    <div className="text-[10px] font-normal text-txt-muted">{ret.createdAt?.substring(0, 10)}</div>
                  </td>

                  <td className="py-3 font-medium text-txt-primary">
                    {ret.customerName}
                  </td>

                  <td className="py-3 max-w-xs text-txt-secondary">
                    <div className="font-semibold text-txt-primary">{ret.reason}</div>
                    {ret.customNotes && <div className="text-txt-muted text-[11px] mt-0.5">{ret.customNotes}</div>}
                    {ret.evidenceUrl && (
                      <a
                        href={ret.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent text-[11px] hover:underline block mt-0.5"
                      >
                        View Photo Evidence
                      </a>
                    )}
                  </td>

                  <td className="py-3">
                    <Badge
                      variant={
                        ret.status === 'APPROVED' || ret.status === 'REFUNDED'
                          ? 'emerald'
                          : ret.status === 'REJECTED'
                          ? 'rose'
                          : 'purple'
                      }
                    >
                      {ret.status}
                    </Badge>
                  </td>

                  <td className="py-3 space-y-1.5">
                    {ret.status === 'REQUESTED' || ret.status === 'UNDER_REVIEW' ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Audit decision notes..."
                          value={decisionNotes[ret.id] || ''}
                          onChange={(e) =>
                            setDecisionNotes({ ...decisionNotes, [ret.id]: e.target.value })
                          }
                          className="prem-input w-full text-[11px] py-1"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(ret.id, 'APPROVED')}
                            className="prem-btn-primary text-[11px] py-1 px-2.5"
                          >
                            Approve & Refund
                          </button>
                          <button
                            onClick={() => handleDecision(ret.id, 'REJECTED')}
                            className="prem-btn-secondary text-[11px] py-1 px-2.5 text-status-danger hover:text-status-danger"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-txt-muted text-[11px]">
                        {ret.adminDecisionNotes || 'Processed'}
                      </div>
                    )}
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
