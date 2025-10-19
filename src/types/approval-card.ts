export interface ApprovalCardData {
  id: string;
  type: 'leave' | 'expense' | 'invoice';
  employee: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  details: {
    dates?: { start: Date; end: Date };
    amount?: number;
    category?: string;
    reason?: string;
  };
  context: {
    balanceAfter?: number;
    teamOut?: number;
    projectImpact?: {
      hours: number;
      revenue: number;
      project: string;
      replacement?: { name: string; availability: string };
    };
    urgent?: boolean;
  };
  history?: Array<{
    date: Date;
    type: string;
    status: string;
  }>;
  policy?: string;
}

export interface ApprovalCardProps {
  data: ApprovalCardData;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestInfo: (id: string) => void;
}
