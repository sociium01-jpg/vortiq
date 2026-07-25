// ─────────────────────────────────────────────────────────────
// Vortiq Official Website & Landing Page Surface
// Clean implementation with Light/Dark/Auto theme support & Sign In / Request Access CTAs
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';

export interface LandingPageProps {
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenSignIn, onOpenSignUp }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', themeMode === 'dark');
    }
  }, [themeMode]);

  const entries = [
    ['09:14', 'New lead: Priya Sharma, Mumbai', ''],
    ['09:16', 'Invoice #2291 generated', '₹42,000'],
    ['09:20', 'Stock updated: Warehouse 2', '+120 units'],
    ['09:24', 'Task completed: delivery confirmed', ''],
    ['09:31', 'Payroll run: 14 employees processed', ''],
    ['09:35', 'Follow-up scheduled: Kavita Traders', ''],
    ['09:41', 'New lead: Arjun Verma, Pune', ''],
    ['09:47', 'Payment received: INV-2288', '₹1,18,000'],
  ];

  const doubleEntries = [...entries, ...entries];

  return (
    <div className="min-h-screen font-sans bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
      <style>{`
        :root {
          --bg: #FFFFFF; --surface: #F7F7F5; --surface-alt: #EFEFEC; --border: #E3E3DF;
          --text: #16181D; --text-muted: #666A75; --accent: #B8791F; --teal: #127A69;
          --radius: 12px;
        }
        html.dark {
          --bg: #0B0E17; --surface: #12151F; --surface-alt: #171B27; --border: rgba(255,255,255,0.09);
          --text: #EDEEF3; --text-muted: #888D9C; --accent: #E5A93C; --teal: #22B8A3;
        }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        @media (max-width: 860px) { .bento { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .bento { grid-template-columns: 1fr; } }
        .ledger-feed { display: flex; flex-direction: column; animation: scrollUp 18s linear infinite; }
        @keyframes scrollUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}</style>

      {/* NAV BAR */}
      <nav className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-7 py-4 max-w-[1080px] mx-auto">
          <div className="flex items-center gap-2 text-[17px] font-semibold font-display">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            <span>Vortiq</span>
          </div>

          <div className="hidden md:flex gap-7 text-sm text-[var(--text-muted)] font-medium">
            <a href="#modules" className="hover:text-[var(--text)] transition-colors">Product</a>
            <a href="#how" className="hover:text-[var(--text)] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[var(--text)] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex border border-[var(--border)] rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => setThemeMode('light')}
                className={`px-2.5 py-1.5 cursor-pointer ${themeMode === 'light' ? 'bg-[var(--surface-alt)] text-[var(--text)] font-bold' : 'text-[var(--text-muted)]'}`}
              >
                Light
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-2.5 py-1.5 cursor-pointer ${themeMode === 'dark' ? 'bg-[var(--surface-alt)] text-[var(--text)] font-bold' : 'text-[var(--text-muted)]'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setThemeMode('system')}
                className={`px-2.5 py-1.5 cursor-pointer ${themeMode === 'system' ? 'bg-[var(--surface-alt)] text-[var(--text)] font-bold' : 'text-[var(--text-muted)]'}`}
              >
                Auto
              </button>
            </div>

            <button
              onClick={onOpenSignIn}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] text-xs font-semibold hover:bg-[var(--surface)] transition-all cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={onOpenSignUp}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
            >
              Request Access
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="py-20">
        <div className="max-w-[1080px] mx-auto px-7 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--teal)] mb-4 font-semibold font-mono">
              AI-native business OS · built for India
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-display leading-tight mb-4">
              Stop running your business across <span className="text-[var(--accent)]">six different apps.</span>
            </h1>
            <p className="text-base text-[var(--text-muted)] max-w-md mb-7">
              Vortiq brings CRM, tasks, HR, inventory, finance and operations into one system — with AI doing the busywork in the background.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onOpenSignUp}
                className="bg-[var(--accent)] text-white px-5.5 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Request Access
              </button>
              <button
                onClick={onOpenSignIn}
                className="px-5 py-3 rounded-lg font-semibold text-sm border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* LEDGER FEED */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
              <span className="mono">live_operations.ledger</span>
            </div>
            <div className="h-[280px] overflow-hidden relative">
              <div className="ledger-feed mono">
                {doubleEntries.map(([t, text, amt], idx) => (
                  <div key={idx} className="flex gap-3 items-baseline px-4 py-2.5 border-b border-[var(--border)] text-xs">
                    <span className="text-[var(--text-muted)]">{t}</span>
                    <span>{text}</span>
                    {amt && <span className="ml-auto text-[var(--teal)] font-bold">{amt}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-y border-[var(--border)] py-4">
        <div className="flex gap-8 flex-wrap justify-center text-xs text-[var(--text-muted)] max-w-[1080px] mx-auto px-7">
          <span><b className="text-[var(--text)]">GST-ready</b> invoicing</span>
          <span><b className="text-[var(--text)]">DPDP</b> compliant</span>
          <span><b className="text-[var(--text)]">Razorpay</b> secured</span>
          <span>Built in <b className="text-[var(--text)]">India</b></span>
        </div>
      </div>

      {/* MODULES BENTO SECTION */}
      <section id="modules" className="py-19">
        <div className="max-w-[1080px] mx-auto px-7">
          <div className="max-w-lg mb-10">
            <div className="text-xs text-[var(--accent)] font-mono mb-2.5">// 01 the modules</div>
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2.5">Every part of the business, one login.</h2>
            <p className="text-[var(--text-muted)] text-sm">Each module works standalone or together.</p>
          </div>
          <div className="bento">
            <div className="bg-[var(--bg)] p-6">
              <h3 className="text-sm font-semibold font-display mb-1.5">CRM &amp; Sales</h3>
              <p className="text-xs text-[var(--text-muted)]">Leads, calls, followups and a pipeline your team actually updates.</p>
            </div>
            <div className="bg-[var(--bg)] p-6">
              <h3 className="text-sm font-semibold font-display mb-1.5">Tasks &amp; Projects</h3>
              <p className="text-xs text-[var(--text-muted)]">Boards, docs, and followups in one place.</p>
            </div>
            <div className="bg-[var(--bg)] p-6">
              <h3 className="text-sm font-semibold font-display mb-1.5">HR &amp; Payroll</h3>
              <p className="text-xs text-[var(--text-muted)]">Attendance, payroll, PF/ESI — handled.</p>
            </div>
            <div className="bg-[var(--bg)] p-6">
              <h3 className="text-sm font-semibold font-display mb-1.5">Inventory &amp; Stock</h3>
              <p className="text-xs text-[var(--text-muted)]">Photograph a shelf, confirm the count — done.</p>
            </div>
            <div className="bg-[var(--bg)] p-6">
              <h3 className="text-sm font-semibold font-display mb-1.5">Finance</h3>
              <p className="text-xs text-[var(--text-muted)]">GST invoicing, TDS, e-way bills, reconciliation.</p>
            </div>
            <div className="bg-[var(--bg)] p-6">
              <h3 className="text-sm font-semibold font-display mb-1.5">Marketing &amp; Data</h3>
              <p className="text-xs text-[var(--text-muted)]">One customer list, used everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-19 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-7">
          <div className="max-w-lg mb-10">
            <div className="text-xs text-[var(--accent)] font-mono mb-2.5">// 02 how it works</div>
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2.5">Three steps. No new habits to learn.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <div>
              <div className="font-mono text-[var(--accent)] text-xs mb-2.5">01 — Capture</div>
              <h3 className="text-base font-bold font-display mb-2">Work comes in as-is</h3>
              <p className="text-xs text-[var(--text-muted)]">A call, a voice note, a photo of a shelf — captured from wherever your team already works.</p>
            </div>
            <div>
              <div className="font-mono text-[var(--accent)] text-xs mb-2.5">02 — Understand</div>
              <h3 className="text-base font-bold font-display mb-2">AI reads and routes it</h3>
              <p className="text-xs text-[var(--text-muted)]">Vortiq cleans up the input and sends it to the right module.</p>
            </div>
            <div>
              <div className="font-mono text-[var(--accent)] text-xs mb-2.5">03 — Act</div>
              <h3 className="text-base font-bold font-display mb-2">The system does the rest</h3>
              <p className="text-xs text-[var(--text-muted)]">Invoices raised, followups scheduled, alerts sent — automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-19">
        <div className="max-w-[1080px] mx-auto px-7">
          <div className="max-w-lg mb-10">
            <div className="text-xs text-[var(--accent)] font-mono mb-2.5">// 03 pricing</div>
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-2.5">One plan. Every module included.</h2>
            <p className="text-[var(--text-muted)] text-sm">No tiers to compare — just one price per user, everything unlocked.</p>
          </div>
          <div className="flex justify-center">
            <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-7">
              <h3 className="text-xs text-[var(--text-muted)] font-semibold tracking-wider mb-3 uppercase font-display">Vortiq — All Access</h3>
              <div className="font-display text-3xl font-bold mb-0.5">₹3,999<span className="text-xs text-[var(--text-muted)] font-normal font-sans">/user/mo</span></div>
              <div className="text-xs text-[var(--text-muted)] mb-5">billed annually</div>
              <ul className="list-none space-y-2 mb-5 text-xs text-[var(--text-muted)] font-mono">
                <li className="border-t border-[var(--border)] pt-2"><span className="text-[var(--teal)]">— </span>CRM, sales &amp; pipeline</li>
                <li className="border-t border-[var(--border)] pt-2"><span className="text-[var(--teal)]">— </span>Tasks &amp; projects</li>
                <li className="border-t border-[var(--border)] pt-2"><span className="text-[var(--teal)]">— </span>HR &amp; payroll</li>
                <li className="border-t border-[var(--border)] pt-2"><span className="text-[var(--teal)]">— </span>Inventory &amp; supply chain</li>
                <li className="border-t border-[var(--border)] pt-2"><span className="text-[var(--teal)]">— </span>Finance (GST-ready) &amp; marketing</li>
                <li className="border-t border-[var(--border)] pt-2"><span className="text-[var(--teal)]">— </span>Voice-based updates, AI-polished</li>
              </ul>
              <button
                onClick={onOpenSignUp}
                className="w-full text-center bg-[var(--accent)] text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Request Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="py-14">
        <div className="max-w-[1080px] mx-auto px-7">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-3.5">Your whole business, finally in one ledger.</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">Fourteen days, every module unlocked, no card required.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onOpenSignUp}
                className="bg-[var(--accent)] text-white px-5.5 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all cursor-pointer"
              >
                Request Access
              </button>
              <button
                onClick={onOpenSignIn}
                className="px-5 py-3 rounded-lg font-semibold text-sm border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] py-8 relative">
        <div className="max-w-[1080px] mx-auto px-7 flex justify-between items-center flex-wrap gap-3 text-xs text-[var(--text-muted)] font-mono">
          <span>© 2026 Vortiq. Built in India.</span>
          <span>Privacy · Terms · Contact</span>
        </div>
      </footer>
    </div>
  );
};
