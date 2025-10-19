export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: Date;
  items: LineItem[];
  total: number;
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  date: Date;
  items: LineItem[];
  total: number;
}

export interface Invoice {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  items: LineItem[];
  total: number;
  gst?: number;
  pdfUrl?: string;
}

export type MatchStatus = 'perfect' | 'within-tolerance' | 'major-discrepancy';

export interface MatchedLineItem {
  id: string;
  description: string;
  po: { quantity: number; unitPrice: number; total: number };
  receipt: { quantity: number; unitPrice: number; total: number };
  invoice: { quantity: number; unitPrice: number; total: number };
  quantityVariance: {
    value: number;
    percentage: number;
    status: MatchStatus;
  };
  priceVariance: {
    value: number;
    percentage: number;
    status: MatchStatus;
  };
  totalVariance: {
    value: number;
    percentage: number;
    status: MatchStatus;
  };
  overallStatus: MatchStatus;
}

export interface ToleranceConfig {
  tiers: Array<{
    maxAmount: number;
    percentageTolerance: number;
    absoluteTolerance: number;
  }>;
}

export interface InvoiceMatchingData {
  po: PurchaseOrder;
  receipt: GoodsReceipt;
  invoice: Invoice;
  matchedItems: MatchedLineItem[];
  totalVariance: {
    value: number;
    percentage: number;
    status: MatchStatus;
  };
  toleranceConfig: ToleranceConfig;
  withinTolerance: boolean;
}

export interface InvoiceMatchingProps {
  data: InvoiceMatchingData;
  onApprove: (invoiceId: string, justification?: string) => void;
  onReject: (invoiceId: string, reason: string) => void;
  onHold: (invoiceId: string, reason: string) => void;
  onRequestClarification: (invoiceId: string, message: string) => void;
}
