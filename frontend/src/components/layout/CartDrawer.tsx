import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeItem, applyCoupon } = useCart();
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-bg-secondary border-l border-border-primary shadow-2xl flex flex-col text-txt-primary animate-slide-in">
          {/* Header */}
          <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-navbar">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent-subtle text-accent rounded-lg border border-accent-border">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider">Shopping Cart</h2>
                <p className="text-[10px] text-txt-muted">
                  {cart?.items?.length ? `${cart.items.length} items in cart` : 'Cart is empty'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-txt-muted hover:text-txt-primary rounded-lg hover:bg-surface-card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="px-4 py-3 bg-surface-card border-b border-border-subtle">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-txt-secondary text-[11px] font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  {cart.amountForFreeDelivery > 0 ? (
                    <>
                      Add <span className="font-bold text-accent">₹{cart.amountForFreeDelivery.toFixed(0)}</span> for FREE Express Delivery
                    </>
                  ) : (
                    <span className="font-bold text-accent">FREE Express Delivery unlocked</span>
                  )}
                </span>
                <span className="text-txt-muted text-[10px] font-mono">{progressPct}%</span>
              </div>
              <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!cart || !cart.items || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-txt-muted">
                <ShoppingBag className="w-10 h-10 text-txt-disabled mb-2" />
                <h3 className="text-xs font-semibold text-txt-primary mb-1">Your cart is empty</h3>
                <p className="text-[11px] text-txt-muted mb-4 max-w-xs">
                  Explore our verified catalog to start adding items.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/customer/products');
                  }}
                  className="prem-btn-primary text-xs"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="prem-card p-3 rounded-xl border border-border-subtle flex gap-3 items-center"
                >
                  <div className="w-14 h-14 rounded-lg bg-[#111820] border border-border-subtle p-0.5 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.mainImageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200'}
                      alt={item.productName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-txt-primary truncate">
                      {item.productName}
                    </h4>
                    {item.variantAttributes && (
                      <span className="text-[10px] text-txt-muted block truncate">{item.variantAttributes}</span>
                    )}
                    <div className="text-xs font-bold text-txt-primary mt-0.5 font-sans">
                      ₹{item.unitPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-1 bg-bg-primary border border-border-subtle rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-txt-muted hover:text-txt-primary rounded hover:bg-surface-card"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold text-txt-primary w-4 text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      className="p-1 text-txt-muted hover:text-txt-primary rounded hover:bg-surface-card disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-txt-muted hover:text-status-danger transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="p-4 border-t border-border-subtle bg-surface-navbar space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon (e.g. WELCOME10)"
                    className="prem-input w-full pl-8 text-xs font-mono uppercase py-1.5"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplying || !couponInput.trim()}
                  className="prem-btn-secondary text-xs py-1.5 px-3"
                >
                  Apply
                </button>
              </form>

              {cart.appliedCouponCode && (
                <div className="flex items-center justify-between text-[11px] bg-accent-subtle border border-accent-border text-accent px-2.5 py-1 rounded-lg">
                  <span>Coupon: <strong>{cart.appliedCouponCode}</strong></span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Cost Summary */}
              <div className="space-y-1 text-xs text-txt-secondary">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-txt-primary font-medium">₹{cart.totalAmount.toLocaleString()}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount</span>
                    <span>-₹{cart.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-txt-primary font-medium">
                    {cart.amountForFreeDelivery <= 0 ? 'FREE' : '₹80'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-txt-primary pt-2 border-t border-border-subtle font-sans">
                  <span>Total</span>
                  <span className="text-accent">
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
                className="prem-btn-primary w-full py-2.5 text-xs"
              >
                Proceed to Checkout
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-txt-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Verified non-manipulative pricing assurance</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
