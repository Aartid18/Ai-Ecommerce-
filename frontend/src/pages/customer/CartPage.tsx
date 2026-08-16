import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Truck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, applyCoupon, loading } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err) {
    } finally {
      setApplying(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Your Cart is Currently Empty</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Explore our intelligent product catalog with real-time stock assurance and price watches.
        </p>
        <Link
          to="/customer/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  const freeDeliveryThreshold = 999;
  const currentFinal = cart.finalAmount;
  const progressPct = Math.min(100, Math.round((currentFinal / freeDeliveryThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-0.5">{cart.items.length} items in your order</p>
        </div>
        <Link
          to="/customer/products"
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {/* Cart Intelligence & Free Shipping Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-gradient-to-r from-slate-900 to-emerald-950/20">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {cart.amountForFreeDelivery > 0 ? (
              <>
                Add <strong className="text-emerald-400">₹{cart.amountForFreeDelivery.toFixed(0)}</strong> more to unlock FREE Express Delivery!
              </>
            ) : (
              <span className="text-emerald-400">🎉 Congratulations! Your order qualifies for FREE Express Delivery.</span>
            )}
          </span>
          <span className="text-slate-400">{progressPct}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {cart.cartInsights && cart.cartInsights.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-2">
            {cart.cartInsights.map((insight, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-lg"
              >
                {insight}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Items Table + Cost Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
            {cart.items.map((item) => (
              <div key={item.id} className="p-5 flex items-center gap-4 hover:bg-slate-850/40 transition-colors">
                <img
                  src={item.mainImageUrl}
                  alt={item.productName}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/customer/product/${item.productId}`)}
                />

                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/customer/product/${item.productId}`)}
                    className="text-sm font-bold text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors truncate"
                  >
                    {item.productName}
                  </h3>
                  {item.variantAttributes && (
                    <div className="text-xs text-slate-400 mt-0.5">{item.variantAttributes}</div>
                  )}
                  <div className="text-xs font-mono text-slate-500 mt-0.5">SKU: {item.productSku}</div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-1.5">
                    ₹{item.unitPrice.toLocaleString()}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl p-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-200 w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                    className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="text-sm font-extrabold text-slate-100">
                    ₹{item.totalPrice.toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-slate-500 hover:text-rose-400 mt-1 transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Box (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Promo / Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
                />
                <button
                  type="submit"
                  disabled={applying || !couponInput.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Apply
                </button>
              </div>

              {cart.appliedCouponCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg">
                  <span>Coupon: <strong>{cart.appliedCouponCode}</strong></span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </form>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-200 font-medium">₹{cart.totalAmount.toLocaleString()}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promotional Discount</span>
                  <span className="font-semibold">-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-slate-200 font-medium">
                  {cart.amountForFreeDelivery <= 0 ? 'FREE' : '₹80'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <span className="text-slate-200 font-medium">
                  ₹{Math.round(cart.totalAmount * 0.05).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-100 pt-3 border-t border-slate-800">
                <span>Final Amount</span>
                <span className="text-emerald-400">
                  ₹{(
                    cart.finalAmount +
                    (cart.amountForFreeDelivery <= 0 ? 0 : 80) +
                    Math.round(cart.totalAmount * 0.05)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/customer/checkout')}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all group"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe 256-Bit SSL Checkout Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
