import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShoppingBag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [customerName, setCustomerName] = useState(user?.fullName || 'Alex Johnson');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'alex.johnson@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [shippingAddress, setShippingAddress] = useState('42 Tech Park Avenue, Koramangala, Bengaluru, Karnataka - 560034');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_CARD'>('ONLINE_CARD');

  // Risk Simulation parameters (for demo testing)
  const [failedPaymentAttempts, setFailedPaymentAttempts] = useState<number>(0);
  const [simulateRisk, setSimulateRisk] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!cart || !cart.items || cart.items.length === 0) {
    if (!confirmedOrder) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-txt-disabled mx-auto" />
          <h2 className="text-base font-bold text-txt-primary">No Items to Checkout</h2>
          <Link to="/customer/products" className="text-accent text-xs hover:underline">
            Browse Products
          </Link>
        </div>
      );
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        phone: phone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        failedPaymentAttempts: simulateRisk ? (failedPaymentAttempts || 4) : 0,
      };

      const res = await api.post('/orders/checkout', payload);
      setConfirmedOrder(res.data);
      showToast('Order placed successfully!', 'success');
      await refreshCart();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete checkout';
      showToast(msg, 'error', 'Checkout Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-subtle border border-accent-border text-accent flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt-primary tracking-tight">
            Order Placed Successfully
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Order Reference: <span className="font-mono text-accent font-semibold">{confirmedOrder.orderNumber}</span>
          </p>
        </div>

        <div className="prem-card p-5 text-left space-y-3.5">
          <div className="flex justify-between items-center pb-3 border-b border-border-subtle text-xs">
            <span className="text-txt-muted">Total Amount</span>
            <span className="text-sm font-bold text-txt-primary font-sans">
              ₹{confirmedOrder.finalAmount.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-txt-secondary">
            <div>
              <span className="font-medium text-txt-muted">Recipient:</span>
              <div className="text-txt-primary mt-0.5">{confirmedOrder.customerName}</div>
              <div className="text-txt-muted">{confirmedOrder.phone}</div>
            </div>
            <div>
              <span className="font-medium text-txt-muted">Payment:</span>
              <div className="text-txt-primary capitalize mt-0.5">{confirmedOrder.paymentStatus} ({confirmedOrder.paymentMethod})</div>
            </div>
          </div>

          {confirmedOrder.riskLevel === 'HIGH' || confirmedOrder.riskLevel === 'CRITICAL' ? (
            <div className="p-3 bg-status-warning-subtle border border-status-warning/30 rounded-xl text-xs text-status-warning flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
              <div>
                <strong>Security Notice:</strong> This order has been flagged for standard verification by our operations team before shipping.
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="prem-btn-primary text-xs"
          >
            Track in My Orders
          </button>
          <button
            onClick={() => navigate('/customer/products')}
            className="prem-btn-secondary text-xs"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = cart ? cart.finalAmount + (cart.amountForFreeDelivery <= 0 ? 0 : 80) + Math.round(cart.totalAmount * 0.05) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-border-subtle">
        <h1 className="text-xl font-bold text-txt-primary">Checkout & Order Placement</h1>
        <p className="text-xs text-txt-muted mt-0.5">Complete your purchase details</p>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping & Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Shipping Address */}
          <div className="prem-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Truck className="w-3.5 h-3.5 text-accent" />
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="prem-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="prem-input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="prem-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-txt-muted uppercase tracking-wider mb-1">Delivery Address</label>
              <textarea
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="prem-input w-full leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="prem-card p-5 space-y-4">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border-subtle">
              <CreditCard className="w-3.5 h-3.5 text-accent" />
              Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('ONLINE_CARD')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE_CARD'
                    ? 'bg-accent-subtle border-accent-border text-txt-primary'
                    : 'bg-surface-card border-border-subtle text-txt-muted hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <span className="text-[10px] bg-accent-subtle text-accent px-1.5 py-0.2 rounded font-medium">Fast</span>
                </div>
                <div className="font-semibold text-xs text-txt-primary">Online Card / UPI</div>
                <div className="text-[10px] text-txt-muted mt-0.5">Instant gateway simulation</div>
              </div>

              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-accent-subtle border-accent-border text-txt-primary'
                    : 'bg-surface-card border-border-subtle text-txt-muted hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-4 h-4 text-txt-muted" />
                </div>
                <div className="font-semibold text-xs text-txt-primary">Cash on Delivery</div>
                <div className="text-[10px] text-txt-muted mt-0.5">Pay upon delivery</div>
              </div>
            </div>
          </div>

          {/* Risk Engine Testing Trigger */}
          <div className="prem-card p-4 border border-status-warning/20 bg-status-warning-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-status-warning flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                Demo: Order Risk Engine Trigger
              </span>
              <input
                type="checkbox"
                checked={simulateRisk}
                onChange={(e) => setSimulateRisk(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-accent focus:ring-accent bg-bg-primary border-border-subtle cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-txt-muted">
              Enable this toggle to simulate prior failed payment attempts to trigger the backend Order Risk scoring queue.
            </p>
            {simulateRisk && (
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs text-txt-secondary">Simulate Failed Payment Attempts:</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={failedPaymentAttempts || 4}
                  onChange={(e) => setFailedPaymentAttempts(Number(e.target.value))}
                  className="prem-input w-16 text-xs text-status-warning font-bold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="prem-card p-5 space-y-4 sticky top-24">
            <h2 className="text-xs font-bold text-txt-primary uppercase tracking-wider pb-3 border-b border-border-subtle">
              Order Items ({cart?.items.length})
            </h2>

            <div className="max-h-56 overflow-y-auto divide-y divide-border-subtle space-y-2 pr-1">
              {cart?.items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#111820] border border-border-subtle p-0.5 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.mainImageUrl}
                      alt={item.productName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-txt-primary truncate">{item.productName}</div>
                    <div className="text-[11px] text-txt-muted">Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString()}</div>
                  </div>
                  <div className="font-semibold text-txt-primary font-sans">₹{item.totalPrice.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-txt-secondary pt-3 border-t border-border-subtle">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-txt-primary">₹{cart?.totalAmount.toLocaleString()}</span>
              </div>
              {cart && cart.discountAmount > 0 && (
                <div className="flex justify-between text-accent font-medium">
                  <span>Discount ({cart.appliedCouponCode})</span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery</span>
                <span className="text-txt-primary">{(cart?.amountForFreeDelivery ?? 0) <= 0 ? 'FREE' : '₹80'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span className="text-txt-primary">₹{Math.round((cart?.totalAmount || 0) * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-txt-primary pt-3 border-t border-border-subtle font-sans">
                <span>Total Due</span>
                <span className="text-accent">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="prem-btn-primary w-full py-3 text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              {submitting ? 'Processing Order...' : `Place Order (₹${totalAmount.toLocaleString()})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
