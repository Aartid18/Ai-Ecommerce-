import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Radio,
  Package,
  Boxes,
  Clock,
  ShieldAlert,
  RotateCcw,
  Tag,
  ArrowRight,
  Command,
  LayoutDashboard,
  Layers,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Demand & AI' | 'Operations';
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    // Navigation
    { id: 'cat', title: 'Product Catalog & Store', category: 'Navigation', icon: Package, path: '/customer/products' },
    { id: 'radar', title: 'Demand Radar & Signals', category: 'Demand & AI', icon: Radio, path: '/admin/demand-radar', badge: 'Live Radar' },
    { id: 'ai-cust', title: 'Customer AI Shopping Copilot', category: 'Demand & AI', icon: Sparkles, path: '/customer/ai-assistant', badge: 'AI' },
    { id: 'ai-sell', title: 'Seller Operations AI Copilot', category: 'Demand & AI', icon: Sparkles, path: '/admin/ai-copilot', badge: 'AI' },
    { id: 'admin-dash', title: 'Executive Operations Dashboard', category: 'Operations', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'inv', title: 'Inventory Health & Dead Stock', category: 'Operations', icon: Boxes, path: '/admin/inventory' },
    { id: 'preorders', title: 'Smart Pre-Orders Queue', category: 'Operations', icon: Clock, path: '/admin/preorders' },
    { id: 'orders-risk', title: 'Order Fraud & Risk Management', category: 'Operations', icon: ShieldAlert, path: '/admin/orders' },
    { id: 'returns', title: 'Returns & Refund Operations', category: 'Operations', icon: RotateCcw, path: '/admin/returns' },
    { id: 'coupons', title: 'Promotional Coupons & Audit Logs', category: 'Operations', icon: Tag, path: '/admin/audit-logs' },
    { id: 'my-orders', title: 'My Customer Orders & Watches', category: 'Navigation', icon: Layers, path: '/customer/dashboard' },
    { id: 'cart', title: 'View Shopping Cart', category: 'Navigation', icon: Package, path: '/customer/cart' },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden text-txt-primary flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-surface-navbar">
          <Search className="w-4 h-4 text-txt-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page, or search query..."
            className="w-full bg-transparent text-sm text-txt-primary placeholder-txt-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-txt-muted bg-surface-card border border-border-subtle rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-txt-muted">
              No matching commands or destinations found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-surface-card-hover text-txt-primary border border-border-hover'
                      : 'text-txt-secondary hover:bg-surface-card/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-accent/15 text-accent' : 'bg-surface-card text-txt-muted'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-medium text-txt-primary">{item.title}</span>
                      <span className="text-[11px] text-txt-muted ml-2">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent-border font-medium">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-accent" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-bg-primary border-t border-border-subtle flex items-center justify-between text-[11px] text-txt-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-card border border-border-subtle rounded text-[10px]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-surface-card border border-border-subtle rounded text-[10px]">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-card border border-border-subtle rounded text-[10px]">↵</kbd>{' '}
              Select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3 text-txt-muted" />
            <span>AI Commerce Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
