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

      eventSource.addEventListener('INIT', (e: MessageEvent) => {
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
        return { icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'STOCK':
        return { icon: Box, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'RISK':
        return { icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
      case 'RETURN':
        return { icon: RotateCcw, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      default:
        return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    }
  };

  return (
    <>
      {/* Mini Ticker Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs px-4 py-2 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Real-Time Operations
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 flex-shrink-0 hidden sm:block" />

          {currentEvent ? (
            <div
              onClick={() => {
                if (currentEvent.linkUrl) navigate(currentEvent.linkUrl);
              }}
              className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors truncate"
            >
              {(() => {
                const badge = getEventBadge(currentEvent.type);
                const Icon = badge.icon;
                return (
                  <span className={`p-0.5 rounded border ${badge.bg} ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                  </span>
                );
              })()}
              <span className="truncate">{currentEvent.message}</span>
              <span className="text-[10px] text-slate-500 flex-shrink-0">Just now</span>
            </div>
          ) : (
            <div className="text-slate-400 truncate">
              Live event stream active — watching demand, stock movements, and orders...
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline flex items-center gap-1"
          >
            {events.length > 0 ? `${events.length} Live Alerts` : 'Live Stream'}
          </button>
        </div>
      </div>

      {/* Expanded Operations Drawer */}
      {expanded && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setExpanded(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col h-full z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-slate-100">Live Operations Feed</h3>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
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
                      className="glass-card p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex items-start gap-3"
                    >
                      <div className={`p-2 rounded-lg border ${badge.bg} ${badge.color} mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="text-slate-200 leading-snug">{ev.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{ev.timestamp?.substring(11, 19) || 'Just now'}</div>
                      </div>
                      {ev.linkUrl && <ArrowRight className="w-3.5 h-3.5 text-slate-500 mt-1" />}
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
