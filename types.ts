export type View = 'overview' | 'income-expenses' | 'budget' | 'investments' | 'goals' | 'settings';
export type TimeRange = 'Weekly' | 'MTD' | 'QTD' | 'YTD';
export type GlobalFilterRange = 'Last Month' | 'Last 3 Months' | 'Last 6 Months';
export type AccountFilter = 'All Accounts' | 'Federal Bank' | 'ICICI Bank';

export interface KPIMetric {
  title: string;
  value: number; // Changed to number for dynamic formatting
  subValue?: string;
  change?: number; // percentage
  trend?: number[];
  type: 'currency' | 'percent' | 'count';
  color: 'blue' | 'teal' | 'green' | 'amber' | 'red';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'posted' | 'pending';
  isRecurring: boolean;
}

export interface BudgetCategory {
  category: string;
  budget: number;
  actual: number;
  trend: number; // vs last month
}

export interface InvestmentHolding {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  allocation: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
}