import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeItem, applyCoupon, loading } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err) {
      // Handled in context
    } finally {
      setCouponApplying(false);
    }
  };

  const freeDeliveryTarget = 999;
  const currentTotal = cart?.finalAmount || 0;
  const progressPct = Math.min(100, Math.round((currentTotal / freeDeliveryTarget) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Shopping Cart</h2>
                <p className="text-xs text-slate-400">
                  {cart?.items?.length ? `${cart.items.length} unique items` : 'Your cart is empty'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Intelligence & Free Shipping Progress Bar */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {cart.amountForFreeDelivery > 0 ? (
                    <>
                      Add <span className="font-bold text-emerald-400">₹{cart.amountForFreeDelivery.toFixed(0)}</span> for FREE Express Delivery
                    </>
                  ) : (
                    <span className="font-bold text-emerald-400">🎉 FREE Express Delivery unlocked!</span>
                  )}
                </span>
                <span className="text-slate-400">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Cart Insights */}
              {cart.cartInsights && cart.cartInsights.length > 0 && (
                <div className="mt-2.5 space-y-1">
                  {cart.cartInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 bg-slate-900/60 border border-slate-700/50 px-2.5 py-1 rounded-md"
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!cart || !cart.items || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-300 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-xs">
                  Explore our curated products and intelligent deals to start filling your cart.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/customer/products');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg transition-all"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-3.5 rounded-xl border border-slate-800 flex gap-3.5 items-center group"
                >
                  <img
                    src={item.mainImageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200'}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-800 border border-slate-700/50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate leading-snug">
                      {item.productName}
                    </h4>
                    {item.variantAttributes && (
                      <span className="text-xs text-slate-400 block truncate">{item.variantAttributes}</span>
                    )}
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      ₹{item.unitPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-200 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    className="w-full bg-slate-850 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplying || !couponInput.trim()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  Apply
                </button>
              </form>

              {cart.appliedCouponCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg">
                  <span>Coupon Applied: <strong>{cart.appliedCouponCode}</strong></span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200">₹{cart.totalAmount.toLocaleString()}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{cart.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="text-slate-200">
                    {cart.amountForFreeDelivery <= 0 ? 'FREE' : '₹80'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-emerald-400">
                    ₹{(cart.finalAmount + (cart.amountForFreeDelivery <= 0 ? 0 : 80)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/customer/checkout');
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all group"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified non-manipulative pricing & inventory assurance</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
