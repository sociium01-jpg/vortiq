// ─────────────────────────────────────────────────────────────
// Vortiq Employee Document Vault & Expiry Reminders
// Passport, Visa, ID Proofs, and Certification Renewal Alerts
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Select } from '@/design-system';
import { HRDocument, SEED_HR_DOCUMENTS, EmployeeWithUser } from './types';
import { FileText, AlertTriangle, Plus } from 'lucide-react';

export interface DocumentVaultModuleProps {
  employees: EmployeeWithUser[];
}

export const DocumentVaultModule: React.FC<DocumentVaultModuleProps> = ({ employees }) => {
  const [documents, setDocuments] = useState<HRDocument[]>(SEED_HR_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Doc Form
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.user_id || '');
  const [docType, setDocType] = useState('US B1/B2 Visa');
  const [fileName, setFileName] = useState('Alex_Vance_US_Visa_2026.pdf');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Requires renewal before Q4 travel');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.user_id === selectedEmpId);
    const exp = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((exp.getTime() - Date.now()) / 86400000);

    const newDoc: HRDocument = {
      id: `doc-${Date.now()}`,
      tenant_id: 'tenant-prod-001',
      employee_id: selectedEmpId,
      employee_name: emp?.full_name || 'Team Member',
      doc_type: docType,
      file_name: fileName,
      expiry_date: expiryDate,
      is_expiring_soon: daysUntilExpiry <= 30,
      notes: notes,
      created_at: new Date().toISOString(),
    };

    setDocuments([newDoc, ...documents]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Document Vault Table */}
      <Card className="p-5 bg-dark-card border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              Employee Document Vault & Expiry Tracker ({documents.length})
            </h4>
            <p className="text-2xs text-slate-400 mt-0.5">Central repository for Offer Letters, Passports, Visas, and Certifications</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Upload Document
          </Button>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 bg-dark-surface/60 rounded-xl border border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-display">{doc.file_name}</span>
                  <Badge variant="violet" size="sm" className="font-mono">{doc.doc_type}</Badge>
                  {doc.is_expiring_soon && (
                    <Badge variant="rose" size="sm" className="font-mono flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" /> Expiring Soon!
                    </Badge>
                  )}
                </div>
                <p className="text-2xs text-slate-300 font-mono">Employee: {doc.employee_name}</p>
                {doc.notes && <p className="text-2xs text-slate-400 font-mono">Notes: {doc.notes}</p>}
              </div>

              <div className="text-right text-2xs font-mono">
                <span className="text-slate-400 block">Expiry Date</span>
                <span className={`font-bold ${doc.is_expiring_soon ? 'text-rose-400' : 'text-slate-200'}`}>
                  {doc.expiry_date || 'No Expiry'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Upload Employee Document & Set Expiry Reminder"
          maxWidth="md"
        >
          <form onSubmit={handleAddDocument} className="space-y-4">
            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Employee</label>
              <Select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                options={employees.map((e) => ({ value: e.user_id, label: `${e.full_name} (${e.department})` }))}
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Document Type</label>
              <Input
                type="text"
                placeholder="US B1/B2 Visa"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">File Name</label>
              <Input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Document Expiry Date</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Renewal Notes & Reminders</label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button variant="primary" size="md" className="w-full" type="submit" leftIcon={<FileText className="w-4 h-4" />}>
              Save Document to Vault
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
