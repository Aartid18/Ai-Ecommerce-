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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] border-l border-black/[0.10] shadow-2xl flex flex-col text-txt-primary animate-slide-in">
          {/* Header */}
          <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-serif font-bold text-txt-primary">Your Shopping Cart</h2>
                <p className="text-[11px] text-txt-muted">
                  {cart?.items?.length ? `${cart.items.length} items selected` : 'Cart is empty'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-txt-muted hover:text-txt-primary rounded-full hover:bg-[#F4F0E8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          {cart && cart.items && cart.items.length > 0 && (
            <div className="px-5 py-3.5 bg-white border-b border-black/[0.06]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-txt-secondary text-[11px] font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-crimson" />
                  {cart.amountForFreeDelivery > 0 ? (
                    <>
                      Add <span className="font-bold text-brand-crimson">₹{cart.amountForFreeDelivery.toFixed(0)}</span> for FREE Express Delivery
                    </>
                  ) : (
                    <span className="font-bold text-[#3A835C]">FREE Express Delivery unlocked</span>
                  )}
                </span>
                <span className="text-txt-muted text-[10px] font-bold">{progressPct}%</span>
              </div>
              <div className="w-full bg-[#E9E3D8] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-crimson h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {!cart || !cart.items || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-txt-muted space-y-3">
                <div className="w-14 h-14 rounded-full bg-black/[0.04] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-txt-muted" />
                </div>
                <h3 className="text-sm font-serif text-txt-primary">Your cart is empty</h3>
                <p className="text-xs text-txt-muted max-w-xs leading-relaxed">
                  Explore our curated hardware catalog to add items to your cart.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/customer/products');
                  }}
                  className="prem-btn-primary text-xs py-2 px-5"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-prem-sm flex gap-3.5 items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#F7F4EE] border border-black/[0.04] p-1 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.mainImageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200'}
                      alt={item.productName}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-txt-primary truncate">
                      {item.productName}
                    </h4>
                    {item.variantAttributes && (
                      <span className="text-[10px] text-txt-muted block truncate">{item.variantAttributes}</span>
                    )}
                    <div className="text-xs font-bold text-txt-primary mt-1 font-sans">
                      ₹{item.unitPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-1 bg-[#F4F0E8] border border-black/[0.06] rounded-full px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-txt-muted hover:text-txt-primary rounded-full hover:bg-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-txt-primary w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      className="p-1 text-txt-muted hover:text-txt-primary rounded-full hover:bg-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-txt-muted hover:text-brand-crimson transition-colors"
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
            <div className="p-5 border-t border-black/[0.06] bg-white space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-txt-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon (e.g. WELCOME10)"
                    className="prem-input w-full pl-9 text-xs font-mono uppercase py-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplying || !couponInput.trim()}
                  className="prem-btn-secondary text-xs py-2 px-4"
                >
                  Apply
                </button>
              </form>

              {cart.appliedCouponCode && (
                <div className="flex items-center justify-between text-[11px] bg-brand-crimson/10 border border-brand-crimson/20 text-brand-crimson px-3 py-1.5 rounded-full font-medium">
                  <span>Coupon: <strong>{cart.appliedCouponCode}</strong></span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-txt-secondary pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-txt-primary font-bold">₹{cart.totalAmount.toLocaleString()}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-brand-crimson font-medium">
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
                <div className="flex justify-between text-base font-bold text-txt-primary pt-2 border-t border-black/[0.06] font-sans">
                  <span>Total</span>
                  <span className="text-brand-crimson font-black">
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
                className="prem-btn-primary w-full py-3 text-xs font-bold"
              >
                Proceed to Checkout
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-txt-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3A835C]" />
                <span>Verified non-manipulative pricing assurance</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
