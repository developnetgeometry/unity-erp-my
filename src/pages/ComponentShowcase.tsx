import * as React from "react";
import { CurrencyInput } from "@/components/erp/currency-input";
import { ICNumberInput } from "@/components/erp/ic-number-input";
import { PhoneNumberInput } from "@/components/erp/phone-number-input";
import { DatePicker } from "@/components/erp/date-picker";
import { DateRangePicker } from "@/components/erp/date-range-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { SetupWizard } from "@/components/onboarding/setup-wizard";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { CompanySetupData } from "@/types/setup-wizard";
import { LeaveRequestData } from "@/types/leave-request";
import { ApprovalCard } from "@/components/approvals/approval-card";
import { ApprovalCardData } from "@/types/approval-card";
import { ExpenseSubmissionForm } from "@/components/expense/expense-submission-form";
import { ExpenseSubmission } from "@/types/expense-submission";
import { InvoiceMatchingView } from "@/components/invoice/invoice-matching-view";
import { InvoiceMatchingData } from "@/types/invoice-matching";

export default function ComponentShowcase() {
  const [expenseAmount, setExpenseAmount] = React.useState<number | null>(null);
  const [salaryAmount, setSalaryAmount] = React.useState<number | null>(5000);
  const [invoiceAmount, setInvoiceAmount] = React.useState<number | null>(null);
  const [icNumber, setIcNumber] = React.useState<string>('');
  const [icNumberMasked, setIcNumberMasked] = React.useState<string>('900101011234');
  const [mobilePhone, setMobilePhone] = React.useState<string>('');
  const [landlinePhone, setLandlinePhone] = React.useState<string>('0321234567');
  const [countryCode, setCountryCode] = React.useState<string>('+60');
  const [joinDate, setJoinDate] = React.useState<Date | null>(null);
  const [leaveRange, setLeaveRange] = React.useState<DateRange | null>(null);

  // Public holidays for demonstration (Malaysian public holidays 2025)
  const publicHolidays = React.useMemo(() => [
    new Date(2025, 0, 1), // New Year
    new Date(2025, 0, 29), // Chinese New Year
    new Date(2025, 4, 1), // Labour Day
    new Date(2025, 7, 31), // National Day
  ], []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', {
      expenseAmount,
      salaryAmount,
      invoiceAmount,
      icNumber,
      icNumberMasked,
      mobilePhone,
      landlinePhone,
      countryCode,
      joinDate,
      leaveRange,
    });
    alert(
      `Submitted!\n` +
      `Expense: RM${expenseAmount}\n` +
      `Salary: RM${salaryAmount}\n` +
      `Invoice: RM${invoiceAmount}\n` +
      `IC: ${icNumber}\n` +
      `IC (Masked): ${icNumberMasked}\n` +
      `Mobile: ${countryCode} ${mobilePhone}\n` +
      `Landline: ${countryCode} ${landlinePhone}\n` +
      `Join Date: ${joinDate?.toLocaleDateString('en-MY')}\n` +
      `Leave: ${leaveRange?.from?.toLocaleDateString('en-MY')} to ${leaveRange?.to?.toLocaleDateString('en-MY')}`
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Malaysian ERP Components Showcase</h1>
          <p className="text-muted-foreground">
            Phase 2-5: Currency, IC Number, Phone Number, and Date Picker with Malaysian formatting
          </p>
        </div>

        <Tabs defaultValue="currency" className="w-full">
          <TabsList className="grid w-full grid-cols-7 overflow-x-auto">
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="ic">IC Number</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="date">Date Picker</TabsTrigger>
            <TabsTrigger value="setup">Setup Wizard</TabsTrigger>
            <TabsTrigger value="leave">Leave Request</TabsTrigger>
              <TabsTrigger value="approval">Approval Card</TabsTrigger>
              <TabsTrigger value="expense">Expense OCR</TabsTrigger>
              <TabsTrigger value="invoice">Invoice Matching</TabsTrigger>
            </TabsList>

          <TabsContent value="currency">
            <Card>
              <CardHeader>
                <CardTitle>Currency Input - Basic Usage</CardTitle>
                <CardDescription>
                  Try entering amounts like 10000, 123.456, or 10.125 to see formatting and banker's rounding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
              {/* Expense Amount */}
              <CurrencyInput
                id="expense"
                label="Expense Amount"
                value={expenseAmount}
                onChange={setExpenseAmount}
                min={0.01}
                max={50000}
                required
                helperText="Maximum RM50,000 per expense claim"
                placeholder="Enter amount"
              />

              {/* Salary Amount */}
              <CurrencyInput
                id="salary"
                label="Monthly Salary"
                value={salaryAmount}
                onChange={setSalaryAmount}
                min={1000}
                max={100000}
                required
                helperText="Malaysian minimum wage is RM1,500"
              />

              {/* Invoice Amount */}
              <CurrencyInput
                id="invoice"
                label="Invoice Amount (Optional)"
                value={invoiceAmount}
                onChange={setInvoiceAmount}
                min={0.01}
                helperText="Leave empty if not applicable"
              />

                  <Button type="submit" className="w-full md:w-auto">
                    Submit Form
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Demonstrated</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>RM Prefix:</strong> Non-editable currency symbol</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Auto-formatting:</strong> 10000 becomes RM 10,000.00 on blur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Banker's Rounding:</strong> 10.125 rounds to 10.12 (round half to even)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Min/Max Validation:</strong> Error messages for out-of-range values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Mobile-Optimized:</strong> Numeric keyboard on mobile devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>WCAG 2.1 AA:</strong> Accessible with proper ARIA labels and focus states</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Malaysian Locale:</strong> Uses en-MY formatting (comma thousands separator)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Values (Raw Numbers)</CardTitle>
                <CardDescription>
                  These are the actual numeric values stored (not the formatted display values)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Expense:</span>{' '}
                    <span className="font-semibold">{expenseAmount ?? 'null'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salary:</span>{' '}
                    <span className="font-semibold">{salaryAmount ?? 'null'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoice:</span>{' '}
                    <span className="font-semibold">{invoiceAmount ?? 'null'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ic">
            <Card>
              <CardHeader>
                <CardTitle>IC Number Input - Malaysian Identity Card</CardTitle>
                <CardDescription>
                  Try entering IC numbers like 900101011234 or 251231101234 to see formatting and validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* IC Number - Standard */}
                  <ICNumberInput
                    id="ic-standard"
                    label="IC Number (Standard)"
                    value={icNumber}
                    onChange={setIcNumber}
                    required
                    helperText="Format: XXXXXX-XX-XXXX (12 digits, YYMMDD validation)"
                  />

                  {/* IC Number - Masked */}
                  <ICNumberInput
                    id="ic-masked"
                    label="IC Number (Masked for PDPA)"
                    value={icNumberMasked}
                    onChange={setIcNumberMasked}
                    masked
                    required
                    helperText="Shows ******-**-1234 when not focused (PDPA compliance)"
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Submit Form
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Demonstrated</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Auto-formatting:</strong> 12 digits auto-format to XXXXXX-XX-XXXX</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Date Validation:</strong> First 6 digits validated as YYMMDD (1900-current year)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>PDPA Masking:</strong> Optional masking shows ******-**-1234 when not focused</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Real-time Validation:</strong> Invalid dates like 991301 (month 13) are caught</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Mobile-Optimized:</strong> Numeric keyboard on mobile devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>WCAG 2.1 AA:</strong> Accessible with proper ARIA labels and focus states</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Values (Raw Strings)</CardTitle>
                <CardDescription>
                  These are the actual unformatted values (12 digits without hyphens)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">IC (Standard):</span>{' '}
                    <span className="font-semibold">{icNumber || 'empty'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IC (Masked):</span>{' '}
                    <span className="font-semibold">{icNumberMasked || 'empty'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phone">
            <Card>
              <CardHeader>
                <CardTitle>Phone Number Input - Malaysian Format</CardTitle>
                <CardDescription>
                  Try entering Malaysian mobile (012XXXXXXX) or landline (03XXXXXXX) numbers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mobile Phone */}
                  <PhoneNumberInput
                    id="mobile"
                    label="Mobile Phone"
                    value={mobilePhone}
                    onChange={setMobilePhone}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    required
                    helperText="Malaysian mobile: 01X-XXXX XXXX (10-11 digits)"
                  />

                  {/* Landline Phone */}
                  <PhoneNumberInput
                    id="landline"
                    label="Landline (Optional)"
                    value={landlinePhone}
                    onChange={setLandlinePhone}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    helperText="Malaysian landline: 0X-XXXX XXXX (9-10 digits)"
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Submit Form
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Demonstrated</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Country Code Selector:</strong> Defaults to Malaysia (+60), dropdown to change</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Auto-formatting:</strong> 0123456789 becomes 012-3456 789</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Mobile Validation:</strong> Validates 01X prefixes (010-019) with 10-11 digits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Landline Validation:</strong> Validates 0X format with 9-10 digits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Mobile-Optimized:</strong> Tel keyboard on mobile devices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>WCAG 2.1 AA:</strong> Accessible with proper ARIA labels and focus states</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Multi-country:</strong> Supports Malaysia, Singapore, USA, UK with appropriate formats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Values (Raw Strings)</CardTitle>
                <CardDescription>
                  These are the actual unformatted values (digits only, without formatting)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Country Code:</span>{' '}
                    <span className="font-semibold">{countryCode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>{' '}
                    <span className="font-semibold">{mobilePhone || 'empty'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Landline:</span>{' '}
                    <span className="font-semibold">{landlinePhone || 'empty'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="date">
            <Card>
              <CardHeader>
                <CardTitle>Date Picker - Malaysian DD/MM/YYYY Format</CardTitle>
                <CardDescription>
                  Try selecting dates with quick selectors or calendar view
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Single Date */}
                  <DatePicker
                    id="join-date"
                    label="Join Date"
                    value={joinDate}
                    onChange={setJoinDate}
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date()}
                    required
                    helperText="Employee join date (cannot be future date)"
                  />

                  {/* Date Range */}
                  <DateRangePicker
                    id="leave-range"
                    label="Leave Period"
                    value={leaveRange}
                    onChange={setLeaveRange}
                    minDate={new Date()}
                    excludeDates={publicHolidays}
                    required
                    helperText="Select leave dates (public holidays excluded)"
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Submit Form
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Demonstrated</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>DD/MM/YYYY Format:</strong> Malaysian date format (not US MM/DD/YYYY)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Quick Selectors:</strong> Today, Tomorrow, +7 days, Next Monday for fast selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Range Selection:</strong> Select start and end dates for leave requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Exclude Dates:</strong> Public holidays highlighted and disabled</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Min/Max Constraints:</strong> Join date cannot be future, leave cannot be past</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>Mobile-Optimized:</strong> Touch-friendly 44×44px touch targets per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span><strong>WCAG 2.1 AA:</strong> Accessible with proper ARIA labels and keyboard navigation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Values</CardTitle>
                <CardDescription>
                  These are the actual Date objects stored
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">Join Date:</span>{' '}
                    <span className="font-semibold">{joinDate?.toISOString() || 'null'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Leave From:</span>{' '}
                    <span className="font-semibold">{leaveRange?.from?.toISOString() || 'null'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Leave To:</span>{' '}
                    <span className="font-semibold">{leaveRange?.to?.toISOString() || 'null'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Setup Wizard - 7-Step Onboarding</CardTitle>
                <CardDescription>
                  Complete setup wizard with progress tracking, validation, and auto-save
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SetupWizard
                  onComplete={(data: CompanySetupData) => {
                    console.log('Setup completed:', data);
                    alert('Setup completed successfully! Check console for data.');
                  }}
                  onExit={() => {
                    console.log('Setup wizard exited');
                    alert('Setup wizard exited. Progress saved to draft.');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave Request Form - 4-Step Mobile Flow</CardTitle>
                <CardDescription>
                  Multi-step leave request with team calendar, coverage delegation, and auto-save
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveRequestForm
                  onSubmit={(data: LeaveRequestData) => {
                    console.log('Leave request submitted:', data);
                    alert(`Leave request submitted!\nType: ${data.leaveType}\nDates: ${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`);
                  }}
                  onSaveDraft={(data: Partial<LeaveRequestData>) => {
                    console.log('Draft saved:', data);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approval Card - Mobile Swipeable</CardTitle>
                  <CardDescription>
                    Tap-and-hold to approve (1 second), 30-second undo, project impact visibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-0 md:p-6">
                  <div className="max-w-md mx-auto md:max-w-2xl space-y-4">
                  <ApprovalCard
                    data={{
                      id: 'appr-001',
                      type: 'leave',
                      employee: {
                        id: 'emp-123',
                        name: 'Sarah Tan',
                        avatar: '/placeholder.svg',
                        role: 'Project Manager'
                      },
                      details: {
                        dates: { start: new Date('2025-01-15'), end: new Date('2025-01-17') },
                        category: 'Annual Leave',
                        reason: 'Family vacation'
                      },
                      context: {
                        balanceAfter: 5,
                        teamOut: 2,
                        projectImpact: {
                          hours: 24,
                          revenue: 3600,
                          project: 'Project Alpha',
                          replacement: { name: 'John Lee', availability: '16hrs free' }
                        }
                      },
                      history: [
                        { date: new Date('2024-12-15'), type: 'Annual Leave', status: 'Approved' },
                        { date: new Date('2024-11-20'), type: 'Sick Leave', status: 'Approved' }
                      ],
                      policy: 'Annual leave requires 7-day advance notice. Up to 14 days per year.'
                    } as ApprovalCardData}
                    onApprove={(id) => {
                      console.log('Approved:', id);
                      alert('Leave request approved!');
                    }}
                    onReject={(id, reason) => {
                      console.log('Rejected:', id, reason);
                      alert(`Leave request rejected: ${reason}`);
                    }}
                    onRequestInfo={(id) => {
                      console.log('Request info:', id);
                      alert('Message sent to employee');
                    }}
                  />

                  <ApprovalCard
                    data={{
                      id: 'appr-002',
                      type: 'expense',
                      employee: {
                        id: 'emp-456',
                        name: 'Ahmad Rahman',
                        avatar: '/placeholder.svg',
                        role: 'Sales Executive'
                      },
                      details: {
                        amount: 450.00,
                        category: 'Client Entertainment',
                        reason: 'Client dinner meeting'
                      },
                      context: {
                        urgent: true
                      },
                      history: [
                        { date: new Date('2024-12-20'), type: 'Travel Expense', status: 'Approved' }
                      ],
                      policy: 'Client entertainment up to RM500 per event. Requires receipt.'
                    } as ApprovalCardData}
                    onApprove={(id) => {
                      console.log('Approved:', id);
                      alert('Expense approved!');
                    }}
                    onReject={(id, reason) => {
                      console.log('Rejected:', id, reason);
                      alert(`Expense rejected: ${reason}`);
                    }}
                    onRequestInfo={(id) => {
                      console.log('Request info:', id);
                      alert('Message sent to employee');
                    }}
                  />
                </div>
              </CardContent>
            </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features Demonstrated</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Tap-and-Hold Approval:</strong> Press and hold for 1 second with progress indicator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>30-Second Undo:</strong> Optimistic UI with countdown timer and undo button</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Collapsed/Expanded States:</strong> Tap chevron to expand with tabbed sections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Project Impact:</strong> Shows billable hours at risk and suggested replacements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Context Chips:</strong> Balance, team out, project impact, urgent badge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Rejection Flow:</strong> Bottom sheet with predefined reasons + custom text</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>History & Policy:</strong> Tabbed view with past requests and policy details</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expense OCR Tab */}
          <TabsContent value="expense">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Submission with Receipt OCR</CardTitle>
                  <CardDescription>
                    Camera-first expense claim with intelligent OCR, batch support, and policy compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                  <ExpenseSubmissionForm
                    onSubmit={(submission) => {
                      console.log('Expense submitted:', submission);
                      alert(`Expense ${submission.id} submitted! Expected payment: ${submission.reimbursementDate?.toLocaleDateString()}`);
                    }}
                    onSaveDraft={(draft) => {
                      console.log('Draft saved:', draft);
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features Demonstrated</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Camera Capture:</strong> Real-time lighting quality detection with guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>OCR Processing:</strong> Auto-extract merchant, amount, date, GST with confidence scores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Batch Mode:</strong> Multi-receipt support for trips/conferences with running total</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Policy Compliance:</strong> Real-time validation against expense limits with warnings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Smart Categories:</strong> Pinned frequently-used categories + auto-suggestion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Reimbursement Timeline:</strong> Visual timeline showing approval stages and payment date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Auto-save:</strong> Drafts saved locally every second to localStorage</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoice Matching Tab */}
          <TabsContent value="invoice">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Three-Way Invoice Matching</CardTitle>
                  <CardDescription>
                    Desktop 3-column comparison + mobile swipeable cards with tolerance validation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                  <InvoiceMatchingView
                    data={{
                      po: {
                        id: 'PO-2024-001',
                        supplier: 'Tech Supplies Sdn Bhd',
                        date: new Date(2024, 0, 10),
                        items: [
                          { id: '1', description: 'Dell Laptop OptiPlex 7090', quantity: 10, unitPrice: 3500, total: 35000 },
                          { id: '2', description: 'Wireless Mouse Logitech MX Master 3', quantity: 10, unitPrice: 420, total: 4200 },
                          { id: '3', description: 'USB-C Hub Anker 7-in-1', quantity: 10, unitPrice: 180, total: 1800 },
                        ],
                        total: 41000,
                      },
                      receipt: {
                        id: 'GR-2024-005',
                        poId: 'PO-2024-001',
                        date: new Date(2024, 0, 15),
                        items: [
                          { id: '1', description: 'Dell Laptop OptiPlex 7090', quantity: 10, unitPrice: 3500, total: 35000 },
                          { id: '2', description: 'Wireless Mouse Logitech MX Master 3', quantity: 10, unitPrice: 420, total: 4200 },
                          { id: '3', description: 'USB-C Hub Anker 7-in-1', quantity: 9, unitPrice: 180, total: 1620 },
                        ],
                        total: 40820,
                      },
                      invoice: {
                        id: 'INV-TECH-2024-123',
                        supplier: 'Tech Supplies Sdn Bhd',
                        invoiceNumber: 'INV-TECH-2024-123',
                        date: new Date(2024, 0, 20),
                        dueDate: new Date(2024, 1, 20),
                        items: [
                          { id: '1', description: 'Dell Laptop OptiPlex 7090', quantity: 10, unitPrice: 3500, total: 35000 },
                          { id: '2', description: 'Wireless Mouse Logitech MX Master 3', quantity: 10, unitPrice: 430, total: 4300 },
                          { id: '3', description: 'USB-C Hub Anker 7-in-1', quantity: 9, unitPrice: 180, total: 1620 },
                        ],
                        total: 40920,
                        gst: 2455.20,
                      },
                      matchedItems: [
                        {
                          id: '1',
                          description: 'Dell Laptop OptiPlex 7090',
                          po: { quantity: 10, unitPrice: 3500, total: 35000 },
                          receipt: { quantity: 10, unitPrice: 3500, total: 35000 },
                          invoice: { quantity: 10, unitPrice: 3500, total: 35000 },
                          quantityVariance: { value: 0, percentage: 0, status: 'perfect' },
                          priceVariance: { value: 0, percentage: 0, status: 'perfect' },
                          totalVariance: { value: 0, percentage: 0, status: 'perfect' },
                          overallStatus: 'perfect',
                        },
                        {
                          id: '2',
                          description: 'Wireless Mouse Logitech MX Master 3',
                          po: { quantity: 10, unitPrice: 420, total: 4200 },
                          receipt: { quantity: 10, unitPrice: 420, total: 4200 },
                          invoice: { quantity: 10, unitPrice: 430, total: 4300 },
                          quantityVariance: { value: 0, percentage: 0, status: 'perfect' },
                          priceVariance: { value: 10, percentage: 2.4, status: 'within-tolerance' },
                          totalVariance: { value: 100, percentage: 2.4, status: 'within-tolerance' },
                          overallStatus: 'within-tolerance',
                        },
                        {
                          id: '3',
                          description: 'USB-C Hub Anker 7-in-1',
                          po: { quantity: 10, unitPrice: 180, total: 1800 },
                          receipt: { quantity: 9, unitPrice: 180, total: 1620 },
                          invoice: { quantity: 9, unitPrice: 180, total: 1620 },
                          quantityVariance: { value: -1, percentage: -10, status: 'within-tolerance' },
                          priceVariance: { value: 0, percentage: 0, status: 'perfect' },
                          totalVariance: { value: -180, percentage: -10, status: 'within-tolerance' },
                          overallStatus: 'within-tolerance',
                        },
                      ],
                      totalVariance: { value: -80, percentage: -0.2, status: 'within-tolerance' },
                      toleranceConfig: {
                        tiers: [
                          { maxAmount: 1000, percentageTolerance: 10, absoluteTolerance: 100 },
                          { maxAmount: 10000, percentageTolerance: 5, absoluteTolerance: 500 },
                          { maxAmount: Infinity, percentageTolerance: 2, absoluteTolerance: 1000 },
                        ],
                      },
                      withinTolerance: true,
                    }}
                    onApprove={(id, justification) => {
                      console.log('Invoice approved:', id, justification);
                      alert(`Invoice ${id} approved for payment!`);
                    }}
                    onReject={(id, reason) => {
                      console.log('Invoice rejected:', id, reason);
                      alert(`Invoice ${id} rejected: ${reason}`);
                    }}
                    onHold={(id, reason) => {
                      console.log('Invoice held:', id, reason);
                      alert(`Invoice ${id} held for review: ${reason}`);
                    }}
                    onRequestClarification={(id, message) => {
                      console.log('Clarification requested:', id, message);
                      alert(`Clarification message sent for ${id}`);
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features Demonstrated</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>3-Way Comparison:</strong> Side-by-side PO, Receipt, Invoice with row-level matching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Variance Analysis:</strong> Toggle between %, RM, or both views with color-coded status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Tolerance Thresholds:</strong> Tiered validation (10%/RM100 for &lt;RM1K, 5%/RM500 for &lt;RM10K)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Expandable Rows:</strong> Click rows to see detailed quantity/price/total breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Mobile Swipeable:</strong> Simplified card view with tabs (PO → Receipt → Invoice)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Override Flow:</strong> Approve button disabled if variance exceeds tolerance (requires justification)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Keyboard Shortcuts:</strong> Alt+A (Approve), Alt+H (Hold), Alt+R (Reject), Ctrl+M (Message)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Responsive Design:</strong> Desktop table view, mobile simplified cards with fixed bottom actions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
