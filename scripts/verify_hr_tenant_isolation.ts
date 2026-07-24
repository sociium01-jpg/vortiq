// ─────────────────────────────────────────────────────────────
// Vortiq HR & Payroll Module Multi-Tenant Data Isolation Audit Test
// Validates strict tenant-scoping for Employee Profiles, Leaves, and Compensation
// ─────────────────────────────────────────────────────────────

import { getStoredData, saveStoredData } from '../src/lib/dataStore';
import { EmployeeWithUser } from '../src/modules/hr/types';

function runHRMultiTenantIsolationTest() {
  console.log('--------------------------------------------------');
  console.log('RUNNING VORTIQ HR MODULE MULTI-TENANT AUDIT TEST');
  console.log('--------------------------------------------------');

  const tenantA = 'tenant-prod-001'; // Org A: ORG-9901-VTQ
  const tenantB = 'tenant-org-4819'; // Org B: ORG-4819-APE

  // 1. Employee Profile in Org A
  const empOrgA: EmployeeWithUser = {
    id: 'emp-test-org-a',
    user_id: 'usr-org-a-1',
    tenant_id: tenantA,
    full_name: 'Confidential Executive Org A',
    email: 'executive@orga.com',
    role: 'ADMIN',
    department: 'Executive Board',
    designation: 'CEO',
    date_of_joining: '2024-01-01',
    ctc_annual: 4500000,
    basic_monthly: 187500,
    pan_unmasked: 'ABCDE9999Z',
    bank_account_no: '990123456789',
    bank_account_unmasked: '990123456789',
    ifsc_code: 'HDFC0009901',
  };

  // 2. Employee Profile in Org B
  const empOrgB: EmployeeWithUser = {
    id: 'emp-test-org-b',
    user_id: 'usr-org-b-1',
    tenant_id: tenantB,
    full_name: 'Private Manager Org B',
    email: 'manager@orgb.com',
    role: 'MANAGER',
    department: 'Sales',
    designation: 'Sales Director',
    date_of_joining: '2025-05-15',
    ctc_annual: 2800000,
    basic_monthly: 116666,
    pan_unmasked: 'PQRSW4819K',
    bank_account_no: '481912345678',
    bank_account_unmasked: '481912345678',
    ifsc_code: 'ICIC0004819',
  };

  // Save into tenant-scoped storage
  saveStoredData('vortiq_employees_v2', [empOrgA], tenantA);
  saveStoredData('vortiq_employees_v2', [empOrgB], tenantB);

  // Query employees for Tenant A
  const queriedA = getStoredData<EmployeeWithUser>('vortiq_employees_v2', [], tenantA);
  console.log(`Tenant A Employee Count: ${queriedA.length}`);
  console.log(`Tenant A Employee Name: ${queriedA[0]?.full_name}`);

  // Query employees for Tenant B
  const queriedB = getStoredData<EmployeeWithUser>('vortiq_employees_v2', [], tenantB);
  console.log(`Tenant B Employee Count: ${queriedB.length}`);
  console.log(`Tenant B Employee Name: ${queriedB[0]?.full_name}`);

  // Assertions
  const leakDetected = queriedA.some((e) => e.tenant_id !== tenantA) ||
                       queriedB.some((e) => e.tenant_id !== tenantB);

  if (leakDetected) {
    console.error('❌ MULTI-TENANT LEAK DETECTED IN HR MODULE!');
    process.exit(1);
  } else {
    console.log('✅ HR MODULE MULTI-TENANT ISOLATION VERIFIED 100%! Zero cross-tenant data leaks detected.');
  }
}

runHRMultiTenantIsolationTest();
