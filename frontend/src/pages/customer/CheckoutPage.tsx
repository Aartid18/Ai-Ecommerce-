import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
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
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-100">No Items to Checkout</h2>
          <Link to="/customer/products" className="text-emerald-400 text-xs hover:underline">
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
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Order Confirmation: <span className="font-mono text-emerald-400 font-bold">{confirmedOrder.orderNumber}</span>
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400">Total Paid / Amount</span>
            <span className="text-base font-extrabold text-emerald-400">
              ₹{confirmedOrder.finalAmount.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Recipient:</span>
              <div>{confirmedOrder.customerName}</div>
              <div>{confirmedOrder.phone}</div>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Payment Status:</span>
              <div className="text-slate-200 capitalize font-medium">{confirmedOrder.paymentStatus} ({confirmedOrder.paymentMethod})</div>
            </div>
          </div>

          {confirmedOrder.riskLevel === 'HIGH' || confirmedOrder.riskLevel === 'CRITICAL' ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Security & Verification Notice:</strong> This order has been flagged for standard manual verification by our fulfillment team before shipping.
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Track in My Orders
          </button>
          <button
            onClick={() => navigate('/customer/products')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
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
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-100">Checkout & Order Placement</h1>
        <p className="text-xs text-slate-400 mt-0.5">Complete your secure purchase</p>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping & Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <Truck className="w-4 h-4 text-emerald-400" />
              Shipping Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Complete Delivery Address</label>
              <textarea
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('ONLINE_CARD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE_CARD'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Fast</span>
                </div>
                <div className="font-bold text-xs text-slate-200">Online Card / UPI</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Mock Gateway (Instant)</div>
              </div>

              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-slate-200">Cash on Delivery</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Pay upon delivery</div>
              </div>
            </div>
          </div>

          {/* Interactive Risk Engine Simulator (Demo Feature) */}
          <div className="glass-panel p-5 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Demo: Order Risk Engine Testing Trigger
              </span>
              <input
                type="checkbox"
                checked={simulateRisk}
                onChange={(e) => setSimulateRisk(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Enable this toggle to simulate multiple prior failed payment attempts to trigger the backend Order Risk scoring engine (flagging the order for Order Manager review).
            </p>
            {simulateRisk && (
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs text-slate-300">Simulate Failed Payment Attempts:</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={failedPaymentAttempts || 4}
                  onChange={(e) => setFailedPaymentAttempts(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-amber-500/50 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800">
              Order Items ({cart?.items.length})
            </h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 space-y-2 pr-1">
              {cart?.items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center gap-3 text-xs">
                  <img
                    src={item.mainImageUrl}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{item.productName}</div>
                    <div className="text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString()}</div>
                  </div>
                  <div className="font-bold text-slate-200">₹{item.totalPrice.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-200">₹{cart?.totalAmount.toLocaleString()}</span>
              </div>
              {cart && cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount ({cart.appliedCouponCode})</span>
                  <span>-₹{cart.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery</span>
                <span className="text-slate-200">{(cart?.amountForFreeDelivery ?? 0) <= 0 ? 'FREE' : '₹80'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span className="text-slate-200">₹{Math.round((cart?.totalAmount || 0) * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-100 pt-3 border-t border-slate-800">
                <span>Total Amount Due</span>
                <span className="text-emerald-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Processing Order...' : `Place Order (₹${totalAmount.toLocaleString()})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
