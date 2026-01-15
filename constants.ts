import { KPIMetric, Transaction, BudgetCategory, InvestmentHolding, FinancialGoal } from './types';

// Palette Reference
export const COLORS = {
  blue: '#2563EB',
  teal: '#0D9488',
  green: '#16A34A',
  amber: '#F59E0B',
  red: '#DC2626',
  dark: '#0F172A',
  gray: '#64748B',
  lightGray: '#F1F5F9',
  white: '#FFFFFF',
  charts: ['#2563EB', '#0D9488', '#F59E0B', '#DC2626', '#16A34A', '#7C3AED', '#DB2777']
};

export const GLASS_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
  padding: '8px 12px',
  outline: 'none'
};

export const MOCK_KPIS: KPIMetric[] = [
  { title: "Net Worth", value: 40550000, subValue: "+₹12.4L YoY", change: 5.2, trend: [420, 435, 450, 465, 482], type: 'currency', color: 'blue' },
  { title: "Savings Rate", value: 24.5, subValue: "Target: 20%", change: 2.1, trend: [18, 20, 22, 19, 24], type: 'percent', color: 'teal' },
  { title: "Cash Flow (MTD)", value: 275000, subValue: "Safe", change: 8.4, trend: [2500, 1200, 3000, 2800, 3240], type: 'currency', color: 'green' },
  { title: "Inv. Returns (YTD)", value: 11.2, subValue: "Nifty: 9.8%", change: -0.5, trend: [2, 4, 8, 10, 11], type: 'percent', color: 'amber' }
];

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 50 }).map((_, i) => {
  const isRecurring = Math.random() > 0.7; // 30% recurring
  const isPending = i < 4; // First 4 are pending
  return {
    id: `tx-${i}`,
    date: new Date(2023, 9, 30 - i).toISOString().split('T')[0],
    description: ['JioMart', 'Netflix Subscription', 'Indian Oil', 'Salary Deposit', 'Adani Electricity', 'Amazon India', 'Zerodha Fund Add'][Math.floor(Math.random() * 7)],
    category: ['Groceries', 'Entertainment', 'Transport', 'Income', 'Utilities', 'Shopping', 'Investments'][Math.floor(Math.random() * 7)],
    account: ['ICICI Bank', 'Federal Bank'][Math.floor(Math.random() * 2)],
    amount: Math.floor(Math.random() * 25000) + 500,
    type: Math.random() > 0.8 ? 'income' : 'expense',
    status: isPending ? 'pending' : 'posted',
    isRecurring: isRecurring
  };
});

export const MOCK_BUDGETS: BudgetCategory[] = [
  { category: 'Housing', budget: 45000, actual: 45000, trend: 0 },
  { category: 'Food & Dining', budget: 15000, actual: 18500, trend: 15 },
  { category: 'Transportation', budget: 8000, actual: 6500, trend: -5 },
  { category: 'Utilities', budget: 5000, actual: 5500, trend: 8 },
  { category: 'Shopping', budget: 10000, actual: 14500, trend: 40 },
  { category: 'Entertainment', budget: 5000, actual: 4500, trend: -10 },
  { category: 'Health', budget: 3000, actual: 3000, trend: 0 },
  { category: 'Travel', budget: 20000, actual: 0, trend: -100 },
  { category: 'Misc', budget: 5000, actual: 6000, trend: 20 },
];

export const MOCK_HOLDINGS: InvestmentHolding[] = [
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', shares: 450, costBasis: 1400, currentPrice: 1650, allocation: 35 },
  { ticker: 'RELIANCE', name: 'Reliance Ind', shares: 300, costBasis: 2200, currentPrice: 2450, allocation: 25 },
  { ticker: 'TCS', name: 'Tata Consultancy', shares: 100, costBasis: 3200, currentPrice: 3600, allocation: 15 },
  { ticker: 'INFY', name: 'Infosys Ltd', shares: 150, costBasis: 1300, currentPrice: 1450, allocation: 15 },
  { ticker: 'SBIN', name: 'State Bank of India', shares: 500, costBasis: 500, currentPrice: 620, allocation: 10 },
];

export const MOCK_GOALS: FinancialGoal[] = [
  { id: 'g1', name: 'Home Down Payment', targetAmount: 8000000, currentAmount: 4500000, monthlyContribution: 50000, targetDate: '2025-06-01', priority: 'high' },
  { id: 'g2', name: 'Europe Trip', targetAmount: 400000, currentAmount: 120000, monthlyContribution: 15000, targetDate: '2024-08-01', priority: 'medium' },
  { id: 'g3', name: 'New Car', targetAmount: 1500000, currentAmount: 300000, monthlyContribution: 25000, targetDate: '2025-01-01', priority: 'medium' },
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];