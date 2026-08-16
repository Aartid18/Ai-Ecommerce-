import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SellerAiResponse } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Bot,
  Sparkles,
  Send,
  Database,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface SellerChatMessage {
  sender: 'user' | 'assistant';
  text?: string;
  data?: SellerAiResponse;
  timestamp: string;
}

export const SellerAiCopilot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<SellerChatMessage[]>([
    {
      sender: 'assistant',
      text: "Welcome to the Seller Operations AI Copilot. I am directly integrated with your live database schema, tracking real inventory stock levels, supplier lead times, sales velocities, dead-stock capital, and flagged order risks. Ask me anything about your operational health!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (userQuery: string) => {
    if (!userQuery.trim() || loading) return;

    const newMsg: SellerChatMessage = {
      sender: 'user',
      text: userQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/seller-assistant', {
        userQuery: userQuery.trim(),
      });

      const aiMsg: SellerChatMessage = {
        sender: 'assistant',
        data: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: SellerChatMessage = {
        sender: 'assistant',
        text: 'Failed to retrieve operational analysis from backend intelligence service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (actionCategory: string, productId?: number) => {
    if (actionCategory === 'INVENTORY_REORDER') {
      navigate('/admin/inventory');
      showToast('Redirected to Inventory Reorders table to confirm Purchase Order', 'info');
    } else if (actionCategory === 'DEAD_STOCK_LIQUIDATION') {
      navigate('/admin/demand-radar');
      showToast('Redirected to Demand Radar to configure clearance promotion', 'info');
    } else {
      navigate('/admin/orders');
    }
  };

  const operationalPrompts = [
    'Which products will stock out in the next 7 days?',
    'What inventory is dead stock and how do I liquidate it?',
    'Analyze sales velocity against supplier lead times',
    'Review high-risk flagged orders',
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/15">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-100">Seller Operations AI Copilot</h1>
              <Badge variant="emerald" size="sm">Grounded Warehouse & Velocity Data</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live database grounding • Stockout forecasting • Capital liquidation intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {operationalPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all font-medium"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-6 min-h-[450px] max-h-[650px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } space-y-2`}
          >
            <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
              <span className="font-semibold">{msg.sender === 'user' ? 'Operator' : 'Operations AI Copilot'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {msg.text && (
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* Structured Seller AI Response */}
            {msg.data && (
              <div className="w-full space-y-4 pt-1">
                {msg.data.summaryHeading && (
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {msg.data.summaryHeading}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Grounded Data Points */}
                  <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      Live Data Grounding
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {msg.data.actualDataPoints?.map((dp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{dp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Calculated Velocity Metrics */}
                  <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                      Calculated Velocity
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {msg.data.calculatedMetrics?.map((cm, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{cm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Projections & Forecasts */}
                  <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      Forecast Risk
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {msg.data.forecasts?.map((fc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{fc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Operational Actions */}
                {msg.data.actionRecommendations && msg.data.actionRecommendations.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Recommended Operational Actions:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {msg.data.actionRecommendations.map((act, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-200">{act.recommendationText}</div>
                            <div className="text-[11px] text-emerald-400 font-medium mt-1">
                              ⚡ {act.potentialImpact}
                            </div>
                          </div>

                          <button
                            onClick={() => handleExecuteAction(act.issueCategory, act.productId)}
                            className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all self-start"
                          >
                            <span>{act.actionButtonText || 'Execute Action'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 w-fit">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Consulting warehouse logs, sales velocities, and supplier lead times...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="relative"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask operational questions (e.g. stockout forecast, dead-stock capital, supplier lead times)..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-5 pr-14 py-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="absolute right-3 top-2.5 p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 rounded-xl transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
