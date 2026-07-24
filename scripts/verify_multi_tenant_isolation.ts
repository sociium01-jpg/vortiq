// ─────────────────────────────────────────────────────────────
// Vortiq Multi-Tenant RLS & Data Isolation Verification Test
// Validates strict tenant-scoping for Sales Pipeline entities
// ─────────────────────────────────────────────────────────────

import { getStoredData, saveStoredData, getTenantScopedKey } from '../src/lib/dataStore';
import { CrmLead, WorkflowRule, OutreachSequence } from '../src/modules/crm/types';

function runMultiTenantIsolationTest() {
  console.log('--------------------------------------------------');
  console.log('RUNNING VORTIQ MULTI-TENANT ISOLATION AUDIT TEST');
  console.log('--------------------------------------------------');

  const tenantA = 'tenant-prod-001'; // Org A: ORG-9901-VTQ
  const tenantB = 'tenant-org-4819'; // Org B: ORG-4819-APE

  // 1. Create Lead in Org A
  const leadOrgA: CrmLead = {
    id: 'lead-test-org-a',
    organization_id: tenantA,
    title: 'Confidential Enterprise Deal Org A',
    name: 'Vikram Sharma',
    contact_person: 'Vikram Sharma',
    company_name: 'Apex Org A',
    stage: 'qualified',
    stage_id: 'qualified',
    estimated_value: 500000,
    currency: 'INR',
    notes_count: 1,
    calls_count: 0,
    followups_count: 0,
    open_followups_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 2. Create Lead in Org B
  const leadOrgB: CrmLead = {
    id: 'lead-test-org-b',
    organization_id: tenantB,
    title: 'Private SME Deal Org B',
    name: 'Rajesh Patel',
    contact_person: 'Rajesh Patel',
    company_name: 'Patel Org B',
    stage: 'new',
    stage_id: 'new',
    estimated_value: 150000,
    currency: 'INR',
    notes_count: 0,
    calls_count: 0,
    followups_count: 0,
    open_followups_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Save data into tenant-scoped storage
  saveStoredData('vortiq_leads_v2', [leadOrgA], tenantA);
  saveStoredData('vortiq_leads_v2', [leadOrgB], tenantB);

  // 3. Query leads as Tenant A
  const queriedLeadsA = getStoredData<CrmLead>('vortiq_leads_v2', [], tenantA);
  console.log(`Tenant A Query Count: ${queriedLeadsA.length}`);
  console.log(`Tenant A Lead Title: ${queriedLeadsA[0]?.title}`);

  // 4. Query leads as Tenant B
  const queriedLeadsB = getStoredData<CrmLead>('vortiq_leads_v2', [], tenantB);
  console.log(`Tenant B Query Count: ${queriedLeadsB.length}`);
  console.log(`Tenant B Lead Title: ${queriedLeadsB[0]?.title}`);

  // Assertions
  const leakDetected = queriedLeadsA.some((l) => l.organization_id !== tenantA) ||
                       queriedLeadsB.some((l) => l.organization_id !== tenantB);

  if (leakDetected) {
    console.error('❌ MULTI-TENANT LEAK DETECTED! Cross-tenant access occurred.');
    process.exit(1);
  } else {
    console.log('✅ MULTI-TENANT ISOLATION VERIFIED 100%! Zero cross-tenant data leaks detected.');
  }
}

runMultiTenantIsolationTest();
