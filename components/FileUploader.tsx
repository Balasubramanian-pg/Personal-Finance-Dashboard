import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Transaction, BudgetCategory, InvestmentHolding, FinancialGoal } from '../types';

interface ParsedData {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  holdings: InvestmentHolding[];
  goals: FinancialGoal[];
}

interface FileUploaderProps {
  onDataLoaded: (data: ParsedData) => void;
  onLoadDemo: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded, onLoadDemo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Parse Sheets
      const transactions: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Transactions'] || {});
      const budgets: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Budget'] || {});
      const holdings: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Investments'] || {});
      const goals: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Goals'] || {});

      if (transactions.length === 0 && budgets.length === 0) {
        throw new Error("Could not find data. Please ensure sheets are named 'Transactions', 'Budget', 'Investments', and 'Goals'.");
      }

      // Basic formatting/validation mapping
      const formattedTransactions: Transaction[] = transactions.map((t, i) => ({
        id: `tx-${i}`,
        date: t.date || new Date().toISOString().split('T')[0],
        description: t.description || 'Unknown',
        category: t.category || 'Misc',
        account: t.account || 'Cash',
        amount: Number(t.amount) || 0,
        type: (t.type === 'income' || t.type === 'expense') ? t.type : 'expense',
        status: t.status || 'posted',
        isRecurring: t.isRecurring === true || t.isRecurring === 'true'
      }));

      const formattedBudgets: BudgetCategory[] = budgets.map(b => ({
        category: b.category || 'Misc',
        budget: Number(b.budget) || 0,
        actual: Number(b.actual) || 0,
        trend: 0 // Calculate dynamically if needed, keeping simple for import
      }));

      const formattedHoldings: InvestmentHolding[] = holdings.map(h => ({
        ticker: h.ticker || 'UNKNOWN',
        name: h.name || 'Unknown Asset',
        shares: Number(h.shares) || 0,
        costBasis: Number(h.costBasis) || 0,
        currentPrice: Number(h.currentPrice) || 0,
        allocation: 0 // Will need to calculate based on total
      }));
      // Recalculate allocation
      const totalPortfolioValue = formattedHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
      formattedHoldings.forEach(h => {
          h.allocation = totalPortfolioValue > 0 ? ((h.shares * h.currentPrice) / totalPortfolioValue) * 100 : 0;
      });

      const formattedGoals: FinancialGoal[] = goals.map((g, i) => ({
        id: `g-${i}`,
        name: g.name || 'New Goal',
        targetAmount: Number(g.targetAmount) || 0,
        currentAmount: Number(g.currentAmount) || 0,
        monthlyContribution: Number(g.monthlyContribution) || 0,
        targetDate: g.targetDate || '2025-01-01',
        priority: g.priority || 'medium'
      }));

      onDataLoaded({
        transactions: formattedTransactions,
        budgets: formattedBudgets,
        holdings: formattedHoldings,
        goals: formattedGoals
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse Excel file. Check format.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Upload Area */}
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Welcome to Opus</h1>
                <p className="text-slate-500 text-lg">Upload your financial data to generate your personalized dashboard.</p>
            </div>

            <div 
                className={`bg-white border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${isDragging ? 'border-opus-blue bg-blue-50/50' : 'border-slate-200 hover:border-opus-blue/50'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
            >
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-opus-blue">
                    {loading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div> : <Upload size={32} />}
                </div>
                
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                    {loading ? "Processing..." : "Drag & Drop Excel File"}
                </h3>
                <p className="text-slate-400 mb-8 text-sm">or click to browse from computer</p>
                
                <label className="inline-flex cursor-pointer">
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
                    <span className="bg-opus-blue text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        Select File
                    </span>
                </label>
                
                {error && (
                    <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-center">
                        <AlertCircle size={16} className="mr-2" /> {error}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center">
                <button onClick={onLoadDemo} className="text-sm font-semibold text-slate-400 hover:text-opus-blue transition-colors flex items-center">
                    <Database size={14} className="mr-2" /> Don't have a file? Load Demo Data
                </button>
            </div>
        </div>

        {/* Right: Instructions */}
        <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 flex flex-col justify-center h-full">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center">
                <FileSpreadsheet className="mr-2 text-opus-teal" size={20} />
                Required Excel Structure
            </h3>
            
            <div className="space-y-6 text-sm overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                
                {/* Section */}
                <div className="group">
                    <h4 className="font-bold text-slate-700 mb-2 bg-slate-50 p-2 rounded-lg">Sheet: Transactions</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 pl-2">
                        <span>date <span className="text-xs text-slate-300">(YYYY-MM-DD)</span></span>
                        <span>amount</span>
                        <span>description</span>
                        <span>type <span className="text-xs text-slate-300">(income/expense)</span></span>
                        <span>category</span>
                        <span>status <span className="text-xs text-slate-300">(posted)</span></span>
                        <span>account</span>
                        <span>isRecurring <span className="text-xs text-slate-300">(true/false)</span></span>
                    </div>
                </div>

                <div className="group">
                    <h4 className="font-bold text-slate-700 mb-2 bg-slate-50 p-2 rounded-lg">Sheet: Budget</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 pl-2">
                        <span>category</span>
                        <span>budget</span>
                        <span>actual</span>
                    </div>
                </div>

                <div className="group">
                    <h4 className="font-bold text-slate-700 mb-2 bg-slate-50 p-2 rounded-lg">Sheet: Investments</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 pl-2">
                        <span>ticker</span>
                        <span>costBasis</span>
                        <span>name</span>
                        <span>currentPrice</span>
                        <span>shares</span>
                    </div>
                </div>
                
                 <div className="group">
                    <h4 className="font-bold text-slate-700 mb-2 bg-slate-50 p-2 rounded-lg">Sheet: Goals</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-500 pl-2">
                        <span>name</span>
                        <span>targetDate</span>
                        <span>targetAmount</span>
                        <span>priority</span>
                        <span>currentAmount</span>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};