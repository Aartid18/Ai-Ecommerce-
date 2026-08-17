import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityEvent } from '../../types';
import { Radio, AlertCircle, ShoppingBag, Box, RotateCcw, ShieldAlert, ArrowRight, X } from 'lucide-react';

export const ActivityFeedBanner: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events/activity-stream');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.addEventListener('INIT', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('ACTIVITY_EVENT', (e: MessageEvent) => {
        try {
          const parsed: ActivityEvent = JSON.parse(e.data);
          setEvents((prev) => [parsed, ...prev.slice(0, 19)]);
          setCurrentEvent(parsed);
        } catch (err) {
          console.error('Error parsing SSE event', err);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('SSE connection failed', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'ORDER':
        return { icon: ShoppingBag, color: 'text-accent', bg: 'bg-accent-subtle border-accent-border' };
      case 'STOCK':
      case 'INVENTORY':
        return { icon: Box, color: 'text-status-warning', bg: 'bg-status-warning-subtle border-status-warning/20' };
      case 'RISK':
        return { icon: ShieldAlert, color: 'text-status-danger', bg: 'bg-status-danger-subtle border-status-danger/20' };
      case 'RETURN':
        return { icon: RotateCcw, color: 'text-indigo-accent', bg: 'bg-indigo-subtle border-indigo-accent/20' };
      default:
        return { icon: AlertCircle, color: 'text-status-info', bg: 'bg-status-info-subtle border-status-info/20' };
    }
  };

  return (
    <>
      {/* Real-Time Operations Bar */}
      <div className="bg-[#171717] border-b border-black/[0.15] text-xs px-4 py-2 flex items-center justify-between text-[#F4F0E8] z-40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-brand-crimson' : 'bg-brand-gold'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-brand-crimson' : 'bg-brand-gold'
                }`}
              />
            </span>
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest hidden sm:inline">
              REAL-TIME COMMERCE
            </span>
          </div>

          <div className="h-3 w-px bg-white/20 flex-shrink-0 hidden sm:block" />

          {currentEvent ? (
            <div
              onClick={() => {
                if (currentEvent.linkUrl) navigate(currentEvent.linkUrl);
              }}
              className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer transition-colors truncate"
            >
              {(() => {
                const badge = getEventBadge(currentEvent.type);
                const Icon = badge.icon;
                return (
                  <span className={`p-0.5 rounded ${badge.bg} ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                  </span>
                );
              })()}
              <span className="truncate text-[11px] text-white font-medium">{currentEvent.message}</span>
              <span className="text-[10px] text-white/60 flex-shrink-0">Just now</span>
            </div>
          ) : (
            <div className="text-white/70 text-[11px] truncate font-sans">
              Live telemetry stream active — synchronizing orders, inventory, and demand signals
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-white/80 hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            {events.length > 0 ? `${events.length} Live Events` : 'Live Stream'}
          </button>
        </div>
      </div>

      {/* Expanded Operations Drawer */}
      {expanded && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setExpanded(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-md bg-bg-secondary border-l border-border-primary shadow-2xl p-5 flex flex-col h-full z-10 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-txt-primary">Live Operations Event Stream</h3>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 text-txt-muted hover:text-txt-primary rounded-lg hover:bg-surface-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {events.length === 0 ? (
                <div className="text-center py-16 text-txt-muted text-xs">
                  Awaiting operational events (orders, inventory changes, price updates)...
                </div>
              ) : (
                events.map((ev, i) => {
                  const badge = getEventBadge(ev.type);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (ev.linkUrl) {
                          setExpanded(false);
                          navigate(ev.linkUrl);
                        }
                      }}
                      className="prem-card p-3 rounded-xl border border-border-subtle hover:border-border-hover cursor-pointer transition-all flex items-start gap-3"
                    >
                      <div className={`p-1.5 rounded-lg border ${badge.bg} ${badge.color} mt-0.5`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="text-txt-primary font-medium leading-snug">{ev.message}</div>
                        <div className="text-[10px] text-txt-muted mt-1">{ev.timestamp?.substring(11, 19) || 'Just now'}</div>
                      </div>
                      {ev.linkUrl && <ArrowRight className="w-3.5 h-3.5 text-txt-muted mt-1 flex-shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
