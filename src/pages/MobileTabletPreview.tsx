// ─────────────────────────────────────────────────────────────
// Vortiq Mobile & Tablet UI Interactive Preview Surface
// Device frames (Phone vs Tablet), touch swipe cards, bottom sheet drawer, & split view
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { Home, CheckSquare, Package, MoreHorizontal, Search, PhoneCall, Flag, Plus } from 'lucide-react';

export interface MobileTabletPreviewProps {
  onBackToLanding?: () => void;
}

export const MobileTabletPreview: React.FC<MobileTabletPreviewProps> = () => {
  const [device, setDevice] = useState<'phone' | 'tablet'>('phone');
  const [activeTab, setActiveTab] = useState<'today' | 'pipeline'>('today');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [selectedLeadKey, setSelectedLeadKey] = useState<'priya' | 'arjun' | 'kavita'>('priya');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Swipe offset state for phone lead card
  const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});
  const dragStartRef = useRef<{ id: string; x: number } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', themeMode === 'dark');
    }
  }, [themeMode]);

  const leadData = {
    priya: { name: 'Priya Sharma', co: 'Kavita Traders, Mumbai · +91 98xxxxxx21', stage: 'Contacted', time: '2h ago', assigned: 'Rohit' },
    arjun: { name: 'Arjun Verma', co: 'Verma Constructions, Pune · +91 97xxxxxx08', stage: 'New', time: '4h ago', assigned: 'Unassigned' },
    kavita: { name: 'Meena Iyer', co: 'Iyer & Sons, Chennai · +91 90xxxxxx44', stage: 'Qualified', time: '1d ago', assigned: 'You' },
  };

  const handlePointerDown = (id: string, clientX: number) => {
    dragStartRef.current = { id, x: clientX };
  };

  const handlePointerMove = (clientX: number) => {
    if (!dragStartRef.current) return;
    const { id, x } = dragStartRef.current;
    const dx = Math.min(0, Math.max(-120, clientX - x));
    setSwipeOffset((prev) => ({ ...prev, [id]: dx }));
  };

  const handlePointerUp = () => {
    if (!dragStartRef.current) return;
    const { id } = dragStartRef.current;
    const currentDx = swipeOffset[id] || 0;
    setSwipeOffset((prev) => ({
      ...prev,
      [id]: currentDx < -55 ? -120 : 0,
    }));
    dragStartRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 py-6 px-3">
      <style>{`
        :root {
          --bg: #FFFFFF; --surface: #F7F7F5; --surface-alt: #EFEFEC; --border: #E3E3DF;
          --text: #16181D; --text-muted: #666A75; --accent: #B8791F; --teal: #127A69;
        }
        html.dark {
          --bg: #0B0E17; --surface: #12151F; --surface-alt: #171B27; --border: rgba(255,255,255,0.09);
          --text: #EDEEF3; --text-muted: #888D9C; --accent: #E5A93C; --teal: #22B8A3;
        }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .feed-row { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 12px; align-items: baseline; }
        .feed-row .t { color: var(--text-muted); flex-shrink: 0; }
        .feed-row .amt { margin-left: auto; color: var(--teal); }
      `}</style>

      {/* CONTROL BARS */}
      <div className="max-w-[900px] mx-auto mb-4 space-y-3 text-center">
        {/* Device Switcher */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setDevice('phone')}
            className={`px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold cursor-pointer ${
              device === 'phone' ? 'bg-[var(--surface-alt)] text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Phone View
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-semibold cursor-pointer ${
              device === 'tablet' ? 'bg-[var(--surface-alt)] text-[var(--text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Tablet View
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 justify-center">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium cursor-pointer ${
              activeTab === 'today' ? 'border-[var(--teal)] text-[var(--teal)] font-bold' : 'text-[var(--text-muted)]'
            }`}
          >
            Today Overview
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium cursor-pointer ${
              activeTab === 'pipeline' ? 'border-[var(--teal)] text-[var(--teal)] font-bold' : 'text-[var(--text-muted)]'
            }`}
          >
            Sales Pipeline
          </button>
        </div>

        {/* Theme Row */}
        <div className="flex gap-1.5 justify-center">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setThemeMode(t as any)}
              className={`px-3 py-1 rounded-full border border-[var(--border)] text-xs capitalize cursor-pointer ${
                themeMode === t ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* DEVICE FRAME STAGE */}
      <div className="flex justify-center">
        {device === 'phone' ? (
          /* PHONE DEVICE FRAME */
          <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-[36px] p-2 shadow-2xl">
            <div className="relative overflow-hidden bg-[var(--bg)] w-[340px] h-[680px] rounded-[28px] flex flex-col">
              {/* Status Bar */}
              <div className="flex justify-between items-center px-5 pt-2 text-[11px] text-[var(--text-muted)] mono">
                <span>9:41</span>
                <span>5G · 100%</span>
              </div>

              {/* PHONE VIEW: TODAY TAB */}
              {activeTab === 'today' && (
                <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold font-display">Good morning, Aravind</h2>
                      <p className="text-xs text-[var(--text-muted)]">Friday, 24 July</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-bold text-xs">
                      AR
                    </div>
                  </div>

                  <div className="border border-[var(--border)] rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">Today</span>
                    <p className="text-xs font-medium">3 follow-ups due, 1 lead unassigned, 2 items low on stock</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-[var(--border)] rounded-xl p-2.5">
                      <span className="font-display font-bold text-base block">12</span>
                      <span className="text-[10.5px] text-[var(--text-muted)] block">New leads</span>
                    </div>
                    <div className="border border-[var(--border)] rounded-xl p-2.5">
                      <span className="font-display font-bold text-base block">7</span>
                      <span className="text-[10.5px] text-[var(--text-muted)] block">Tasks due</span>
                    </div>
                    <div className="border border-[var(--border)] rounded-xl p-2.5">
                      <span className="font-display font-bold text-base block">2</span>
                      <span className="text-[10.5px] text-[var(--text-muted)] block">Low stock</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11.5px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Recent activity</span>
                    <div className="mono space-y-1">
                      <div className="feed-row"><span className="t">09:14</span><span>New lead: Priya Sharma</span></div>
                      <div className="feed-row"><span className="t">09:16</span><span>Invoice #2291</span><span className="amt">₹42,000</span></div>
                      <div className="feed-row"><span className="t">09:20</span><span>Stock updated: WH2</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* PHONE VIEW: PIPELINE TAB */}
              {activeTab === 'pipeline' && (
                <div className="flex-1 overflow-y-auto px-4 pb-20 pt-2 space-y-3">
                  <h2 className="text-base font-bold font-display">Sales Pipeline</h2>
                  <div className="flex items-center gap-2 border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text-muted)]">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search leads...</span>
                  </div>
                  <p className="text-[10.5px] text-center text-[var(--text-muted)]">Swipe a card for quick actions</p>

                  {(['priya', 'arjun', 'kavita'] as const).map((key) => {
                    const l = leadData[key];
                    const offset = swipeOffset[key] || 0;

                    return (
                      <div key={key} className="relative rounded-xl overflow-hidden">
                        {/* Action Buttons Revealed on Swipe */}
                        <div className="absolute inset-0 flex justify-end">
                          <button className="w-[60px] bg-[var(--accent)] text-white text-[10.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer">
                            <Flag className="w-3.5 h-3.5" /> Flag
                          </button>
                          <button className="w-[60px] bg-[var(--teal)] text-white text-[10.5px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer">
                            <PhoneCall className="w-3.5 h-3.5" /> Call
                          </button>
                        </div>

                        {/* Swipeable Card */}
                        <div
                          onPointerDown={(e) => handlePointerDown(key, e.clientX)}
                          onPointerMove={(e) => handlePointerMove(e.clientX)}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerUp}
                          onClick={() => {
                            setSelectedLeadKey(key);
                            setIsSheetOpen(true);
                          }}
                          style={{ transform: `translateX(${offset}px)` }}
                          className="relative bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 space-y-2 cursor-pointer transition-transform duration-200 touch-pan-y"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm font-display">{l.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-muted)]">{l.stage}</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{l.co}</p>
                          <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
                            <span>Assigned: {l.assigned}</span>
                            <span>{l.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Action Button (FAB) */}
              <button className="absolute right-4 bottom-20 w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer z-10">
                <Plus className="w-5 h-5" />
              </button>

              {/* Bottom Tab Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-[var(--bg)] border-t border-[var(--border)] flex justify-around items-center text-[10px] pb-3">
                <button onClick={() => setActiveTab('today')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'today' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
                  <Home className="w-4 h-4" /> Today
                </button>
                <button onClick={() => setActiveTab('pipeline')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'pipeline' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
                  <CheckSquare className="w-4 h-4" /> Pipeline
                </button>
                <button className="flex flex-col items-center gap-1 text-[var(--text-muted)] cursor-pointer">
                  <Package className="w-4 h-4" /> Tasks
                </button>
                <button className="flex flex-col items-center gap-1 text-[var(--text-muted)] cursor-pointer">
                  <MoreHorizontal className="w-4 h-4" /> More
                </button>
              </div>

              {/* Bottom Sheet Drawer for Lead Detail */}
              {isSheetOpen && (
                <>
                  <div className="absolute inset-0 bg-black/40 z-30" onClick={() => setIsSheetOpen(false)} />
                  <div className="absolute left-0 right-0 bottom-0 bg-[var(--bg)] border-t border-[var(--border)] rounded-t-2xl p-4 z-40 space-y-3 animate-in slide-in-from-bottom duration-300">
                    <div className="w-8 h-1 bg-[var(--border)] rounded-full mx-auto" />
                    <div>
                      <h3 className="text-base font-bold font-display">{leadData[selectedLeadKey].name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{leadData[selectedLeadKey].co}</p>
                    </div>

                    <div className="flex gap-2 text-xs font-mono overflow-x-auto py-1">
                      {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map((s) => (
                        <span key={s} className={`px-3 py-1 rounded-full border border-[var(--border)] ${s === leadData[selectedLeadKey].stage ? 'bg-[var(--teal)] text-white font-bold' : 'text-[var(--text-muted)]'}`}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 rounded-lg bg-[var(--teal)] text-white text-xs font-bold flex items-center justify-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5" /> Call Now
                      </button>
                      <button className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--text)]">
                        Flag
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] space-y-1 text-xs">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Activity Log</span>
                      <p className="text-2xs text-[var(--text-muted)] font-mono">Call logged — 8 min, "interested, requested quotation"</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* TABLET DEVICE FRAME SPLIT VIEW */
          <div className="relative bg-[var(--bg)] border border-[var(--border)] rounded-[20px] p-2.5 shadow-2xl">
            <div className="relative overflow-hidden bg-[var(--bg)] w-[680px] h-[500px] rounded-xl flex flex-col">
              {/* Tablet Top Tab Navigation */}
              <div className="h-12 border-b border-[var(--border)] flex gap-6 items-center px-5 text-xs font-semibold">
                <button onClick={() => setActiveTab('today')} className={`cursor-pointer ${activeTab === 'today' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
                  Today
                </button>
                <button onClick={() => setActiveTab('pipeline')} className={`cursor-pointer ${activeTab === 'pipeline' ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
                  Sales Pipeline
                </button>
              </div>

              {/* TABLET VIEW: TODAY */}
              {activeTab === 'today' && (
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold font-display">Good morning, Aravind</h2>
                      <p className="text-xs text-[var(--text-muted)]">Friday, 24 July</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-bold text-xs">AR</div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="border border-[var(--border)] rounded-xl p-3">
                        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">Today</span>
                        <p className="text-xs font-medium">3 follow-ups due, 1 lead unassigned, 2 items low on stock</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border border-[var(--border)] rounded-xl p-2.5"><span className="font-display font-bold text-base block">12</span><span className="text-[10.5px] text-[var(--text-muted)]">Leads</span></div>
                        <div className="border border-[var(--border)] rounded-xl p-2.5"><span className="font-display font-bold text-base block">7</span><span className="text-[10.5px] text-[var(--text-muted)]">Tasks</span></div>
                        <div className="border border-[var(--border)] rounded-xl p-2.5"><span className="font-display font-bold text-base block">2</span><span className="text-[10.5px] text-[var(--text-muted)]">Stock</span></div>
                      </div>
                    </div>

                    <div className="w-[260px] border-l border-[var(--border)] pl-4 space-y-2 mono text-xs">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Recent activity</span>
                      <div className="feed-row"><span className="t">09:14</span><span>New lead: Priya S.</span></div>
                      <div className="feed-row"><span className="t">09:16</span><span>Invoice #2291</span><span className="amt">₹42,000</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TABLET VIEW: SPLIT PIPELINE */}
              {activeTab === 'pipeline' && (
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Column: Lead List */}
                  <div className="w-[240px] border-r border-[var(--border)] overflow-y-auto p-3 space-y-2">
                    {(['priya', 'arjun', 'kavita'] as const).map((k) => (
                      <div
                        key={k}
                        onClick={() => setSelectedLeadKey(k)}
                        className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                          selectedLeadKey === k ? 'bg-[var(--surface-alt)] font-bold' : 'hover:bg-[var(--surface)]'
                        }`}
                      >
                        <div className="text-xs font-bold font-display">{leadData[k].name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{leadData[k].co}</div>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Lead Detail */}
                  <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <div>
                      <h3 className="text-lg font-bold font-display">{leadData[selectedLeadKey].name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{leadData[selectedLeadKey].co}</p>
                    </div>

                    <div className="flex gap-2 text-xs font-mono">
                      {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map((s) => (
                        <span key={s} className={`px-3 py-1 rounded-full border border-[var(--border)] ${s === leadData[selectedLeadKey].stage ? 'bg-[var(--teal)] text-white font-bold' : 'text-[var(--text-muted)]'}`}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 max-w-xs">
                      <button className="flex-1 py-2 rounded-lg bg-[var(--teal)] text-white text-xs font-bold flex items-center justify-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5" /> Call Now
                      </button>
                      <button className="flex-1 py-2 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--text)]">
                        Flag
                      </button>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block font-display">Lead Activity Memory</span>
                      <div className="space-y-1.5 font-mono text-2xs text-[var(--text-muted)]">
                        <p>• Stage updated to <strong className="text-[var(--text)]">{leadData[selectedLeadKey].stage}</strong></p>
                        <p>• Call logged (8 mins): "Wants quotation for 100 units"</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
