import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CustomerAiResponse } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
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
  const { addItem } = useCart();
  const { showToast } = useToast();
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
    'I need a laptop for coding under ₹1,80,000',
    'Wireless noise cancelling headphones',
    'Mechanical keyboard for fast typing',
    'Fast charging USB-C hub adapter',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="prem-card p-6 flex items-center justify-between bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-crimson/10 text-brand-crimson flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif text-txt-primary">AI Shopping Copilot</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3A835C]/15 text-[#3A835C] text-[10px] font-bold">
                Grounded Specs Engine
              </span>
            </div>
            <p className="text-xs text-txt-muted mt-0.5">
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
            className="text-xs px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FDFBF7] border border-black/[0.08] text-txt-secondary hover:text-txt-primary transition-all font-medium shadow-sm hover:-translate-y-0.5"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="prem-card p-6 space-y-5 min-h-[420px] max-h-[600px] overflow-y-auto bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-txt-muted px-1">
              <span className="font-bold">{msg.sender === 'user' ? 'You' : 'AI Copilot'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {msg.text && (
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-crimson text-white font-medium rounded-tr-none shadow-sm'
                    : 'bg-[#F7F4EE] border border-black/[0.04] text-txt-primary rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* AI Grounded Structured Card Results */}
            {msg.data && (
              <div className="w-full space-y-4 pt-1">
                {msg.data.aiExplanation && (
                  <div className="p-4 bg-[#F7F4EE] border border-black/[0.04] rounded-2xl text-xs text-txt-secondary leading-relaxed">
                    <span className="font-bold text-brand-crimson">Analysis: </span>
                    {msg.data.aiExplanation}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {msg.data.recommendations?.map((rec) => (
                    <div
                      key={rec.productId}
                      className="p-5 rounded-2xl border border-black/[0.08] bg-[#FAF8F4] space-y-3.5 flex flex-col justify-between shadow-prem-sm hover:shadow-prem-md transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-crimson text-white text-[10px] font-bold shadow-sm">
                            {rec.matchBadge || 'Best Match'}
                          </span>
                          <div className="flex items-center gap-1 text-brand-gold text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{rec.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-3.5">
                          <div className="w-16 h-16 rounded-xl bg-white border border-black/[0.06] p-1 flex items-center justify-center flex-shrink-0">
                            <img
                              src={rec.mainImageUrl}
                              alt={rec.productName}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              onClick={() => navigate(`/customer/product/${rec.productId}`)}
                              className="text-xs font-bold text-txt-primary hover:text-brand-crimson cursor-pointer line-clamp-2 leading-snug"
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
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[10px] font-bold text-txt-muted uppercase tracking-wider">Specification Match:</div>
                            {rec.whyRecommended.map((point, pIdx) => (
                              <div key={pIdx} className="text-[11px] text-txt-secondary flex items-start gap-1.5 leading-snug">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#3A835C] flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Trade-Off */}
                        {rec.tradeOff && (
                          <div className="p-2.5 bg-white rounded-xl border border-black/[0.06] text-[11px] text-txt-muted flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-txt-secondary">Trade-Off: </span>
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
                                className="text-[10px] bg-white text-txt-secondary border border-black/[0.08] px-2 py-0.5 rounded-full font-mono font-medium"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CTAs */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/[0.06]">
                        <button
                          onClick={() => {
                            addItem(rec.productId, 1);
                            showToast(`Added ${rec.productName} to cart!`, 'success', 'Cart Updated');
                          }}
                          className="prem-btn-primary py-2.5 text-xs font-bold"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                        <button
                          onClick={() => navigate(`/customer/product/${rec.productId}`)}
                          className="prem-btn-secondary py-2.5 text-xs font-semibold"
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
          <div className="flex items-center gap-2.5 p-4 bg-[#F7F4EE] border border-black/[0.04] rounded-2xl text-xs text-txt-muted w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-crimson animate-spin" />
            <span>Analyzing technical specifications and live inventory...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask for specifications comparison, budget matching, or hardware trade-offs..."
          className="prem-input w-full py-4 pl-5 pr-14 text-xs sm:text-sm bg-white shadow-sm"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="prem-btn-primary absolute right-2 p-2.5 rounded-full"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
