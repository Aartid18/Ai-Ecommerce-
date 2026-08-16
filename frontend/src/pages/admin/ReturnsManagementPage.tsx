import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ReturnRequest } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  AlertTriangle,
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
      setReturns(res.data);
    } catch (err) {
      console.error('Failed to load returns', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (returnId: number, status: 'APPROVED' | 'REJECTED' | 'REFUNDED') => {
    const notes = decisionNotes[returnId] || (status === 'APPROVED' ? 'Approved based on customer photos' : 'Rejected after inspection');
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Post-Purchase Returns & Reverse Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Returns & Refund Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer claims, inspect defect evidence, process refunds, and adjust reverse inventory.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Return Requests Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100">Customer Return Claims ({returns.length})</h2>
          <span className="text-xs text-slate-400">7-Day standard warranty claims</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Reason / Details</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Operator Decision & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 font-mono font-bold text-slate-200">
                    <div>{ret.orderNumber}</div>
                    <div className="text-[11px] font-normal text-slate-500">{ret.createdAt?.substring(0, 10)}</div>
                  </td>

                  <td className="py-4 font-semibold text-slate-200">
                    {ret.customerName}
                  </td>

                  <td className="py-4 max-w-xs text-slate-300">
                    <div className="font-bold text-slate-200">{ret.reason}</div>
                    {ret.customNotes && <div className="text-slate-400 text-[11px] mt-0.5">{ret.customNotes}</div>}
                    {ret.evidenceUrl && (
                      <a
                        href={ret.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 text-[11px] hover:underline block mt-0.5"
                      >
                        View Photo Evidence
                      </a>
                    )}
                  </td>

                  <td className="py-4">
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

                  <td className="py-4 space-y-2">
                    {ret.status === 'REQUESTED' || ret.status === 'UNDER_REVIEW' ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Audit decision reason..."
                          value={decisionNotes[ret.id] || ''}
                          onChange={(e) =>
                            setDecisionNotes({ ...decisionNotes, [ret.id]: e.target.value })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(ret.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                          >
                            Approve & Refund
                          </button>
                          <button
                            onClick={() => handleDecision(ret.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[11px]">
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
