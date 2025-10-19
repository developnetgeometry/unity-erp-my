export interface LeaveRequestData {
  leaveType: 'annual' | 'sick' | 'emergency';
  startDate: Date;
  endDate: Date;
  duration: 'full' | 'morning' | 'afternoon';
  coverageDelegate?: {
    id: string;
    name: string;
    avatar: string;
  };
  reason?: string;
  medicalCertificate?: File;
}

export interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestData) => void;
  onSaveDraft: (data: Partial<LeaveRequestData>) => void;
  existingDraft?: Partial<LeaveRequestData>;
  employeeBalance?: {
    annual: number;
    sick: number;
    emergency: number;
  };
}

export type LeaveStep = 1 | 2 | 3 | 4;

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  onLeave?: {
    start: Date;
    end: Date;
    status: 'approved' | 'pending';
  };
}
