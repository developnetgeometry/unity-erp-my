export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  limit?: number;
  requiresReceipt: boolean;
  policyNote?: string;
}

export interface OCRResult {
  merchant: { value: string; confidence: number };
  amount: { value: number; confidence: number };
  date: { value: Date; confidence: number };
  gst?: { value: number; confidence: number };
}

export interface ExpenseReceipt {
  id: string;
  image: string; // base64 or URL
  file: File;
  ocrResult?: OCRResult;
  thumbnail?: string;
}

export interface ExpenseItem {
  id: string;
  receipt: ExpenseReceipt;
  merchant: string;
  amount: number;
  date: Date;
  category: string;
  gst?: number;
  notes?: string;
  policyCompliant: boolean;
  policyWarning?: string;
}

export interface ExpenseSubmission {
  id?: string;
  items: ExpenseItem[];
  groupName?: string;
  submittedAt?: Date;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  approver?: string;
  reimbursementDate?: Date;
  bankAccount?: string;
}

export interface ExpenseFormProps {
  mode?: 'single' | 'batch';
  onSubmit: (submission: ExpenseSubmission) => void;
  onSaveDraft: (submission: ExpenseSubmission) => void;
  existingDraft?: ExpenseSubmission;
}
