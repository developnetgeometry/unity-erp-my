import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ExpenseCategory,
  ExpenseItem,
  ExpenseReceipt,
  ExpenseSubmission,
  ExpenseFormProps,
} from '@/types/expense-submission';
import { CameraCapture } from './camera-capture';
import { OCRReview } from './ocr-review';
import { Check, Plus, Trash2, Calendar, DollarSign, Clock, Building2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { cn } from '@/lib/utils';

const MOCK_CATEGORIES: ExpenseCategory[] = [
  { id: 'meals', name: 'Meals', icon: '🍽️', limit: 50, requiresReceipt: true, policyNote: 'RM50 limit per meal' },
  { id: 'parking', name: 'Parking', icon: '🅿️', requiresReceipt: true },
  { id: 'fuel', name: 'Fuel', icon: '⛽', requiresReceipt: true },
  { id: 'travel', name: 'Travel', icon: '✈️', requiresReceipt: true },
  { id: 'supplies', name: 'Supplies', icon: '📦', requiresReceipt: true },
  { id: 'other', name: 'Other', icon: '📄', requiresReceipt: true },
];

type FormStep = 'mode-select' | 'camera' | 'ocr-review' | 'batch-summary' | 'final-review';

export function ExpenseSubmissionForm({ mode = 'single', onSubmit, onSaveDraft }: ExpenseFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('mode-select');
  const [submissionMode, setSubmissionMode] = useState<'single' | 'batch'>(mode);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [groupName, setGroupName] = useState('');

  // Create draft object for auto-save
  const draftData: ExpenseSubmission = {
    items,
    groupName: submissionMode === 'batch' ? groupName : undefined,
    status: 'draft',
  };

  // Auto-save draft
  useAutoSave(draftData, 'expense-draft', items.length > 0);

  const handleModeSelect = (mode: 'single' | 'batch') => {
    setSubmissionMode(mode);
    setCurrentStep('camera');
  };

  const handleImageCapture = (captured: { base64: string; file: File }) => {
    setCurrentImage(captured.base64);
    setCurrentFile(captured.file);
    setCurrentStep('ocr-review');
  };

  const handleOCRConfirm = (itemData: Omit<ExpenseItem, 'id' | 'receipt'>) => {
    if (!currentImage || !currentFile) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      receipt: {
        id: `rcpt-${Date.now()}`,
        image: currentImage,
        file: currentFile,
        thumbnail: currentImage,
      },
      ...itemData,
    };

    setItems(prev => [...prev, newItem]);

    if (submissionMode === 'batch') {
      setCurrentStep('batch-summary');
    } else {
      setCurrentStep('final-review');
    }

    setCurrentImage(null);
    setCurrentFile(null);
  };

  const handleAddAnother = () => {
    setCurrentStep('camera');
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    const submission: ExpenseSubmission = {
      id: `EXP-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      items,
      groupName: submissionMode === 'batch' ? groupName : undefined,
      submittedAt: new Date(),
      status: 'pending',
      approver: 'Manager Name',
      reimbursementDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      bankAccount: '****1234',
    };
    onSubmit(submission);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalGST = items.reduce((sum, item) => sum + (item.gst || 0), 0);

  // Mode Selection
  if (currentStep === 'mode-select') {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Submit Expense</h2>
          <p className="text-muted-foreground">Choose how you'd like to submit</p>
        </div>

        <div className="grid gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => handleModeSelect('single')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold text-lg mb-1">Single Receipt</h3>
              <p className="text-sm text-muted-foreground">Quick submission for one expense</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => handleModeSelect('batch')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-lg mb-1">Multiple Receipts</h3>
              <p className="text-sm text-muted-foreground">Batch mode for trips or conferences</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Camera Capture
  if (currentStep === 'camera') {
    return (
      <CameraCapture
        onCapture={handleImageCapture}
        onCancel={() => setCurrentStep(items.length > 0 ? 'batch-summary' : 'mode-select')}
      />
    );
  }

  // OCR Review
  if (currentStep === 'ocr-review' && currentImage) {
    return (
      <div className="p-4">
        <OCRReview
          image={currentImage}
          onConfirm={handleOCRConfirm}
          onRetake={() => setCurrentStep('camera')}
          categories={MOCK_CATEGORIES}
        />
      </div>
    );
  }

  // Batch Summary (intermediate step)
  if (currentStep === 'batch-summary' && submissionMode === 'batch') {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Batch Expense</span>
              <Badge variant="secondary">{items.length} receipts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Trip/Event Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Business Trip - KL, Jan 15-17"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img src={item.receipt.thumbnail} alt="Receipt" className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.merchant}</p>
                    <p className="text-sm text-muted-foreground">RM{item.amount.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">RM{(totalAmount - totalGST).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (6%)</span>
                <span className="font-medium">RM{totalGST.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>RM{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleAddAnother} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Receipt
              </Button>
              <Button onClick={() => setCurrentStep('final-review')} className="flex-1">
                Review & Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final Review & Submit
  if (currentStep === 'final-review') {
    const expectedApprovalDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const expectedPaymentDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    return (
      <div className="p-4 space-y-4">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approval Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 relative z-10">
                    <Check className="w-6 h-6 text-green-700" />
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold">Submitted</p>
                    <p className="text-sm text-muted-foreground">Just now</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 relative z-10">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold">Manager Review</p>
                    <p className="text-sm text-muted-foreground">
                      Expected: {expectedApprovalDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 relative z-10">
                    <Calendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold">Finance Approval</p>
                    <p className="text-sm text-muted-foreground">Pending manager approval</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 relative z-10">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="pt-2">
                    <p className="font-semibold">Payment</p>
                    <p className="text-sm text-primary font-medium">
                      Expected: {expectedPaymentDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupName && (
              <div>
                <p className="text-sm text-muted-foreground">Group</p>
                <p className="font-medium">{groupName}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Items ({items.length})</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 rounded bg-muted">
                    <span>{item.merchant}</span>
                    <span className="font-medium">RM{item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-xl">RM{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>Bank account: ****1234 (DBS)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-background pt-2 pb-4">
          <Button onClick={handleSubmit} className="w-full h-12 text-base">
            <Check className="w-5 h-5 mr-2" />
            Submit Expense
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
