import type { ComplianceDeadline } from '@/components/compliance/compliance-calendar';

// Helper to generate monthly deadlines for a year
function generateMonthlyDeadlines(
  year: number,
  baseId: string,
  name: string,
  category: ComplianceDeadline['category'],
  dayOfMonth: number = 15
): ComplianceDeadline[] {
  const deadlines: ComplianceDeadline[] = [];
  
  for (let month = 1; month <= 12; month++) {
    // For monthly deadlines, they're due on the 15th of the following month
    const dueMonth = month === 12 ? 1 : month + 1;
    const dueYear = month === 12 ? year + 1 : year;
    
    const dueDate = new Date(dueYear, dueMonth - 1, dayOfMonth);
    const periodMonth = month < 10 ? `0${month}` : `${month}`;
    
    deadlines.push({
      id: `${baseId}-${year}-${periodMonth}`,
      name: `${name} - ${getMonthName(month)} ${year}`,
      description: `Submit ${name} for ${getMonthName(month)} ${year}`,
      dueDate,
      category,
      recurrence: 'monthly',
      status: determineStatus(dueDate),
      legalReference: getReference(category),
      penalty: getPenalty(category),
    });
  }
  
  return deadlines;
}

function getMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
}

function determineStatus(dueDate: Date): ComplianceDeadline['status'] {
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'ready';
  if (diffDays <= 7) return 'draft';
  return 'draft';
}

function getReference(category: ComplianceDeadline['category']): string {
  const references: Record<string, string> = {
    EPF: 'EPF Act 1991, Section 43(2)',
    SOCSO: 'SOCSO Act 1969, Section 52',
    LHDN: 'Income Tax Act 1967, Section 107C',
    EIS: 'Employment Insurance System Act 2017',
    Custom: '',
  };
  return references[category] || '';
}

function getPenalty(category: ComplianceDeadline['category']): string {
  const penalties: Record<string, string> = {
    EPF: 'Fine up to RM 10,000 or imprisonment up to 3 years',
    SOCSO: 'Fine up to RM 10,000 or imprisonment up to 2 years',
    LHDN: 'Fine up to RM 20,000 or imprisonment up to 6 months',
    EIS: 'Fine up to RM 10,000 or imprisonment up to 2 years',
    Custom: '',
  };
  return penalties[category] || '';
}

export function getMalaysianComplianceDeadlines2025(): ComplianceDeadline[] {
  const year = 2025;
  const deadlines: ComplianceDeadline[] = [];

  // Monthly deadlines (due 15th of following month)
  deadlines.push(...generateMonthlyDeadlines(year, 'epf', 'EPF Contribution', 'EPF', 15));
  deadlines.push(...generateMonthlyDeadlines(year, 'socso', 'SOCSO Contribution', 'SOCSO', 15));
  deadlines.push(...generateMonthlyDeadlines(year, 'lhdn-pcb', 'PCB Tax Deduction', 'LHDN', 15));
  deadlines.push(...generateMonthlyDeadlines(year, 'eis', 'EIS Contribution', 'EIS', 15));

  // Annual deadlines
  deadlines.push({
    id: 'ea-form-2025',
    name: 'EA Form Submission',
    description: 'Submit EA forms to employees (employee tax statement)',
    dueDate: new Date(year, 1, 28), // 28 Feb
    category: 'LHDN',
    recurrence: 'annual',
    status: determineStatus(new Date(year, 1, 28)),
    legalReference: 'Income Tax Act 1967',
    penalty: 'Fine up to RM 20,000',
  });

  deadlines.push({
    id: 'cp8d-2025',
    name: 'CP8D Employer Tax',
    description: 'Submit CP8D employer tax return',
    dueDate: new Date(year, 2, 31), // 31 Mar
    category: 'LHDN',
    recurrence: 'annual',
    status: determineStatus(new Date(year, 2, 31)),
    legalReference: 'Income Tax Act 1967',
    penalty: 'Fine up to RM 20,000',
  });

  deadlines.push({
    id: 'epf-annual-2025',
    name: 'EPF Annual E Form',
    description: 'Submit annual E form to EPF',
    dueDate: new Date(year, 2, 31), // 31 Mar
    category: 'EPF',
    recurrence: 'annual',
    status: determineStatus(new Date(year, 2, 31)),
    legalReference: 'EPF Act 1991',
    penalty: 'Fine up to RM 10,000',
  });

  // Quarterly deadlines (Q1)
  deadlines.push({
    id: 'gst-q1-2025',
    name: 'GST Return Q1',
    description: 'Submit GST/SST return for Q1 2025',
    dueDate: new Date(year, 3, 30), // 30 Apr
    category: 'LHDN',
    recurrence: 'quarterly',
    status: determineStatus(new Date(year, 3, 30)),
    legalReference: 'Sales Tax Act 2018',
    penalty: 'Fine up to RM 50,000',
  });

  return deadlines;
}
