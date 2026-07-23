import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { BulkLeadImporterModal } from './BulkLeadImporterModal';
import { CrmLead } from './types';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  DataTable,
  Modal,
  Toast,
  Column,
} from '@/design-system';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export const CrmModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'today'>('kanban');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStage, setNewStage] = useState('New');
  const [newValue, setNewValue] = useState('250000');

  // Leads dataset
  const [leads, setLeads] = useState<CrmLead[]>([
    {
      id: 'lead-1',
      tenant_id: 't-1',
      title: 'Fintech Corp India',
      name: 'Priya Sharma',
      company: 'Fintech Corp India',
      contact_person: 'Priya Sharma',
      email: 'priya@fintechcorp.in',
      phone: '+91 98200 12345',
      source: 'Website',
      stage: 'New',
      assignee_id: 'u-1',
      assignee: 'Alex Vance',
      estimated_value: 450000,
      currency: 'INR',
      notes: 'Interested in enterprise subscription for 50 users.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'lead-2',
      tenant_id: 't-1',
      title: 'Rajesh Traders Pvt Ltd',
      name: 'Rajesh Traders',
      company: 'Rajesh Traders Pvt Ltd',
      contact_person: 'Rajesh Kumar',
      email: 'rajesh@rajeshtraders.com',
      phone: '+91 99887 66554',
      source: 'Referral',
      stage: 'Contacted',
      assignee_id: 'u-2',
      assignee: 'Priya Sharma',
      estimated_value: 1200000,
      currency: 'INR',
      notes: 'Requires custom warehouse inventory integration.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'lead-3',
      tenant_id: 't-1',
      title: 'Patel Logistics',
      name: 'Deepak Patel',
      company: 'Patel Logistics',
      contact_person: 'Deepak Patel',
      email: 'deepak@patellogistics.com',
      phone: '+91 98111 22233',
      source: 'Cold Outreach',
      stage: 'Qualified',
      assignee_id: 'u-3',
      assignee: 'Rajesh Kumar',
      estimated_value: 850000,
      currency: 'INR',
      notes: 'Demo scheduled for next Tuesday.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const handleStageChange = (leadId: string, newStage: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, stage: newStage as any } : lead))
    );
    setToastMessage(`Lead stage updated to "${newStage}".`);
  };

  const handleCreateLead = () => {
    if (!newName) return;
    const newLead: CrmLead = {
      id: `lead-${Date.now()}`,
      tenant_id: 't-1',
      title: newName,
      name: newName,
      company: newCompany,
      contact_person: newName,
      email: newEmail,
      phone: newPhone,
      source: 'Direct',
      stage: newStage as any,
      assignee: 'Alex Vance',
      estimated_value: Number(newValue) || 0,
      currency: 'INR',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    setIsNewLeadModalOpen(false);
    setNewName('');
    setNewCompany('');
    setNewPhone('');
    setNewEmail('');
    setToastMessage(`New lead "${newName}" created successfully.`);
  };

  const handleBulkImportSuccess = (importedLeads: any[]) => {
    setLeads((prev) => [...importedLeads, ...prev]);
    setToastMessage(`Bulk import complete. Added ${importedLeads.length} leads.`);
  };

  const handleRemoveLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setToastMessage(`Lead permanently removed. Owner/Admin alert dispatched.`);
  };

  const listColumns: Column<CrmLead>[] = [
    {
      key: 'name',
      header: 'Lead Name & Company',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-100">{item.name}</div>
          <div className="text-2xs text-slate-400 font-mono">{item.company}</div>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Pipeline Stage',
      sortable: true,
      render: (item) => (
        <Select
          options={[
            { value: 'New', label: 'New' },
            { value: 'Contacted', label: 'Contacted' },
            { value: 'Qualified', label: 'Qualified' },
            { value: 'Won', label: 'Won' },
            { value: 'Lost', label: 'Lost' },
          ]}
          value={item.stage}
          onChange={(e) => handleStageChange(item.id, e.target.value)}
          className="text-xs py-1 px-2 w-32"
        />
      ),
    },
    {
      key: 'estimated_value',
      header: 'Est. Deal Value (INR)',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-bold text-[#E5A93C]">
          ₹{item.estimated_value.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'assignee',
      header: 'Assigned Owner',
      sortable: true,
      render: (item) => <span className="text-xs text-slate-300">{item.assignee || 'Unassigned'}</span>,
    },
    {
      key: 'actions',
      header: 'Inspect',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLead(item);
            setIsDrawerOpen(true);
          }}
        >
          Open Memory
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          id="crm-toast"
          type="info"
          title="Sales Pipeline Notification"
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-[#E5A93C]" />
            Sales Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            B2B lead pipeline, call logs, followups, bulk CSV importer, and lead activity memory.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
            onClick={() => setIsBulkImportOpen(true)}
          >
            Bulk CSV Import
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewLeadModalOpen(true)}
          >
            Create New Lead
          </Button>
        </div>
      </div>

      {/* Metric Cards & Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-slate-400 uppercase">Total Pipeline Value</div>
            <div className="text-lg font-bold font-mono text-[#E5A93C] mt-0.5">
              ₹{leads.reduce((sum, l) => sum + l.estimated_value, 0).toLocaleString('en-IN')}
            </div>
          </div>
          <Badge variant="emerald">{leads.length} Leads</Badge>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-slate-400 uppercase">Today's Followups</div>
            <div className="text-lg font-bold font-mono text-[#22B8A3] mt-0.5">2 Overdue</div>
          </div>
          <Badge variant="amber">High Priority</Badge>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <div className="text-2xs font-mono text-slate-400 uppercase">Win Conversion Rate</div>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">34.2%</div>
          </div>
          <Badge variant="blue">Target: 35%</Badge>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-dark-surface/60 p-1 rounded-xl border border-dark-border w-fit">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'kanban' ? 'bg-[#E5A93C] text-[#0B0F1D]' : 'text-slate-300 hover:text-white'
          }`}
        >
          Kanban View
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'list' ? 'bg-[#E5A93C] text-[#0B0F1D]' : 'text-slate-300 hover:text-white'
          }`}
        >
          List View
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'today' ? 'bg-[#E5A93C] text-[#0B0F1D]' : 'text-slate-300 hover:text-white'
          }`}
        >
          Today's Dashboard
        </button>
      </div>

      {/* Viewport */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          leads={leads}
          stages={[
            { id: 'stage-1', tenant_id: 't-1', name: 'New', sort_order: 1, color: '#3b82f6' },
            { id: 'stage-2', tenant_id: 't-1', name: 'Contacted', sort_order: 2, color: '#f59e0b' },
            { id: 'stage-3', tenant_id: 't-1', name: 'Qualified', sort_order: 3, color: '#8b5cf6' },
            { id: 'stage-4', tenant_id: 't-1', name: 'Won', sort_order: 4, color: '#10b981' },
            { id: 'stage-5', tenant_id: 't-1', name: 'Lost', sort_order: 5, color: '#ef4444' },
          ]}
          onLeadClick={(lead: CrmLead) => {
            setSelectedLead(lead);
            setIsDrawerOpen(true);
          }}
          onLeadStageChange={handleStageChange}
        />
      )}

      {activeTab === 'list' && (
        <DataTable
          columns={listColumns}
          data={leads}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search leads by name, company, or owner..."
        />
      )}

      {activeTab === 'today' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h3 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Today's Scheduled Followups & Overdue Tasks
            </h3>
            <Badge variant="amber">2 Action Items</Badge>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-dark-surface/60 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-100 text-xs">Followup: Call Priya Sharma (Fintech Corp)</div>
                <div className="text-2xs text-slate-400 font-mono">Due: Today 04:00 PM • Owner: Alex Vance</div>
              </div>
              <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(true)}>Call Lead</Button>
            </div>

            <div className="p-3 bg-dark-surface/60 rounded-xl border border-dark-border/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-100 text-xs">Send Proposal: Rajesh Traders</div>
                <div className="text-2xs text-slate-400 font-mono">Due: Today 06:30 PM • Owner: Priya Sharma</div>
              </div>
              <Button variant="secondary" size="sm">Open Deal</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lead Detail Memory Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={selectedLead}
        onUpdateLead={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        }}
        onRemoveLead={handleRemoveLead}
      />

      {/* Bulk Lead Importer Modal */}
      <BulkLeadImporterModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportSuccess={handleBulkImportSuccess}
      />

      {/* Create New Lead Modal */}
      <Modal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        title="Create New Sales Pipeline Lead"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsNewLeadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateLead}>Save Lead</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Lead Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Priya Sharma" />
          <Input label="Company Name" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Fintech Corp" />
          <Input label="Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 98200 12345" />
          <Input label="Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="priya@fintechcorp.in" />
          <Select
            label="Initial Stage"
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            options={[
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Won', label: 'Won' },
              { value: 'Lost', label: 'Lost' },
            ]}
          />
          <Input label="Estimated Value (INR ₹)" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="450000" />
        </div>
      </Modal>
    </div>
  );
};
