import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SellerAiResponse } from '../../types';
import { Badge } from '../../components/shared/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Send,
  Database,
  BarChart3,
  TrendingUp,
  ArrowRight,
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

  const handleExecuteAction = (actionCategory: string) => {
    if (actionCategory === 'INVENTORY_REORDER' || actionCategory === 'STOCKOUT_RISK') {
      navigate('/admin/inventory');
      showToast('Redirected to Inventory Reorders table to confirm Purchase Order', 'info');
    } else if (actionCategory === 'DEAD_STOCK_LIQUIDATION' || actionCategory === 'DEMAND_SURGE') {
      navigate('/admin/demand-radar');
      showToast('Redirected to Demand Radar to configure promotion', 'info');
    } else {
      navigate('/admin/orders');
    }
  };

  const operationalPrompts = [
    'What should I focus on today?',
    'Which products will stock out in the next 7 days?',
    'What inventory is dead stock and how do I liquidate it?',
    'Review high-risk flagged orders',
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="prem-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent-border text-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-txt-primary">Seller Operations AI Copilot</h1>
              <Badge variant="emerald" size="sm">Live Warehouse & Velocity Intelligence</Badge>
            </div>
            <p className="text-[11px] text-txt-muted mt-0.5">
              Live schema grounding • Stockout forecasting • Actionable recommendations
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
            className="text-xs px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-card-hover border border-border-subtle hover:border-border-hover text-txt-secondary hover:text-txt-primary transition-all font-medium"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="prem-card p-5 space-y-5 min-h-[420px] max-h-[600px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-txt-muted px-1">
              <span className="font-semibold">{msg.sender === 'user' ? 'Operator' : 'Operations AI Copilot'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {msg.text && (
              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-accent text-bg-primary font-medium rounded-tr-none'
                    : 'bg-surface-card border border-border-subtle text-txt-primary rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* Structured Seller AI Response */}
            {msg.data && (
              <div className="w-full space-y-3.5 pt-1">
                {msg.data.summaryHeading && (
                  <div className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    {msg.data.summaryHeading}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Grounded Data Points */}
                  <div className="prem-card p-3.5 border border-border-subtle space-y-1.5">
                    <div className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-status-info" />
                      Live Data Grounding
                    </div>
                    <ul className="space-y-1 text-xs text-txt-secondary">
                      {msg.data.actualDataPoints?.map((dp, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-status-info font-bold">•</span>
                          <span>{dp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Calculated Velocity Metrics */}
                  <div className="prem-card p-3.5 border border-border-subtle space-y-1.5">
                    <div className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3 h-3 text-accent" />
                      Calculated Velocity
                    </div>
                    <ul className="space-y-1 text-xs text-txt-secondary">
                      {msg.data.calculatedMetrics?.map((cm, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-accent font-bold">•</span>
                          <span>{cm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Forecasts */}
                  <div className="prem-card p-3.5 border border-border-subtle space-y-1.5">
                    <div className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-status-warning" />
                      Forecast Risk
                    </div>
                    <ul className="space-y-1 text-xs text-txt-secondary">
                      {msg.data.forecasts?.map((fc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-status-warning font-bold">•</span>
                          <span>{fc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Operational Actions */}
                {msg.data.actionRecommendations && msg.data.actionRecommendations.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] font-semibold text-txt-muted uppercase tracking-wider">
                      Priority Actions:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {msg.data.actionRecommendations.map((act, aIdx) => (
                        <div
                          key={aIdx}
                          className="prem-card-hover p-3.5 border border-border-subtle flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="text-xs font-semibold text-txt-primary">{act.recommendationText}</div>
                            {act.potentialImpact && (
                              <div className="text-[11px] text-accent font-medium mt-1">
                                ⚡ {act.potentialImpact}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleExecuteAction(act.issueCategory)}
                            className="prem-btn-primary text-xs py-1.5 px-3 self-start"
                          >
                            <span>{act.actionButtonText || 'Execute Action'}</span>
                            <ArrowRight className="w-3 h-3" />
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
          <div className="flex items-center gap-2.5 p-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-txt-muted w-fit">
            <Sparkles className="w-4 h-4 text-accent animate-spin" />
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
          placeholder="Ask operational questions (e.g. stockout forecast, dead stock capital, reorders)..."
          className="prem-input w-full py-3.5 pr-12 text-xs"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="prem-btn-primary absolute right-2 top-2 p-2 rounded-lg"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
