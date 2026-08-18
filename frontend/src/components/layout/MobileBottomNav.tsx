import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  ShoppingBag,
  Heart,
  User,
  Sparkles,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isCatalog = location.pathname === '/customer/products' || location.pathname === '/';
  const isCopilot = location.pathname === '/customer/ai-assistant';
  const isDashboard = location.pathname.startsWith('/customer/dashboard');

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Catalog */}
        <Link
          to="/customer/products"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors ${
            isCatalog ? 'text-brand-crimson font-bold' : 'text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Discover</span>
        </Link>

        {/* AI Copilot */}
        <Link
          to="/customer/ai-assistant"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors ${
            isCopilot ? 'text-brand-crimson font-bold' : 'text-txt-muted hover:text-txt-primary'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Copilot</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/customer/dashboard"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-txt-muted hover:text-txt-primary relative"
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-brand-crimson text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px]">Wishlist</span>
        </Link>

        {/* Cart Trigger */}
        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-txt-muted hover:text-txt-primary relative"
        >
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-brand-crimson text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {itemCount}
            </span>
          )}
          <span className="text-[10px]">Bag</span>
        </button>

        {/* Profile */}
        <Link
          to={isAuthenticated ? '/customer/dashboard' : '/login'}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors ${
            isDashboard ? 'text-brand-crimson font-bold' : 'text-txt-muted hover:text-txt-primary'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{isAuthenticated ? 'Account' : 'Sign In'}</span>
        </Link>
      </div>
    </div>
  );
};
