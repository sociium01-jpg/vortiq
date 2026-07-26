// ─────────────────────────────────────────────────────────────
// Section 5: Support — Client Ticket Desk & Resolution Activity Threads
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/design-system';
import { SupportTicket, SupportTicketReply } from './types';
import { Send } from 'lucide-react';

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 't-101',
    ticket_number: 'TKT-8081',
    client_id: 'client-1',
    client_name: 'Apex Industrial Logistics',
    submitted_by_email: 'admin@apexind.com',
    subject: 'GSTIN validation error on GSTR-3B export',
    description: 'When generating GSTR-3B CSV export, 2 line items are showing unmapped HSN codes.',
    priority: 'high',
    status: 'in_progress',
    assigned_to_email: 'alex.vance@vortiq.biz',
    created_at: '2026-07-25 14:30',
    updated_at: '2026-07-26 09:15',
    activity_thread: [
      {
        id: 'r-1',
        sender_name: 'Rajesh Sharma',
        sender_role: 'client',
        message: 'Hi team, please check our July GSTR-3B export. HSN 998399 is getting flagged.',
        timestamp: '2026-07-25 14:30',
      },
      {
        id: 'r-2',
        sender_name: 'Alex Vance',
        sender_role: 'vortiq_employee',
        message: 'Investigating now. We updated the HSN lookup table for SAC 998399. Testing fix on staging.',
        timestamp: '2026-07-26 09:15',
      },
    ],
  },
  {
    id: 't-102',
    ticket_number: 'TKT-8082',
    client_id: 'client-3',
    client_name: 'MedLife Diagnostics Pvt Ltd',
    submitted_by_email: 'accounts@medlifediag.in',
    subject: 'Request for 15-day trial extension',
    description: 'We require an additional 15 days to complete our HR data migration.',
    priority: 'medium',
    status: 'open',
    assigned_to_email: 'rohan.mehta@vortiq.biz',
    created_at: '2026-07-26 11:00',
    updated_at: '2026-07-26 11:00',
    activity_thread: [
      {
        id: 'r-3',
        sender_name: 'Dr. Sunita Rao',
        sender_role: 'client',
        message: 'Could we extend our trial until August 18 while our IT team approves the data import?',
        timestamp: '2026-07-26 11:00',
      },
    ],
  },
];

export const OpsSupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(SEED_TICKETS[0]);
  const [replyMessage, setReplyMessage] = useState('');

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    const newReply: SupportTicketReply = {
      id: `r-${Date.now()}`,
      sender_name: 'Alex Vance (Vortiq Support)',
      sender_role: 'vortiq_employee',
      message: replyMessage.trim(),
      timestamp: 'Just now',
    };

    const updated = {
      ...selectedTicket,
      updated_at: 'Just now',
      activity_thread: [...selectedTicket.activity_thread, newReply],
    };

    setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
    setReplyMessage('');
  };

  const handleStatusChange = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updated_at: 'Just now' } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status, updated_at: 'Just now' } : null));
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-display">Client Support & Issue Resolution Desk</h2>
            <Badge variant="blue" size="sm">SLA Active</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Track client-reported tickets, assign Vortiq engineers, and maintain resolution threads.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTicket?.id === t.id
                  ? 'bg-slate-800/60 border-brand-500 shadow-md'
                  : 'bg-dark-card border-dark-border hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono font-bold text-xs text-brand-400">{t.ticket_number}</span>
                <Badge
                  variant={
                    t.status === 'resolved'
                      ? 'emerald'
                      : t.status === 'in_progress'
                      ? 'amber'
                      : 'rose'
                  }
                  size="sm"
                >
                  {t.status.toUpperCase()}
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">{t.subject}</h4>
              <p className="text-2xs text-slate-400 font-mono mb-2">{t.client_name}</p>
              <div className="flex items-center justify-between text-3xs text-slate-500 font-mono pt-2 border-t border-dark-border/50">
                <span>Assigned: {t.assigned_to_email.split('@')[0]}</span>
                <span>{t.updated_at}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Thread Inspector */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="p-5 space-y-4 bg-dark-card border-dark-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-dark-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-brand-400 font-bold">{selectedTicket.ticket_number}</span>
                    <Badge variant="blue" size="sm">{selectedTicket.priority.toUpperCase()} PRIORITY</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Client: {selectedTicket.client_name} ({selectedTicket.submitted_by_email})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as any)}
                    className="bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  >
                    <option value="open">Status: Open</option>
                    <option value="in_progress">Status: In Progress</option>
                    <option value="resolved">Status: Resolved</option>
                  </select>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                {selectedTicket.activity_thread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                      msg.sender_role === 'vortiq_employee'
                        ? 'bg-blue-500/10 border-blue-500/30 ml-4'
                        : 'bg-dark-surface border-dark-border mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-2xs">
                      <span className={`font-bold ${msg.sender_role === 'vortiq_employee' ? 'text-blue-300' : 'text-slate-300'}`}>
                        {msg.sender_name}
                      </span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleAddReply} className="pt-3 border-t border-dark-border space-y-3">
                <textarea
                  value={replyMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyMessage(e.target.value)}
                  placeholder="Type official response to client..."
                  rows={3}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    disabled={!replyMessage.trim()}
                  >
                    Send Response
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 font-mono text-xs bg-dark-card border-dark-border">
              Select a support ticket to inspect the resolution thread.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
