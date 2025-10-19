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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="currency">Currency</TabsTrigger>
            <TabsTrigger value="ic">IC Number</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="date">Date Picker</TabsTrigger>
            <TabsTrigger value="setup">Setup Wizard</TabsTrigger>
            <TabsTrigger value="leave">Leave Request</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
