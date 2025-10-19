export interface Address {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface CompanySetupData {
  companyProfile: {
    name: string;
    registrationNumber: string;
    businessType: string;
    industry: string;
    logo: string;
    address: Address;
    phone: string;
    email: string;
  };
  financialYear: {
    startMonth: number;
    startDay: number;
    lockPreviousMonths: boolean;
  };
  chartOfAccounts: {
    template: 'standard' | 'import' | 'scratch';
    csvFile?: File;
  };
  employees: {
    importMethod: 'csv' | 'manual' | 'skip';
    file?: File;
    preview?: any[];
  };
  statutory: {
    epfNumber: string;
    socsoNumber: string;
    eisNumber: string;
    lhdnNumber: string;
  };
  tax: {
    sstEnabled: boolean;
    sstRate: 6 | 10;
    tourismTaxEnabled: boolean;
    sstRegistrationNumber: string;
    pricesIncludeTax: boolean;
  };
  teamInvites: Array<{
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
  }>;
}

export interface SetupWizardProps {
  onComplete: (data: CompanySetupData) => void;
  onExit: () => void;
  existingData?: Partial<CompanySetupData>;
}

export type SetupStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
