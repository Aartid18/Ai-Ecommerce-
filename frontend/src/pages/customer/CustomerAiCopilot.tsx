import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CustomerAiResponse } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../../components/shared/Badge';
import {
  Sparkles,
  Send,
  ShoppingBag,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text?: string;
  data?: CustomerAiResponse;
  timestamp: string;
}

export const CustomerAiCopilot: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Shopping Copilot. My recommendations are directly grounded in verified catalog specifications, historical price-performance curves, and active warehouse stock. Ask me anything like: 'I need a coding laptop under ₹70,000' or 'Best noise-cancelling headphones'.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (userQuery: string) => {
    if (!userQuery.trim() || loading) return;

    const newMsg: ChatMessage = {
      sender: 'user',
      text: userQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/customer-assistant', {
        userQuery: userQuery.trim(),
      });

      const aiMsg: ChatMessage = {
        sender: 'assistant',
        data: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving real-time catalog recommendations. Please check your query or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'I need a laptop for coding under ₹70,000',
    'Wireless noise cancelling headphones under ₹3,000',
    'Mechanical keyboard for fast typing',
    'Fast charging USB-C hub adapter',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="prem-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-subtle border border-accent-border text-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-txt-primary">AI Shopping Copilot</h1>
              <Badge variant="emerald" size="sm">Grounded Hardware Intelligence</Badge>
            </div>
            <p className="text-[11px] text-txt-muted mt-0.5">
              Verified technical specifications • Unbiased trade-offs • Zero hallucinations
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Chips */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((prompt, i) => (
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
              <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'AI Copilot'}</span>
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

            {/* AI Grounded Structured Card Results */}
            {msg.data && (
              <div className="w-full space-y-3 pt-1">
                {msg.data.aiExplanation && (
                  <div className="p-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-txt-secondary leading-relaxed">
                    <span className="font-semibold text-accent">Analysis: </span>
                    {msg.data.aiExplanation}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {msg.data.recommendations?.map((rec) => (
                    <div
                      key={rec.productId}
                      className="prem-card-hover p-4 rounded-xl border border-border-subtle space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="emerald" size="sm">{rec.matchBadge || 'Best Match'}</Badge>
                          <div className="flex items-center gap-1 text-status-warning text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-status-warning text-status-warning" />
                            <span>{rec.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-xl bg-[#111820] border border-border-subtle p-1 flex items-center justify-center flex-shrink-0">
                            <img
                              src={rec.mainImageUrl}
                              alt={rec.productName}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              onClick={() => navigate(`/customer/product/${rec.productId}`)}
                              className="text-xs font-bold text-txt-primary hover:text-accent cursor-pointer line-clamp-2 leading-snug"
                            >
                              {rec.productName}
                            </h3>
                            <div className="text-sm font-bold text-txt-primary mt-1 font-sans">
                              ₹{rec.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Why Recommended */}
                        {rec.whyRecommended && rec.whyRecommended.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] font-semibold text-txt-muted uppercase">Specification Match:</div>
                            {rec.whyRecommended.map((point, pIdx) => (
                              <div key={pIdx} className="text-[11px] text-txt-secondary flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Trade-Off */}
                        {rec.tradeOff && (
                          <div className="p-2 bg-bg-primary rounded-lg border border-border-subtle text-[11px] text-txt-muted flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-status-warning flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-txt-secondary">Trade-Off: </span>
                              {rec.tradeOff}
                            </div>
                          </div>
                        )}

                        {/* Key Specs */}
                        {rec.keySpecs && rec.keySpecs.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {rec.keySpecs.map((spec, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-bg-primary text-txt-muted border border-border-subtle px-1.5 py-0.2 rounded font-mono"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CTAs */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle">
                        <button
                          onClick={() => addToCart(rec.productId, undefined, 1)}
                          className="prem-btn-primary py-2 text-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                        <button
                          onClick={() => navigate(`/customer/product/${rec.productId}`)}
                          className="prem-btn-secondary py-2 text-xs"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 p-3.5 bg-surface-card border border-border-subtle rounded-xl text-xs text-txt-muted w-fit">
            <Sparkles className="w-4 h-4 text-accent animate-spin" />
            <span>Analyzing technical specifications and availability signals...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
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
          placeholder="Ask for specifications comparison, budget matching, or hardware trade-offs..."
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
