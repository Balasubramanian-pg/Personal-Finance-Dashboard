import React, { useState } from 'react';
import { Sidebar, Topbar } from './components/Navigation';
import { FileUploader } from './components/FileUploader';
import Overview from './views/Overview';
import IncomeExpenses from './views/IncomeExpenses';
import Budget from './views/Budget';
import Investments from './views/Investments';
import Goals from './views/Goals';
import { View, TimeRange, GlobalFilterRange, AccountFilter, Transaction, BudgetCategory, InvestmentHolding, FinancialGoal } from './types';
import { MOCK_TRANSACTIONS, MOCK_BUDGETS, MOCK_HOLDINGS, MOCK_GOALS } from './constants';

const App: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [currentView, setCurrentView] = useState<View>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Dashboard Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  // Dashboard Filters State
  const [overviewTimeRange, setOverviewTimeRange] = useState<TimeRange>('MTD');
  const [filters, setFilters] = useState<{range: GlobalFilterRange; account: AccountFilter}>({
    range: 'Last 3 Months',
    account: 'All Accounts'
  });

  const handleFilterChange = (type: 'range' | 'account', value: string) => {
    setFilters(prev => ({...prev, [type]: value}));
  };

  const handleDataLoaded = (data: { transactions: Transaction[], budgets: BudgetCategory[], holdings: InvestmentHolding[], goals: FinancialGoal[] }) => {
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setHoldings(data.holdings);
    setGoals(data.goals);
    setHasData(true);
  };

  const handleLoadDemo = () => {
    setTransactions(MOCK_TRANSACTIONS);
    setBudgets(MOCK_BUDGETS);
    setHoldings(MOCK_HOLDINGS);
    setGoals(MOCK_GOALS);
    setHasData(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview': 
        return <Overview timeRange={overviewTimeRange} onTimeRangeChange={setOverviewTimeRange} transactions={transactions} goals={goals} />;
      case 'income-expenses': 
        return <IncomeExpenses filters={filters} data={transactions} />;
      case 'budget': 
        return <Budget data={budgets} />;
      case 'investments': 
        return <Investments data={holdings} />;
      case 'goals': 
        return <Goals data={goals} />;
      default: return <div className="p-10 text-center text-slate-500 font-medium">Settings Coming Soon</div>;
    }
  };

  if (!hasData) {
    return <FileUploader onDataLoaded={handleDataLoaded} onLoadDemo={handleLoadDemo} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 animate-fade-in">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <Topbar title={currentView} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;