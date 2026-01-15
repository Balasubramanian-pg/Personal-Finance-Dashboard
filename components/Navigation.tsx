import React from 'react';
import { Home, PieChart, Wallet, Target, Settings, ChevronLeft, Calendar, Filter, Download, TrendingUp, Building2, Clock } from 'lucide-react';
import { View, GlobalFilterRange, AccountFilter } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  filters: {
    range: GlobalFilterRange;
    account: AccountFilter;
  };
  onFilterChange: (type: 'range' | 'account', value: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, toggleSidebar, filters, onFilterChange }) => {
  const navItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'income-expenses', icon: Wallet, label: 'Income & Expenses' },
    { id: 'budget', icon: PieChart, label: 'Budget Tracking' },
    { id: 'investments', icon: TrendingUp, label: 'Investments' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'w-72' : 'w-20'} shadow-xl`}>
      {/* Header */}
      <div className="h-20 flex items-center justify-center border-b border-slate-100 relative bg-gradient-to-r from-white to-slate-50">
        <div className={`font-bold text-2xl text-opus-blue transition-opacity duration-200 tracking-tight flex items-center ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          Opus<span className="text-opus-dark ml-1">Finance</span>
        </div>
        {!isOpen && <div className="font-bold text-2xl text-opus-blue">O</div>}
        
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1.5 hover:bg-slate-50 text-slate-500 shadow-sm z-50"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as View)}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-opus-blue text-white shadow-glow' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-opus-blue'
              }`}
            >
              <Icon size={20} className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-opus-blue'}`} />
              <span className={`relative z-10 ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Filter Panel */}
      <div className={`p-6 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm ${isOpen ? 'block' : 'hidden'}`}>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Dashboard Filters</h4>
        <div className="space-y-4">
          {/* Account Filter */}
          <div className="relative group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Building2 size={14} />
             </div>
             <select 
                value={filters.account}
                onChange={(e) => onFilterChange('account', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-opus-blue/20 appearance-none cursor-pointer hover:border-opus-blue transition-colors shadow-sm"
             >
                <option>All Accounts</option>
                <option>Federal Bank</option>
                <option>ICICI Bank</option>
             </select>
             <ChevronLeft size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 -rotate-90 pointer-events-none" />
          </div>

          {/* Time Filter */}
          <div className="relative group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Clock size={14} />
             </div>
             <select 
                value={filters.range}
                onChange={(e) => onFilterChange('range', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-opus-blue/20 appearance-none cursor-pointer hover:border-opus-blue transition-colors shadow-sm"
             >
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
             </select>
             <ChevronLeft size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 -rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Topbar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{title.replace('-', ' & ')}</h1>
        <span className="mx-3 text-slate-300 text-xl font-light">/</span>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Oct 2023</span>
      </div>
      
      <div className="flex items-center space-x-4">
         <button className="flex items-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-opus-blue bg-white border border-slate-200 hover:border-opus-blue hover:bg-blue-50/50 rounded-lg transition-all shadow-sm">
            <Download size={16} className="mr-2" /> Export Report
         </button>
         <div className="h-10 w-10 rounded-full bg-gradient-to-br from-opus-blue to-indigo-600 text-white flex items-center justify-center font-bold text-sm ring-4 ring-blue-50 shadow-lg cursor-pointer hover:scale-105 transition-transform">
           JD
         </div>
      </div>
    </header>
  );
};
