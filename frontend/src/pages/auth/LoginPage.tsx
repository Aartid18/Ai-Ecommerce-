import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, Lock, Mail, Layers } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoPersona } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate('/customer/products');
    } catch (err) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (u: string, p: string, redirect: string) => {
    setLoading(true);
    try {
      await switchDemoPersona(u, p);
      navigate(redirect);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Welcome to AI Commerce</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise E-Commerce & Demand Intelligence Platform</p>
        </div>

        {/* 1-Click Demo Personas Banner */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Layers className="w-4 h-4" /> 1-Click Interactive Demo Personas
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Select any role to test specialized workflows and permissions:</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickPersona('admin', 'admin123', '/admin/dashboard')}
              className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">👑 Admin</div>
              <div className="text-[10px] text-slate-400">Full operations & pricing</div>
            </button>
            <button
              onClick={() => handleQuickPersona('inventory_mgr', 'manager123', '/admin/inventory')}
              className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">📦 Inventory Lead</div>
              <div className="text-[10px] text-slate-400">Stockouts & dead stock</div>
            </button>
            <button
              onClick={() => handleQuickPersona('order_mgr', 'manager123', '/admin/orders')}
              className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">🛡️ Order & Risk</div>
              <div className="text-[10px] text-slate-400">Review flagged orders</div>
            </button>
            <button
              onClick={() => handleQuickPersona('customer1', 'customer123', '/customer/products')}
              className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">🛍️ Customer (Alex)</div>
              <div className="text-[10px] text-slate-400">Storefront & AI shopping</div>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username or Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or alex.johnson@example.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In with JWT'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
