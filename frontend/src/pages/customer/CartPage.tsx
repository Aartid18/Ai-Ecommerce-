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
  Tag,
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
        <div className="w-16 h-16 bg-white border border-black/[0.08] text-txt-muted rounded-full flex items-center justify-center mx-auto shadow-prem-sm">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-serif text-txt-primary">Your Cart is Currently Empty</h1>
        <p className="text-xs text-txt-muted max-w-sm mx-auto">
          Explore our product catalog with real-time stock assurance and price watches.
        </p>
        <Link
          to="/customer/products"
          className="prem-btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-2"
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
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-txt-primary">Shopping Cart</h1>
          <p className="text-xs text-txt-muted mt-0.5">{cart.items.length} items in your order</p>
        </div>
        <Link
          to="/customer/products"
          className="text-xs font-semibold text-txt-secondary hover:text-brand-crimson flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {/* Cart Intelligence & Free Shipping Progress Bar */}
      <div className="prem-card p-5 space-y-3 bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-txt-secondary flex items-center gap-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-crimson" />
            {cart.amountForFreeDelivery > 0 ? (
              <>
                Add <strong className="text-brand-crimson">₹{cart.amountForFreeDelivery.toFixed(0)}</strong> more for FREE Express Delivery
              </>
            ) : (
              <span className="text-[#3A835C] font-semibold">Order qualifies for FREE Express Delivery</span>
            )}
          </span>
          <span className="text-txt-muted text-xs font-bold">{progressPct}%</span>
        </div>
        <div className="w-full bg-[#E9E3D8] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-brand-crimson h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {cart.cartInsights && cart.cartInsights.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-2">
            {cart.cartInsights.map((insight, idx) => (
              <div
                key={idx}
                className="text-[11px] text-txt-secondary bg-[#F7F4EE] border border-black/[0.04] px-3 py-1 rounded-full font-medium"
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
          <div className="prem-card overflow-hidden divide-y divide-black/[0.06] bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="p-5 flex items-center gap-4 hover:bg-[#FAF8F4] transition-colors">
                <div
                  className="w-18 h-18 rounded-2xl bg-[#F7F4EE] border border-black/[0.04] p-1.5 flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/customer/product/${item.productId}`)}
                >
                  <img
                    src={item.mainImageUrl}
                    alt={item.productName}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => navigate(`/customer/product/${item.productId}`)}
                    className="text-xs sm:text-sm font-bold text-txt-primary hover:text-brand-crimson cursor-pointer transition-colors truncate"
                  >
                    {item.productName}
                  </h3>
                  {item.variantAttributes && (
                    <div className="text-xs text-txt-muted mt-0.5">{item.variantAttributes}</div>
                  )}
                  <div className="text-[11px] font-mono text-txt-muted mt-0.5">SKU: {item.productSku}</div>
                  <div className="text-xs sm:text-sm font-bold text-txt-primary mt-1 font-sans">
                    ₹{item.unitPrice.toLocaleString()}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 bg-[#F4F0E8] border border-black/[0.06] rounded-full p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-txt-muted hover:text-txt-primary rounded-full hover:bg-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-txt-primary w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                    className="p-1 text-txt-muted hover:text-txt-primary rounded-full hover:bg-white disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="text-xs sm:text-sm font-bold text-txt-primary font-sans">
                    ₹{item.totalPrice.toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-txt-muted hover:text-brand-crimson mt-1 transition-colors flex items-center gap-1 ml-auto font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Box (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="prem-card p-6 space-y-4 bg-white border border-black/[0.08] rounded-3xl shadow-prem-sm sticky top-24">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider pb-3 border-b border-black/[0.06]">
              Order Cost Summary
            </h2>

            {/* Coupon Code Entry */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-txt-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon Code"
                  className="prem-input w-full pl-9 text-xs font-mono uppercase py-2 bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={applying || !couponInput.trim()}
                className="prem-btn-secondary text-xs py-2 px-4"
              >
                {applying ? '...' : 'Apply'}
              </button>
            </form>

            {cart.appliedCouponCode && (
              <div className="flex items-center justify-between text-xs bg-brand-crimson/10 border border-brand-crimson/20 text-brand-crimson px-3 py-1.5 rounded-full font-medium">
                <span>Applied: <strong>{cart.appliedCouponCode}</strong></span>
                <span>-₹{cart.discountAmount.toLocaleString()}</span>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 text-xs text-txt-secondary pt-2">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-txt-primary font-bold">₹{cart.totalAmount.toLocaleString()}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-brand-crimson font-medium">
                  <span>Promotional Discount</span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Express Delivery</span>
                <span className="text-txt-primary font-bold">
                  {cart.amountForFreeDelivery <= 0 ? 'FREE' : '₹80'}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-txt-primary pt-3 border-t border-black/[0.06] font-sans">
                <span>Grand Total</span>
                <span className="text-brand-crimson font-black">
                  ₹{(cart.finalAmount + (cart.amountForFreeDelivery <= 0 ? 0 : 80)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/customer/checkout')}
              className="prem-btn-primary w-full py-3 text-xs font-bold"
            >
              Proceed to Checkout <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-txt-muted pt-2 border-t border-black/[0.06]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3A835C]" />
              <span>Real-time warehouse reservation guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
