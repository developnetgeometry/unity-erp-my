import * as React from "react";
import { CurrencyInput } from "@/components/erp/currency-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComponentShowcase() {
  const [expenseAmount, setExpenseAmount] = React.useState<number | null>(null);
  const [salaryAmount, setSalaryAmount] = React.useState<number | null>(5000);
  const [invoiceAmount, setInvoiceAmount] = React.useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', {
      expenseAmount,
      salaryAmount,
      invoiceAmount,
    });
    alert(`Submitted!\nExpense: RM${expenseAmount}\nSalary: RM${salaryAmount}\nInvoice: RM${invoiceAmount}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Malaysian ERP Components Showcase</h1>
          <p className="text-muted-foreground">
            Phase 2: Malaysian Currency Input with RM formatting and banker's rounding
          </p>
        </div>

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
      </div>
    </div>
  );
}
