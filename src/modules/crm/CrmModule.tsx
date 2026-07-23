import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Avatar,
  Modal,
  DataTable,
  Column,
  EmptyState,
  Toast,
} from '@/design-system';
import {
  CrmLead,
  CrmPipelineStage,
  CrmActivity,
  DEFAULT_PIPELINE_STAGES,
  INITIAL_MOCK_LEADS,
  INITIAL_MOCK_ACTIVITIES,
  NewLeadFormData,
  NewActivityFormData,
  LeadPriority,
} from './types';
import { KanbanBoard } from './KanbanBoard';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import {
  Kanban,
  List,
  Activity,
  Plus,
  Search,
  IndianRupee,
  TrendingUp,
  Target,
  Trophy,
  Building2,
  Clock,
  PhoneCall,
  Users,
  Mail,
  FileText,
  GitCommit,
} from 'lucide-react';

export const CrmModule: React.FC = () => {
  // State
  const [stages] = useState<CrmPipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [leads, setLeads] = useState<CrmLead[]>(INITIAL_MOCK_LEADS);
  const [activities, setActivities] = useState<CrmActivity[]>(INITIAL_MOCK_ACTIVITIES);

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'activities'>('kanban');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  // Toast State
  const [toast, setToast] = useState<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string } | null>(null);

  // New Lead Form State
  const [newLeadData, setNewLeadData] = useState<NewLeadFormData>({
    title: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    estimated_value: 500000,
    stage_id: 'stage-new',
    priority: 'medium',
    assigned_to_name: 'Ananya Roy',
    probability: 50,
    expected_close_date: '2026-09-30',
  });

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      message,
    });
  };

  // Helper: Currency Formatter
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metrics Calculations
  const totalPipelineValue = leads
    .filter((l) => l.status !== 'lost')
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  const activeLeadsCount = leads.filter((l) => l.status === 'open').length;
  
  const wonLeads = leads.filter((l) => l.status === 'won');
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  
  const totalClosedDeals = leads.filter((l) => l.status === 'won' || l.status === 'lost').length;
  const winRate = totalClosedDeals > 0 ? Math.round((wonLeads.length / totalClosedDeals) * 100) : 0;

  // Handlers
  const handleStageChange = (leadId: string, newStageId: string) => {
    const stageObj = stages.find((s) => s.id === newStageId);
    let newStatus: CrmLead['status'] = 'open';
    if (newStageId === 'stage-won') newStatus = 'won';
    if (newStageId === 'stage-lost') newStatus = 'lost';

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const updated = {
            ...lead,
            stage_id: newStageId,
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
          if (selectedLead?.id === leadId) {
            setSelectedLead(updated);
          }
          return updated;
        }
        return lead;
      })
    );

    // Log Activity
    const targetLead = leads.find((l) => l.id === leadId);
    const newAct: CrmActivity = {
      id: `act-${Date.now()}`,
      tenant_id: 'tenant-demo',
      lead_id: leadId,
      lead_title: targetLead?.title,
      company_name: targetLead?.company_name,
      activity_type: 'stage_change',
      title: `Stage changed to ${stageObj?.name || newStageId}`,
      notes: `Lead pipeline stage was updated in Kanban board.`,
      performed_by: 'Current User',
      created_at: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev]);

    showToast('Lead Stage Updated', `Moved to ${stageObj?.name || 'new stage'}`);
  };

  const handleStatusChange = (leadId: string, newStatus: 'open' | 'won' | 'lost' | 'nurture') => {
    let targetStageId = 'stage-new';
    if (newStatus === 'won') targetStageId = 'stage-won';
    if (newStatus === 'lost') targetStageId = 'stage-lost';

    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const updated = {
            ...lead,
            status: newStatus,
            stage_id: targetStageId,
            updated_at: new Date().toISOString(),
          };
          if (selectedLead?.id === leadId) {
            setSelectedLead(updated);
          }
          return updated;
        }
        return lead;
      })
    );

    showToast('Status Updated', `Lead marked as ${newStatus.toUpperCase()}`);
  };

  const handleAddActivity = (leadId: string, data: NewActivityFormData) => {
    const targetLead = leads.find((l) => l.id === leadId);
    const newAct: CrmActivity = {
      id: `act-${Date.now()}`,
      tenant_id: 'tenant-demo',
      lead_id: leadId,
      lead_title: targetLead?.title,
      company_name: targetLead?.company_name,
      activity_type: data.activity_type,
      title: data.title,
      notes: data.notes,
      performed_by: 'Current User',
      created_at: new Date().toISOString(),
    };

    setActivities((prev) => [newAct, ...prev]);

    // Update notes count on lead
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              notes_count: (l.notes_count || 0) + 1,
              last_contacted_at: new Date().toISOString(),
            }
          : l
      )
    );

    showToast('Activity Logged', `${data.activity_type.toUpperCase()}: ${data.title}`);
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadData.title || !newLeadData.contact_person) {
      showToast('Validation Error', 'Title and Contact Person are required.', 'error');
      return;
    }

    const createdLead: CrmLead = {
      id: `lead-${Date.now()}`,
      tenant_id: 'tenant-demo',
      title: newLeadData.title,
      company_name: newLeadData.company_name,
      contact_person: newLeadData.contact_person,
      email: newLeadData.email,
      phone: newLeadData.phone,
      estimated_value: Number(newLeadData.estimated_value) || 0,
      currency: 'INR',
      stage_id: newLeadData.stage_id,
      assigned_to_name: newLeadData.assigned_to_name,
      status: 'open',
      priority: newLeadData.priority,
      probability: newLeadData.probability,
      expected_close_date: newLeadData.expected_close_date,
      notes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLeads((prev) => [createdLead, ...prev]);
    setIsNewLeadModalOpen(false);

    // Reset Form
    setNewLeadData({
      title: '',
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      estimated_value: 500000,
      stage_id: 'stage-new',
      priority: 'medium',
      assigned_to_name: 'Ananya Roy',
      probability: 50,
      expected_close_date: '2026-09-30',
    });

    showToast('New Lead Created', `${createdLead.title} added to pipeline`);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      searchTerm === '' ||
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.company_name && l.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.contact_person.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || l.stage_id === stageFilter;

    return matchesSearch && matchesStage;
  });

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.activity_type === activityFilter;
  });

  // Data Table Columns for List View
  const listColumns: Column<CrmLead>[] = [
    {
      key: 'title',
      header: 'Lead / Title',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-100 font-display hover:text-brand-400 transition-colors">
            {item.title}
          </div>
          {item.company_name && (
            <div className="text-2xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-500" />
              {item.company_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'contact_person',
      header: 'Contact Person',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-slate-200">{item.contact_person}</div>
          <div className="text-2xs text-slate-400 font-mono">{item.phone || item.email}</div>
        </div>
      ),
    },
    {
      key: 'stage_id',
      header: 'Pipeline Stage',
      sortable: true,
      render: (item) => {
        const s = stages.find((st) => st.id === item.stage_id);
        return <Badge variant={s?.badgeVariant || 'blue'}>{s?.name || item.stage_id}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.status === 'won'
              ? 'emerald'
              : item.status === 'lost'
              ? 'rose'
              : item.status === 'nurture'
              ? 'amber'
              : 'blue'
          }
          dot
        >
          {item.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'estimated_value',
      header: 'Est. Value (INR)',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-bold text-emerald-400">
          {formatINR(item.estimated_value || 0)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.priority === 'urgent'
              ? 'rose'
              : item.priority === 'high'
              ? 'amber'
              : item.priority === 'medium'
              ? 'blue'
              : 'slate'
          }
        >
          {item.priority || 'medium'}
        </Badge>
      ),
    },
    {
      key: 'assigned_to_name',
      header: 'Owner',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Avatar name={item.assigned_to_name || 'Unassigned'} size="sm" />
          <span className="text-2xs font-medium text-slate-300">
            {item.assigned_to_name || 'Unassigned'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* CRM Metric Hero Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-2">
            {formatINR(totalPipelineValue)}
          </div>
          <p className="text-3xs text-emerald-400 mt-1 font-mono">Active pipeline value in INR</p>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
              Active Open Leads
            </span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2">{activeLeadsCount} Leads</div>
          <p className="text-3xs text-blue-400 mt-1 font-mono">In active sales workflow</p>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
              Closed Won Value
            </span>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-violet-300 mt-2">
            {formatINR(wonValue)}
          </div>
          <p className="text-3xs text-violet-400 mt-1 font-mono">{wonLeads.length} deals closed won</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
              Pipeline Win Rate
            </span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-100 mt-2 font-mono">{winRate}%</div>
          <p className="text-3xs text-amber-400 mt-1 font-mono">Based on closed outcomes</p>
        </Card>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-card p-4 rounded-xl border border-dark-border/80 shadow-md">
        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-lg border border-dark-border/60">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'kanban'
                ? 'bg-brand-500 text-dark-bg shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban Board
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-brand-500 text-dark-bg shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'activities'
                ? 'bg-brand-500 text-dark-bg shadow'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Activity Log
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab !== 'activities' && (
            <>
              {/* Search Bar */}
              <div className="w-48 sm:w-64">
                <Input
                  placeholder="Search leads, companies..."
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-1.5 text-xs"
                />
              </div>

              {/* Stage Filter */}
              <div className="w-36 sm:w-44">
                <Select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Stages' },
                    ...stages.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  className="py-1.5 text-xs"
                />
              </div>
            </>
          )}

          {activeTab === 'activities' && (
            <div className="w-44">
              <Select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Activity Types' },
                  { value: 'call', label: 'Calls' },
                  { value: 'meeting', label: 'Meetings' },
                  { value: 'note', label: 'Notes' },
                  { value: 'email', label: 'Emails' },
                  { value: 'stage_change', label: 'Stage Changes' },
                ]}
                className="py-1.5 text-xs"
              />
            </div>
          )}

          {/* New Lead Action Button */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsNewLeadModalOpen(true)}
          >
            Create Lead
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          stages={stages}
          leads={filteredLeads}
          onLeadClick={(lead) => {
            setSelectedLead(lead);
            setIsDrawerOpen(true);
          }}
          onLeadStageChange={handleStageChange}
          onAddLeadToStage={(stageId) => {
            setNewLeadData((prev) => ({ ...prev, stage_id: stageId }));
            setIsNewLeadModalOpen(true);
          }}
        />
      )}

      {activeTab === 'list' && (
        <DataTable
          columns={listColumns}
          data={filteredLeads}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => {
            setSelectedLead(item);
            setIsDrawerOpen(true);
          }}
          searchPlaceholder="Search leads in table..."
          emptyTitle="No CRM Leads Found"
          emptyDescription="Try adjusting your search query or stage filters, or create a new lead."
        />
      )}

      {activeTab === 'activities' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                Global CRM Activity Stream
              </h3>
              <p className="text-xs text-slate-400">
                Log of calls, meetings, notes, and stage updates across all customer pipelines
              </p>
            </div>
            <Badge variant="blue">{filteredActivities.length} Total Logs</Badge>
          </div>

          {filteredActivities.length === 0 ? (
            <EmptyState
              title="No Activities Logged"
              description="Activities logged on individual leads will appear here in chronological order."
            />
          ) : (
            <div className="divide-y divide-dark-border/50">
              {filteredActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-4 hover:bg-dark-surface/30 p-2 rounded-lg transition-colors">
                  <div className="p-2 bg-dark-surface rounded-xl border border-dark-border/60 shrink-0">
                    {act.activity_type === 'call' && <PhoneCall className="w-4 h-4 text-emerald-400" />}
                    {act.activity_type === 'meeting' && <Users className="w-4 h-4 text-blue-400" />}
                    {act.activity_type === 'email' && <Mail className="w-4 h-4 text-amber-400" />}
                    {act.activity_type === 'note' && <FileText className="w-4 h-4 text-slate-400" />}
                    {act.activity_type === 'stage_change' && <GitCommit className="w-4 h-4 text-violet-400" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-100 font-display">
                        {act.title}
                      </div>
                      <span className="text-2xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(act.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {act.notes && <p className="text-xs text-slate-300">{act.notes}</p>}

                    <div className="flex items-center gap-3 text-3xs text-slate-400 pt-0.5">
                      {act.lead_title && (
                        <span className="text-brand-400 font-medium">
                          Lead: {act.lead_title}
                        </span>
                      )}
                      <span>
                        Logged by: <strong className="text-slate-200">{act.performed_by}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={selectedLead}
        stages={stages}
        activities={activities}
        onStageChange={handleStageChange}
        onStatusChange={handleStatusChange}
        onAddActivity={handleAddActivity}
      />

      {/* New Lead Creation Modal */}
      <Modal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        title="Create New B2B CRM Lead"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsNewLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateLeadSubmit}>
              Create Lead
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateLeadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lead / Deal Title"
              placeholder="e.g. Tata Steel ERP Suite"
              value={newLeadData.title}
              onChange={(e) => setNewLeadData({ ...newLeadData, title: e.target.value })}
              required
            />

            <Input
              label="Company / Enterprise Name"
              placeholder="e.g. Tata Steel Ltd"
              value={newLeadData.company_name}
              onChange={(e) => setNewLeadData({ ...newLeadData, company_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Person Name"
              placeholder="e.g. Vikram Sharma"
              value={newLeadData.contact_person}
              onChange={(e) => setNewLeadData({ ...newLeadData, contact_person: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="v.sharma@tatasteel.com"
              value={newLeadData.email}
              onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={newLeadData.phone}
              onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Estimated Value (INR ₹)"
              type="number"
              placeholder="1500000"
              value={newLeadData.estimated_value}
              onChange={(e) => setNewLeadData({ ...newLeadData, estimated_value: Number(e.target.value) })}
              leftIcon={<IndianRupee className="w-3.5 h-3.5" />}
            />

            <Select
              label="Initial Stage"
              value={newLeadData.stage_id}
              onChange={(e) => setNewLeadData({ ...newLeadData, stage_id: e.target.value })}
              options={stages.map((s) => ({ value: s.id, label: s.name }))}
            />

            <Select
              label="Priority Level"
              value={newLeadData.priority}
              onChange={(e) => setNewLeadData({ ...newLeadData, priority: e.target.value as LeadPriority })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Win Probability (%)"
              type="number"
              min={0}
              max={100}
              value={newLeadData.probability}
              onChange={(e) => setNewLeadData({ ...newLeadData, probability: Number(e.target.value) })}
            />

            <Input
              label="Target Close Date"
              type="date"
              value={newLeadData.expected_close_date}
              onChange={(e) => setNewLeadData({ ...newLeadData, expected_close_date: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default CrmModule;
