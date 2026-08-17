import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, applyCoupon } = useCart();
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
        <div className="w-14 h-14 bg-surface-card border border-border-subtle text-txt-disabled rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-txt-primary">Your Cart is Currently Empty</h1>
        <p className="text-xs text-txt-muted max-w-sm mx-auto">
          Explore our product catalog with real-time stock assurance and price watches.
        </p>
        <Link
          to="/customer/products"
          className="prem-btn-primary text-xs py-2 px-4"
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
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold text-txt-primary">Shopping Cart</h1>
          <p className="text-xs text-txt-muted mt-0.5">{cart.items.length} items in your order</p>
        </div>
        <Link
          to="/customer/products"
          className="text-xs text-txt-muted hover:text-accent flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {/* Cart Intelligence & Free Shipping Progress Bar */}
      <div className="prem-card p-4 space-y-2.5 bg-surface-card">
        <div className="flex items-center justify-between text-xs">
          <span className="text-txt-secondary flex items-center gap-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            {cart.amountForFreeDelivery > 0 ? (
              <>
                Add <strong className="text-accent">₹{cart.amountForFreeDelivery.toFixed(0)}</strong> more for FREE Express Delivery
              </>
            ) : (
              <span className="text-accent">Order qualifies for FREE Express Delivery</span>
            )}
          </span>
          <span className="text-txt-muted text-[11px] font-mono">{progressPct}%</span>
        </div>
        <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {cart.cartInsights && cart.cartInsights.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-2">
            {cart.cartInsights.map((insight, idx) => (
              <div
                key={idx}
                className="text-[11px] text-txt-secondary bg-surface-card-hover border border-border-subtle px-2.5 py-0.5 rounded-lg"
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
        <div className="lg:col-span-8 space-y-3">
          <div className="prem-card overflow-hidden divide-y divide-border-subtle">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-surface-card-hover/40 transition-colors">
                <div
                  className="w-16 h-16 rounded-xl bg-[#111820] border border-border-subtle p-1 flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/customer/product/${item.productId}`)}
                >
                  <img
                    src={item.mainImageUrl}
                    alt={item.productName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/customer/product/${item.productId}`)}
                    className="text-xs font-bold text-txt-primary hover:text-accent cursor-pointer transition-colors truncate"
                  >
                    {item.productName}
                  </h3>
                  {item.variantAttributes && (
                    <div className="text-[11px] text-txt-muted mt-0.5">{item.variantAttributes}</div>
                  )}
                  <div className="text-[10px] font-mono text-txt-disabled mt-0.5">SKU: {item.productSku}</div>
                  <div className="text-xs font-bold text-txt-primary mt-1 font-sans">
                    ₹{item.unitPrice.toLocaleString()}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 bg-bg-primary border border-border-subtle rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-txt-muted hover:text-txt-primary rounded hover:bg-surface-card"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-semibold text-txt-primary w-5 text-center font-mono">
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

                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold text-txt-primary font-sans">
                    ₹{item.totalPrice.toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[11px] text-txt-muted hover:text-status-danger mt-1 transition-colors flex items-center gap-0.5 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Box (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="prem-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider pb-3 border-b border-border-subtle">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider">Promo / Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="prem-input flex-1 uppercase font-mono text-xs"
                />
                <button
                  type="submit"
                  disabled={applying || !couponInput.trim()}
                  className="prem-btn-secondary text-xs py-2 px-3"
                >
                  Apply
                </button>
              </div>

              {cart.appliedCouponCode && (
                <div className="flex items-center justify-between text-xs bg-accent-subtle border border-accent-border text-accent px-2.5 py-1 rounded-lg">
                  <span>Coupon: <strong>{cart.appliedCouponCode}</strong></span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </form>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-txt-secondary pt-2 border-t border-border-subtle">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-txt-primary font-medium">₹{cart.totalAmount.toLocaleString()}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Promotional Discount</span>
                  <span className="font-semibold">-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-txt-primary font-medium">
                  {cart.amountForFreeDelivery <= 0 ? 'FREE' : '₹80'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <span className="text-txt-primary font-medium">
                  ₹{Math.round(cart.totalAmount * 0.05).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-txt-primary pt-3 border-t border-border-subtle font-sans">
                <span>Final Amount</span>
                <span className="text-accent">
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
              className="prem-btn-primary w-full py-3 text-xs"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-txt-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Safe 256-Bit SSL Checkout Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
