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
  Cpu,
  Layers,
  Zap,
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
      text: "Hello! I am your AI Shopping Copilot. Unlike generic chatbots, my recommendations are directly grounded in our real-time technical specifications, price points, and actual warehouse stock. Ask me anything like: 'I need a coding laptop under ₹70,000' or 'Best noise-cancelling headphones for flights'.",
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
    'I need a coding laptop under ₹70,000',
    'Best wireless noise-cancelling headphones for work',
    'Mechanical keyboard for fast typing',
    'Multi-port fast charging USB-C hub',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/15">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-100">AI Shopping Copilot</h1>
              <Badge variant="emerald" size="sm">Grounded Database Reasoning</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero hallucinations • Real technical specs • Honest trade-offs
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all"
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
            {/* Sender bubble */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
              <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'AI Copilot'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {msg.text && (
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* AI Grounded Structured Card Results */}
            {msg.data && (
              <div className="w-full space-y-4 pt-1">
                {msg.data.aiExplanation && (
                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-200 leading-relaxed">
                    <span className="font-bold text-emerald-400">Analysis: </span>
                    {msg.data.aiExplanation}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {msg.data.recommendations?.map((rec) => (
                    <div
                      key={rec.productId}
                      className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="emerald" size="sm">{rec.matchBadge || 'Best Match'}</Badge>
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{rec.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <img
                            src={rec.mainImageUrl}
                            alt={rec.productName}
                            className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              onClick={() => navigate(`/customer/product/${rec.productId}`)}
                              className="text-xs font-bold text-slate-100 hover:text-emerald-400 cursor-pointer line-clamp-2 leading-snug"
                            >
                              {rec.productName}
                            </h3>
                            <div className="text-base font-extrabold text-emerald-400 mt-1">
                              ₹{rec.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Why Recommended */}
                        {rec.whyRecommended && rec.whyRecommended.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[11px] font-bold text-slate-300">Why It Fits Your Requirement:</div>
                            {rec.whyRecommended.map((point, pIdx) => (
                              <div key={pIdx} className="text-xs text-emerald-300/90 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Honest Trade-Off */}
                        {rec.tradeOff && (
                          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-slate-300">Trade-Off Consideration: </span>
                              {rec.tradeOff}
                            </div>
                          </div>
                        )}

                        {/* Key Specs Pills */}
                        {rec.keySpecs && rec.keySpecs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rec.keySpecs.map((spec, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Direct CTA Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => addToCart(rec.productId, undefined, 1)}
                          className="py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                        <button
                          onClick={() => navigate(`/customer/product/${rec.productId}`)}
                          className="py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 w-fit">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Analyzing real technical specifications and pricing bands...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
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
          placeholder="Ask for recommendations, specs comparison, budget matching..."
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
