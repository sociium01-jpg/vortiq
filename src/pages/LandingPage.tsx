import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  Package,
  Shield,
  BarChart3,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  CreditCard,
  Flag,
  Sparkles,
  ChevronRight,
  AppWindow,
} from 'lucide-react';

export interface LandingPageProps {
  onNavigateToApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToApp }) => {
  // Cursor-reactive radial glow state for Hero background
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Mock auto-scrolling ledger logs
  const ledgerLogs = [
    { time: '14:31:02', event: 'New B2B Lead: Priya Sharma (Mumbai)', amount: '₹4,50,000', color: 'gold' },
    { time: '14:31:45', event: 'Invoice #2291 generated — GST IN2910', amount: '₹42,000', color: 'teal' },
    { time: '14:32:10', event: 'Stock updated: Warehouse 2, +120 units SKU-8891', amount: null, color: null },
    { time: '14:32:38', event: 'Payroll processed: 48 employees via Razorpay', amount: '₹14,80,000', color: 'teal' },
    { time: '14:33:05', event: 'Task completed: GST GSTR-3B quarterly filing', amount: null, color: null },
    { time: '14:33:40', event: 'WhatsApp payment reminder: Rajesh Traders', amount: '₹89,500', color: 'gold' },
    { time: '14:34:12', event: 'Low stock alert: Hydraulic Seal SK-1002 (4 left)', amount: null, color: 'gold' },
    { time: '14:34:55', event: 'Payment received: UPI Ref #99201', amount: '₹1,85,000', color: 'teal' },
  ];

  // Double the array for seamless CSS loop
  const infiniteLogs = [...ledgerLogs, ...ledgerLogs];

  return (
    <div className="min-h-screen bg-[#0B0F1D] text-[#EDEEF3] font-sans antialiased flex flex-col selection:bg-[#E5A93C]/30 selection:text-[#E5A93C]">
      
      {/* 1. STICKY NAV */}
      <header className="sticky top-0 z-50 bg-[#0B0F1D]/90 backdrop-blur-md border-b border-[rgba(237,238,243,0.10)] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-2.5 group focus-visible:outline-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E5A93C] to-[#22B8A3] flex items-center justify-center text-[#0B0F1D] font-extrabold font-heading text-lg shadow-md shadow-[#E5A93C]/20 group-hover:scale-105 transition-transform">
            V
          </div>
          <span className="text-xl font-bold font-heading tracking-tight text-[#EDEEF3]">Vortiq</span>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8D93AC]">
          <a href="#modules" className="hover:text-[#EDEEF3] transition-colors focus-visible:outline-none">Product</a>
          <a href="#how-it-works" className="hover:text-[#EDEEF3] transition-colors focus-visible:outline-none">How it works</a>
          <a href="#pricing" className="hover:text-[#EDEEF3] transition-colors focus-visible:outline-none">Pricing</a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          {onNavigateToApp && (
            <button
              onClick={onNavigateToApp}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#22B8A3] bg-[#22B8A3]/10 border border-[#22B8A3]/30 rounded-lg hover:bg-[#22B8A3]/20 transition-colors focus-visible:outline-none cursor-pointer"
            >
              <AppWindow className="w-3.5 h-3.5" />
              Launch SaaS App
            </button>
          )}

          <a
            href="#pricing"
            className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-[#0B0F1D] bg-[#E5A93C] hover:bg-[#f0b548] rounded-lg shadow-md shadow-[#E5A93C]/20 transition-all cursor-pointer focus-visible:outline-none active:scale-[0.98]"
          >
            Start free
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="hero"
        onMouseMove={handleMouseMove}
        className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl w-full mx-auto overflow-hidden"
      >
        {/* Subtle Cursor-Reactive Radial Glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-300 opacity-40 -z-10"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(229, 169, 60, 0.12), rgba(34, 184, 165, 0.05) 50%, transparent 80%)`,
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Eyebrow + Headline + Subhead + CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141A2E] border border-[rgba(237,238,243,0.10)] text-xs font-mono text-[#E5A93C]">
              <Sparkles className="w-3.5 h-3.5 text-[#22B8A3]" />
              AI-NATIVE UNIFIED OPERATING SYSTEM
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight leading-[1.1] text-[#EDEEF3]">
              Stop running your business across{' '}
              <span className="text-[#E5A93C] underline decoration-[#E5A93C]/40 underline-offset-8">
                six different apps.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#8D93AC] max-w-2xl leading-relaxed">
              Vortiq unifies your CRM, tasks, inventory, HR, finance, and marketing into a single real-time ledger. Designed specifically for Indian SMEs to eliminate data silos and manual entry.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#0B0F1D] bg-[#E5A93C] hover:bg-[#f0b548] rounded-xl shadow-lg shadow-[#E5A93C]/25 transition-all cursor-pointer focus-visible:outline-none active:scale-[0.98]"
              >
                <span>Start free</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#EDEEF3] bg-[#141A2E] hover:bg-[#1B2238] border border-[rgba(237,238,243,0.10)] rounded-xl transition-all cursor-pointer focus-visible:outline-none"
              >
                <span>See how it works</span>
                <ChevronRight className="w-4 h-4 text-[#8D93AC]" />
              </a>
            </div>
          </div>

          {/* Right Column: Physical Khata Ledger Signature Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] shadow-2xl overflow-hidden group">
              
              {/* Ledger Header / Khata Binding Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0B0F1D]/80 border-b border-[rgba(237,238,243,0.10)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <div className="text-xs font-mono text-[#8D93AC] font-medium tracking-wide">
                  live_operations.ledger
                </div>
                <div className="text-2xs font-mono text-[#22B8A3] bg-[#22B8A3]/10 px-2 py-0.5 rounded border border-[#22B8A3]/30">
                  LIVE FEED
                </div>
              </div>

              {/* Ledger Body: Continuously Auto-Scrolling Monospace Feed */}
              <div className="h-80 overflow-hidden relative p-4 bg-[#0B0F1D]/40">
                <div className="animate-ledger-scroll space-y-3 font-mono text-xs">
                  {infiniteLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#141A2E]/80 border border-[rgba(237,238,243,0.06)] hover:border-[#E5A93C]/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#8D93AC] text-2xs shrink-0 pt-0.5">{log.time}</span>
                        <span className="text-[#EDEEF3] leading-snug">{log.event}</span>
                      </div>
                      {log.amount && (
                        <span
                          className={`font-semibold shrink-0 ${
                            log.color === 'gold'
                              ? 'text-[#E5A93C]'
                              : log.color === 'teal'
                              ? 'text-[#22B8A3]'
                              : 'text-[#EDEEF3]'
                          }`}
                        >
                          {log.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ledger Footer Status */}
              <div className="px-4 py-2.5 bg-[#141A2E] border-t border-[rgba(237,238,243,0.10)] flex items-center justify-between text-2xs font-mono text-[#8D93AC]">
                <span>Status: Unified Ledger Synced</span>
                <span className="text-[#E5A93C]">DPDP Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST STRIP */}
      <section className="border-y border-[rgba(237,238,243,0.10)] bg-[#141A2E]/40 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs sm:text-sm font-medium text-[#8D93AC]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E5A93C]" />
            <span>GST-ready invoicing</span>
          </div>
          <div className="h-4 w-px bg-[rgba(237,238,243,0.10)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22B8A3]" />
            <span>DPDP compliant</span>
          </div>
          <div className="h-4 w-px bg-[rgba(237,238,243,0.10)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#E5A93C]" />
            <span>Razorpay secured</span>
          </div>
          <div className="h-4 w-px bg-[rgba(237,238,243,0.10)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#22B8A3]" />
            <span>Built in India</span>
          </div>
        </div>
      </section>

      {/* 4. MODULES SECTION (BENTO GRID) */}
      <section id="modules" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-[#EDEEF3] tracking-tight">
            Six business pillars. One unified system.
          </h2>
          <p className="text-sm sm:text-base text-[#8D93AC]">
            Every module consumes the same underlying ledger—eliminating manual re-entry between departments.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: CRM */}
          <div className="p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] hover:bg-[#1B2238] hover:-translate-y-1 hover:border-[#E5A93C]/40 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#EDEEF3] mb-2">CRM & Sales</h3>
            <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
              Track B2B leads, automate WhatsApp follow-ups, and convert quotes to GST invoices in one click.
            </p>
          </div>

          {/* Card 2: Tasks */}
          <div className="p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] hover:bg-[#1B2238] hover:-translate-y-1 hover:border-[#22B8A3]/40 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-[#22B8A3]/10 border border-[#22B8A3]/30 text-[#22B8A3] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#EDEEF3] mb-2">Tasks & Projects</h3>
            <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
              Jira-style task boards linked directly to client deals, team comments, and operational wikis.
            </p>
          </div>

          {/* Card 3: HR */}
          <div className="p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] hover:bg-[#1B2238] hover:-translate-y-1 hover:border-[#E5A93C]/40 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#EDEEF3] mb-2">HR & Payroll</h3>
            <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
              Automate salary calculation, attendance tracking, and compliant statutory slip distribution.
            </p>
          </div>

          {/* Card 4: Inventory */}
          <div className="p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] hover:bg-[#1B2238] hover:-translate-y-1 hover:border-[#22B8A3]/40 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-[#22B8A3]/10 border border-[#22B8A3]/30 text-[#22B8A3] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#EDEEF3] mb-2">Inventory & Stock</h3>
            <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
              Multi-warehouse stock control with mobile floor photo capture, barcode scanning, and low stock alerts.
            </p>
          </div>

          {/* Card 5: Finance */}
          <div className="p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] hover:bg-[#1B2238] hover:-translate-y-1 hover:border-[#E5A93C]/40 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#E5A93C] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#EDEEF3] mb-2">Finance & Invoicing</h3>
            <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
              GST-compliant billing, automated Razorpay payment reconciliation, and real-time P&L summaries.
            </p>
          </div>

          {/* Card 6: Marketing */}
          <div className="p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] hover:bg-[#1B2238] hover:-translate-y-1 hover:border-[#22B8A3]/40 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-[#22B8A3]/10 border border-[#22B8A3]/30 text-[#22B8A3] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[#EDEEF3] mb-2">Marketing & Data</h3>
            <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
              Targeted customer segmentation, automated payment reminder dispatch via WhatsApp & SMS.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 sm:px-8 border-t border-[rgba(237,238,243,0.10)] bg-[#141A2E]/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-[#EDEEF3] tracking-tight">
              How data flows through Vortiq
            </h2>
            <p className="text-sm sm:text-base text-[#8D93AC]">
              A continuous, automated loop that replaces manual reconciliation.
            </p>
          </div>

          {/* 3 Sequential Steps with Vertical Dividers on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-4 p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] relative">
              <div className="text-4xl font-extrabold font-mono text-[#E5A93C]">01</div>
              <h3 className="text-xl font-bold font-heading text-[#EDEEF3]">Capture</h3>
              <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
                Every transaction, new lead, stock count adjustment, and attendance log enters the ledger automatically without double entry.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] relative">
              <div className="text-4xl font-extrabold font-mono text-[#22B8A3]">02</div>
              <h3 className="text-xl font-bold font-heading text-[#EDEEF3]">Understand</h3>
              <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
                The AI-native correlation engine flags low stock against open sales orders and calculates cash flow forecasts instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 p-6 rounded-2xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] relative">
              <div className="text-4xl font-extrabold font-mono text-[#E5A93C]">03</div>
              <h3 className="text-xl font-bold font-heading text-[#EDEEF3]">Act</h3>
              <p className="text-xs sm:text-sm text-[#8D93AC] leading-relaxed">
                Trigger automated WhatsApp payment links, generate Razorpay invoices, and dispatch reorder alerts to suppliers with one tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING (Single Centered Plan Card) */}
      <section id="pricing" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-[#EDEEF3] tracking-tight">
            Transparent, predictable pricing
          </h2>
          <p className="text-sm sm:text-base text-[#8D93AC]">
            No complex tiers, no per-module add-on fees. Every feature included.
          </p>
        </div>

        {/* Single Centered Plan Card */}
        <div className="max-w-lg mx-auto rounded-3xl bg-[#141A2E] border-2 border-[#E5A93C]/80 shadow-2xl overflow-hidden p-8 space-y-8 relative">
          <div className="absolute top-4 right-4 bg-[#E5A93C]/10 border border-[#E5A93C]/40 text-[#E5A93C] text-2xs font-mono font-bold px-3 py-1 rounded-full uppercase">
            EVERY MODULE INCLUDED
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold font-heading text-[#EDEEF3]">Vortiq Complete Suite</h3>
            <p className="text-xs text-[#8D93AC]">Designed for growing Indian teams from 5 to 500 users</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 border-y border-[rgba(237,238,243,0.10)] py-6">
            <span className="text-4xl sm:text-5xl font-extrabold font-heading text-[#EDEEF3]">₹3,999</span>
            <span className="text-xs text-[#8D93AC] font-mono">/ user / month (billed annually)</span>
          </div>

          {/* Checklist */}
          <div className="space-y-3 text-xs sm:text-sm text-[#EDEEF3]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22B8A3] shrink-0" />
              <span>Full access to all 6 modules (CRM, Tasks, HR, Inventory, Finance, Marketing)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22B8A3] shrink-0" />
              <span>Unlimited GST-compliant invoices & Razorpay payment links</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22B8A3] shrink-0" />
              <span>Multi-warehouse stock control with mobile floor photo capture</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22B8A3] shrink-0" />
              <span>Automated WhatsApp & SMS payment reminder dispatch</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22B8A3] shrink-0" />
              <span>DPDP 2023 compliant data security with daily encrypted backups</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#22B8A3] shrink-0" />
              <span>24/7 dedicated support in English, Hindi & regional languages</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToApp ? onNavigateToApp() : alert('Redirecting to Vortiq 14-day free trial signup...')}
            className="w-full py-4 px-6 rounded-xl bg-[#E5A93C] hover:bg-[#f0b548] text-[#0B0F1D] font-bold text-sm font-heading shadow-lg shadow-[#E5A93C]/25 transition-all cursor-pointer focus-visible:outline-none active:scale-[0.98]"
          >
            Start your 14-day free trial
          </button>

          <p className="text-center text-2xs text-[#8D93AC]">No credit card required • Instant 5-minute setup</p>
        </div>
      </section>

      {/* 7. FINAL CTA BAND */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-[#141A2E] border border-[rgba(237,238,243,0.10)] p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-[#EDEEF3] tracking-tight">
              Your whole business, finally in one ledger.
            </h2>
            <p className="text-sm sm:text-base text-[#8D93AC]">
              Join forward-thinking Indian enterprises running CRM, tasks, inventory, and finance without app fatigue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#0B0F1D] bg-[#E5A93C] hover:bg-[#f0b548] rounded-xl shadow-lg shadow-[#E5A93C]/25 transition-all cursor-pointer focus-visible:outline-none active:scale-[0.98]"
            >
              Start free
            </a>
            <button
              onClick={() => alert('Demo booking request received! Our team will contact you shortly.')}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#EDEEF3] bg-[#0B0F1D] hover:bg-[#1B2238] border border-[rgba(237,238,243,0.10)] rounded-xl transition-all cursor-pointer focus-visible:outline-none"
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* 8. SIMPLE FOOTER */}
      <footer className="mt-auto border-t border-[rgba(237,238,243,0.10)] bg-[#0B0F1D] py-8 px-4 sm:px-8 text-xs text-[#8D93AC]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#E5A93C] text-[#0B0F1D] font-extrabold font-heading text-xs flex items-center justify-center">
              V
            </div>
            <span className="font-bold font-heading text-[#EDEEF3]">Vortiq</span>
            <span>© 2026 Vortiq Technologies Pvt Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-2xs">
            <span className="hover:text-[#EDEEF3] cursor-pointer">DPDP Compliant</span>
            <span className="hover:text-[#EDEEF3] cursor-pointer">GST Ready</span>
            <span className="text-[#22B8A3]">Built in India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
