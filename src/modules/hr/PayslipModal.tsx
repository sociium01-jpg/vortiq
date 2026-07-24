import React, { useState, useEffect } from 'react';
import {
  EmployeeWithUser,
  PayslipDetails,
  formatPaiseToRupees,
  maskSensitiveField,
} from './types';
import {
  Modal,
  Button,
  Select,
  Input,
  Badge,
} from '@/design-system';
import {
  Printer,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeWithUser | null;
  onDisbursePayslip?: (payslip: PayslipDetails) => void;
}

// Convert numbers in INR to words (helper for payslip footer)
function numberToWordsINR(amount: number): string {
  if (!amount || amount === 0) return 'Rupees Zero Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? units[n % 10] + ' ' : '');
    return units[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertLessThanThousand(n % 100) : '');
  };

  let num = Math.floor(amount);
  let words = '';

  if (Math.floor(num / 10000000) > 0) {
    words += convertLessThanThousand(Math.floor(num / 10000000)) + 'Crore ';
    num %= 10000000;
  }
  if (Math.floor(num / 100000) > 0) {
    words += convertLessThanThousand(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }
  if (Math.floor(num / 1000) > 0) {
    words += convertLessThanThousand(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    words += convertLessThanThousand(num);
  }

  return `Rupees ${words.trim()} Only`;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  employee,
  onDisbursePayslip,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [lwpDays, setLwpDays] = useState<number>(0);
  const [customTdsPaise, setCustomTdsPaise] = useState<number>(0);
  const [isDisbursed, setIsDisbursed] = useState<boolean>(false);

  // Reset state when employee changes
  useEffect(() => {
    if (employee) {
      const grossP = employee.gross_salary_paise || (employee.ctc_annual || 0) * 100 / 12;
      const defaultTds = grossP > 5000000 ? Math.round(grossP * 0.05) : 0;
      setCustomTdsPaise(defaultTds);
      setIsDisbursed(false);
    }
  }, [employee]);

  if (!employee) return null;

  // Calculate earnings & deductions in INR Paise
  const basicSalaryPaise = employee.basic_salary_paise || 0;
  const hraPaise = employee.hra_paise || 0;
  const specialAllowancePaise = employee.special_allowance_paise || 0;
  const grossSalaryPaise = employee.gross_salary_paise || (basicSalaryPaise + hraPaise + specialAllowancePaise);

  // Statutory PF: 12% of Basic
  const pfEmployeePaise = employee.pf_applicable ? Math.round(basicSalaryPaise * 0.12) : 0;

  // ESI: 0.75% of Gross if applicable
  const esiEmployeePaise = employee.esi_applicable ? Math.round(grossSalaryPaise * 0.0075) : 0;

  // Professional Tax (PT): Fixed ₹200 / month = 20,000 paise
  const ptPaise = employee.pt_applicable ? 20000 : 0;

  // TDS
  const tdsPaise = customTdsPaise;

  // Total Deductions
  const totalDeductionsPaise = pfEmployeePaise + esiEmployeePaise + ptPaise + tdsPaise;

  // Net Salary
  const netSalaryPaise = Math.max(0, grossSalaryPaise - totalDeductionsPaise);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDisburse = () => {
    setIsDisbursed(true);
    const details: PayslipDetails = {
      id: `ps-${employee.id}-${year}-${month}`,
      employee,
      pay_period_month: month,
      pay_period_year: year,
      days_in_month: 30,
      days_worked: 30 - lwpDays,
      leave_without_pay_days: lwpDays,
      basic_salary_paise: basicSalaryPaise,
      hra_paise: hraPaise,
      special_allowance_paise: specialAllowancePaise,
      gross_salary_paise: grossSalaryPaise,
      pf_employee_paise: pfEmployeePaise,
      esi_employee_paise: esiEmployeePaise,
      pt_paise: ptPaise,
      tds_paise: tdsPaise,
      total_deductions_paise: totalDeductionsPaise,
      net_salary_paise: netSalaryPaise,
      status: 'disbursed',
      disbursed_at: new Date().toISOString(),
    };
    onDisbursePayslip?.(details);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payslip Statement: ${employee.full_name}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            {isDisbursed ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Salary Disbursed
              </span>
            ) : (
              <span>Status: <strong className="text-amber-400">Draft Calculation</strong></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5 text-slate-300" />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-dark-bg" />}
              onClick={handleDisburse}
              disabled={isDisbursed}
            >
              {isDisbursed ? 'Disbursed' : 'Approve & Disburse'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-dark-surface/80 p-3 rounded-xl border border-dark-border">
          <Select
            label="Pay Period Month"
            options={monthNames.map((m, idx) => ({ value: String(idx + 1), label: m }))}
            value={String(month)}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-xs"
          />
          <Select
            label="Pay Period Year"
            options={[
              { value: '2026', label: '2026' },
              { value: '2025', label: '2025' },
            ]}
            value={String(year)}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-xs"
          />
          <Input
            label="LWP Days (Unpaid Leave)"
            type="number"
            min={0}
            max={31}
            value={lwpDays}
            onChange={(e) => setLwpDays(Number(e.target.value))}
            className="text-xs font-mono"
          />
        </div>

        {/* Payslip Document Preview Container */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6 shadow-2xl printable-payslip">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-dark-border gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-dark-bg font-extrabold flex items-center justify-center font-display text-lg">
                  V
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 font-display uppercase tracking-wide">
                    Vortiq Tech Solutions India Pvt Ltd
                  </h2>
                  <p className="text-2xs text-slate-400">
                    Registered Office: Tower B, Cyber City, Gurugram, Haryana - 122002 • CIN: U72900HR2025PTC11899
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right sm:text-right">
              <Badge variant="blue" size="md">
                PAYSLIP FOR {monthNames[month - 1].toUpperCase()} {year}
              </Badge>
              <div className="text-2xs text-slate-400 font-mono mt-1">
                Generated: {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-dark-surface/60 border border-dark-border/80 text-xs">
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Employee Name</span>
              <span className="font-semibold text-slate-100">{employee.full_name}</span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Employee Code</span>
              <span className="font-mono text-brand-400">{employee.employee_code}</span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Designation</span>
              <span className="text-slate-200">{employee.designation}</span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Department</span>
              <span className="text-slate-200">{employee.department}</span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">PAN Card</span>
              <span className="font-mono text-slate-300">
                {employee.is_pan_revealed ? employee.pan_unmasked : maskSensitiveField(employee.pan_unmasked || employee.pan_masked)}
              </span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Bank Account</span>
              <span className="font-mono text-slate-300">
                {employee.is_bank_revealed ? employee.bank_account_unmasked : maskSensitiveField(employee.bank_account_unmasked || employee.bank_account_masked)}
              </span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Bank & IFSC</span>
              <span className="text-slate-300">{employee.bank_name || 'HDFC Bank'} ({employee.bank_ifsc || 'HDFC0001234'})</span>
            </div>
            <div>
              <span className="text-2xs uppercase text-slate-400 block font-semibold">Working Days / LWP</span>
              <span className="font-mono text-slate-300">{30 - lwpDays} Days / {lwpDays} LWP</span>
            </div>
          </div>

          {/* Breakdown Table: Earnings vs Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings Column */}
            <div className="border border-dark-border/80 rounded-xl overflow-hidden bg-dark-surface/30">
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 font-semibold text-xs text-emerald-400 uppercase tracking-wider flex justify-between">
                <span>Earnings Description</span>
                <span>Amount (INR)</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-dark-border/40 text-slate-300">
                  <tr>
                    <td className="px-4 py-2">Basic Salary</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(basicSalaryPaise)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">House Rent Allowance (HRA)</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(hraPaise)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Special Allowance</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(specialAllowancePaise)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-500/5 font-semibold text-slate-100">
                    <td className="px-4 py-2.5">Total Gross Earnings</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-400 text-sm">
                      {formatPaiseToRupees(grossSalaryPaise)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Column */}
            <div className="border border-dark-border/80 rounded-xl overflow-hidden bg-dark-surface/30">
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 font-semibold text-xs text-rose-400 uppercase tracking-wider flex justify-between">
                <span>Statutory Deductions</span>
                <span>Amount (INR)</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-dark-border/40 text-slate-300">
                  <tr>
                    <td className="px-4 py-2 flex items-center justify-between">
                      <span>Provident Fund (PF - 12% Basic)</span>
                      {employee.pf_applicable ? (
                        <span className="text-2xs text-emerald-400 font-mono">Applicable</span>
                      ) : (
                        <span className="text-2xs text-slate-500 font-mono">Exempt</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(pfEmployeePaise)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 flex items-center justify-between">
                      <span>Employee State Insurance (ESI)</span>
                      {employee.esi_applicable ? (
                        <span className="text-2xs text-emerald-400 font-mono">Applicable</span>
                      ) : (
                        <span className="text-2xs text-slate-500 font-mono">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(esiEmployeePaise)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 flex items-center justify-between">
                      <span>Professional Tax (PT)</span>
                      {employee.pt_applicable ? (
                        <span className="text-2xs text-emerald-400 font-mono">₹200/mo</span>
                      ) : (
                        <span className="text-2xs text-slate-500 font-mono">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(ptPaise)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Tax Deducted at Source (TDS)</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-200">
                      {formatPaiseToRupees(tdsPaise)}
                    </td>
                  </tr>
                  <tr className="bg-rose-500/5 font-semibold text-slate-100">
                    <td className="px-4 py-2.5">Total Deductions</td>
                    <td className="px-4 py-2.5 text-right font-mono text-rose-400 text-sm">
                      {formatPaiseToRupees(totalDeductionsPaise)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-emerald-500/20 border border-brand-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-2xs uppercase tracking-wider font-semibold text-brand-300 block">
                Net Salary Payable (Take-Home)
              </span>
              <div className="text-xs font-medium text-slate-300 mt-1 italic">
                {numberToWordsINR(netSalaryPaise / 100)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-brand-400 tracking-tight">
                {formatPaiseToRupees(netSalaryPaise)}
              </span>
              <span className="text-2xs text-slate-400 block font-mono">
                Direct Transfer to {employee.bank_name || 'Bank Account'}
              </span>
            </div>
          </div>

          {/* Authorization Footer */}
          <div className="pt-4 border-t border-dark-border flex items-center justify-between text-2xs text-slate-400">
            <div>
              <p>This is a system generated computer payslip and does not require a physical signature.</p>
              <p className="font-mono text-slate-500 mt-0.5">Vortiq HRMS Module E Compliance Validated</p>
            </div>
            <div className="text-right font-mono">
              <div className="font-semibold text-slate-300">Authorized Signatory</div>
              <div className="text-slate-500">HR & Payroll Dept</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
