export enum AssetType {
  EQUITY = 'EQUITY',
  DEBT = 'DEBT',
  MUTUAL_FUND = 'MUTUAL_FUND',
  FOREIGN_ASSET = 'FOREIGN_ASSET',
  OTHER = 'OTHER'
}

export interface InvestmentTransaction {
  id: string;
  date: string;
  type: 'BUY' | 'SELL';
  assetName: string;
  assetType: AssetType;
  quantity: number;
  price: number;
  amount: number;
}

export interface TaxSummary {
  totalIncome: number;
  stcg: number;
  ltcg: number;
  dividendIncome: number;
  otherIncome: number;
  totalTaxLiability: number;
  advanceTaxPaid: number;
  balanceTax: number;
  salaryIncome: number;
  deductions80C: number;
  deductionsOther: number;
  oldRegimeTax: number;
  newRegimeTax: number;
}

export interface AdvanceTaxInstallment {
  dueDate: string;
  percentage: number;
  cumulativeAmount: number;
  installmentAmount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface TaxState {
  transactions: InvestmentTransaction[];
  summary: TaxSummary | null;
  advanceTaxSchedule: AdvanceTaxInstallment[];
  isLoading: boolean;
  error: string | null;
  selectedItrType: string;
}
