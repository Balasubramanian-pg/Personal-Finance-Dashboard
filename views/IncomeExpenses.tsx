import React, { useState, useMemo, useEffect } from 'react';
import { Card, SectionHeader, Badge } from '../components/Shared';
import { COLORS, GLASS_TOOLTIP_STYLE } from '../constants';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatINR, formatCompactINR } from '../utils';
import { 
    TrendingUp, PieChart as PieIcon, X, Wallet, Search, Download, Filter, 
    RefreshCcw, Clock, CheckCircle, ShoppingBag, Utensils, Car, Zap, 
    Clapperboard, Briefcase, MoreHorizontal
} from 'lucide-react';
import { AccountFilter, GlobalFilterRange, Transaction } from '../types';

interface IncomeExpensesProps {
  filters: {
    range: GlobalFilterRange;
    account: AccountFilter;
  };
  data: Transaction[];
}

type TagFilterType = 'All' | 'Recurring' | 'One-time' | 'Pending';

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
         <div className="flex items-center space-x-3 w-1/2">
             <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
             <div className="space-y-2 w-full">
                 <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                 <div className="h-3 bg-slate-100 rounded w-1/4"></div>
             </div>
         </div>
         <div className="h-5 bg-slate-100 rounded w-20"></div>
      </div>
    ))}
  </div>
);

const IncomeExpenses: React.FC<IncomeExpensesProps> = ({ filters, data: transactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<TagFilterType>('All');
  const [loading, setLoading] = useState(true);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]); 

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryIcon = (category: string) => {
      switch(category) {
          case 'Groceries': return <ShoppingBag size={18} className="text-emerald-500 bg-emerald-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          case 'Food': return <Utensils size={18} className="text-orange-500 bg-orange-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          case 'Transport': return <Car size={18} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          case 'Utilities': return <Zap size={18} className="text-yellow-500 bg-yellow-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          case 'Entertainment': return <Clapperboard size={18} className="text-purple-500 bg-purple-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          case 'Shopping': return <ShoppingBag size={18} className="text-pink-500 bg-pink-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          case 'Income': return <Briefcase size={18} className="text-slate-600 bg-slate-100 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
          default: return <Wallet size={18} className="text-slate-500 bg-slate-50 p-1.5 rounded-lg mr-3 shrink-0 w-8 h-8" />;
      }
  };

  const uniqueDescriptions = useMemo(() => {
    const descriptions = new Set(transactions.map(tx => tx.description));
    return Array.from(descriptions);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (filters.account !== 'All Accounts' && tx.account !== filters.account) return false;
      if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (tagFilter === 'Recurring' && !tx.isRecurring) return false;
      if (tagFilter === 'One-time' && tx.isRecurring) return false;
      if (tagFilter === 'Pending' && tx.status !== 'pending') return false;
      return true;
    });
  }, [filters.account, searchTerm, tagFilter, transactions]);

  const groupedTransactions = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);

      filteredTransactions.slice(0, 50).forEach(tx => {
          const date = new Date(tx.date);
          let key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          if (date.toDateString() === today.toDateString()) key = "Today";
          else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
          if (!groups[key]) groups[key] = [];
          groups[key].push(tx);
      });
      return groups;
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Type', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.date, `"${tx.description}"`, tx.category, tx.account, tx.amount, tx.type, tx.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamically calculate trend data based on transactions
  const trendData = useMemo(() => {
     // Group by month
     const months: Record<string, { income: number, expenses: number }> = {};
     transactions.forEach(tx => {
         const d = new Date(tx.date);
         const key = d.toLocaleString('default', { month: 'short' });
         if (!months[key]) months[key] = { income: 0, expenses: 0 };
         if (tx.type === 'income') months[key].income += tx.amount;
         else months[key].expenses += tx.amount;
     });
     
     // Ensure order
     const orderedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
     return orderedMonths.map(m => ({
         name: m,
         income: months[m]?.income || 0,
         expenses: months[m]?.expenses || 0,
         get net() { return this.income - this.expenses }
     })).filter(d => d.income > 0 || d.expenses > 0); // Only show active months if realistic data, or default mock fallback?
  }, [transactions]);
  
  // If no trend data (e.g. fresh upload with no history), show empty or placeholder?
  // For demo, we might want to keep the chart existing but empty, or fallback to something.
  // For now, let's just use what we calculated.

  const totalNet = trendData.reduce((acc, curr) => acc + (curr.income - curr.expenses), 0);
  
  // Aggregate Expenses for Pie
  const rawPieData = useMemo(() => {
      const cats: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      return Object.entries(cats).map(([name, value], i) => ({
          name, value, fill: COLORS.charts[i % COLORS.charts.length]
      }));
  }, [transactions]);

  const pieData = rawPieData.filter(d => !hiddenCategories.includes(d.name));
  const toggleCategory = (name: string) => {
      setHiddenCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const CustomTrendTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
          const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
          const exp = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
          const net = inc - exp;
          
          return (
              <div style={GLASS_TOOLTIP_STYLE} className="min-w-[180px]">
                  <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
                  <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                          <span className="text-emerald-600 font-medium">Income</span>
                          <span className="font-bold text-slate-700">{formatCompactINR(inc)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500 font-medium">Expenses</span>
                          <span className="font-bold text-slate-700">{formatCompactINR(exp)}</span>
                      </div>
                      <div className="h-px bg-slate-200 my-1"></div>
                      <div className="flex justify-between text-sm">
                          <span className="text-opus-blue font-bold">Net Savings</span>
                          <span className={`font-bold ${net >= 0 ? 'text-opus-blue' : 'text-opus-red'}`}>
                              {net > 0 ? '+' : ''}{formatCompactINR(net)}
                          </span>
                      </div>
                  </div>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20">
      <Card>
        <SectionHeader 
            title="Income vs Expenses Trend" 
            subtitle="Monthly financial performance" 
            icon={TrendingUp} 
            action={
                 <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                     <span className="text-xs font-bold text-slate-400 uppercase">Total Net</span>
                     <span className={`text-sm font-bold ${totalNet >= 0 ? 'text-opus-blue' : 'text-opus-red'}`}>
                        {totalNet > 0 ? '+' : ''}{formatCompactINR(totalNet)}
                     </span>
                 </div>
            }
        />
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 500}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={formatCompactINR} />
              <Tooltip content={<CustomTrendTooltip />} cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="expenses" barSize={24} fill={COLORS.gray} radius={[6, 6, 0, 0]} fillOpacity={0.6} />
              <Line type="monotone" dataKey="income" stroke={COLORS.green} strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex justify-between items-start mb-6">
             <SectionHeader title="Expense Breakdown" subtitle="Distribution by category" icon={PieIcon} />
             {hiddenCategories.length > 0 && (
                 <button onClick={() => setHiddenCategories([])} className="text-xs font-medium text-opus-blue hover:underline">
                     Reset View
                 </button>
             )}
          </div>
          <div className="h-80 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1000}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatINR(val)} contentStyle={GLASS_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute left-0 top-0 bottom-0 w-full lg:w-[calc(100%-140px)] flex items-center justify-center pointer-events-none">
                <div className="text-center animate-fade-in">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total</p>
                    <p className="text-slate-800 text-2xl font-bold">
                        {formatCompactINR(pieData.reduce((a, b) => a + b.value, 0))}
                    </p>
                </div>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[140px] space-y-2 h-64 overflow-y-auto custom-scrollbar">
                {rawPieData.map((entry) => (
                    <div 
                        key={entry.name} 
                        onClick={() => toggleCategory(entry.name)}
                        className={`flex items-center text-xs cursor-pointer transition-all duration-200 ${hiddenCategories.includes(entry.name) ? 'opacity-30 grayscale' : 'opacity-100 hover:translate-x-1'}`}
                    >
                        <div className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: entry.fill }}></div>
                        <span className="font-medium text-slate-600 truncate">{entry.name}</span>
                    </div>
                ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col relative overflow-hidden min-h-[500px]">
          <div className="flex flex-col space-y-4 mb-4">
              <SectionHeader title="Recent Transactions" icon={Wallet} 
                action={
                    <button onClick={handleExportCSV} className="flex items-center text-sm font-medium text-slate-600 hover:text-opus-blue bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Download size={14} className="mr-2" /> Export
                    </button>
                } 
              />
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        list="tx-suggestions"
                        placeholder="Search description..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opus-blue/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <datalist id="tx-suggestions">
                          {uniqueDescriptions.map(d => <option key={d} value={d} />)}
                      </datalist>
                      {searchTerm && (
                          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              <X size={14} />
                          </button>
                      )}
                  </div>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {[{ id: 'All', icon: Filter }, { id: 'Recurring', icon: RefreshCcw }, { id: 'One-time', icon: CheckCircle }, { id: 'Pending', icon: Clock }]
                  .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setTagFilter(tag.id as TagFilterType)}
                        className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                            tagFilter === tag.id ? 'bg-opus-blue text-white border-opus-blue shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                          <tag.icon size={12} className="mr-1.5" />
                          {tag.id}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex-1 overflow-auto -mx-2 px-2">
            {loading ? <TableSkeleton /> : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <Search size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium">No transactions found</p>
                    <button onClick={() => { setSearchTerm(''); setTagFilter('All'); }} className="text-sm font-bold text-opus-blue bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors mt-2">
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-1">
                    {Object.entries(groupedTransactions).map(([groupDate, transactions]) => (
                        <div key={groupDate}>
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-2 border-b border-slate-100 mb-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">{groupDate}</h4>
                            </div>
                            {(transactions as Transaction[]).map((tx) => (
                                <div key={tx.id} className="group flex items-center justify-between p-3 mb-1 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-sm cursor-default">
                                    <div className="flex items-center">
                                        {getCategoryIcon(tx.category)}
                                        <div>
                                            <div className={`text-sm font-semibold ${tx.status === 'pending' ? 'italic text-gray-500' : 'text-slate-700'}`}>{tx.description}</div>
                                            <div className="flex items-center mt-0.5 space-x-2">
                                                <span className="text-xs text-slate-400">{tx.account}</span>
                                                {tx.isRecurring && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 rounded border border-blue-100">Recurring</span>}
                                                {tx.status === 'pending' && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 rounded border border-amber-100 flex items-center"><Clock size={8} className="mr-1" /> Pending</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold ${tx.status === 'pending' ? 'text-gray-400 italic' : tx.type === 'expense' ? 'text-opus-red' : 'text-opus-green'}`}>
                                        {tx.type === 'income' ? '+' : ''}{formatINR(tx.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          {filteredTransactions.length > 50 && !loading && (
            <div className="pt-4 text-center border-t border-slate-100 bg-white sticky bottom-0 z-30">
                 <button onClick={() => setIsModalOpen(true)} className="text-sm font-semibold text-opus-blue hover:text-blue-700 transition-colors flex items-center justify-center w-full">
                     View All <MoreHorizontal size={16} className="ml-1" />
                 </button>
            </div>
          )}
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">All Transactions</h2>
                        <p className="text-sm text-slate-500 mt-1">Showing {filteredTransactions.length} results</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-auto p-0 bg-white">
                     <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 shadow-sm z-10 border-b border-slate-200">
                            <tr className="text-xs text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-6 font-semibold">Date</th>
                                <th className="py-3 px-6 font-semibold">Description</th>
                                <th className="py-3 px-6 font-semibold">Category</th>
                                <th className="py-3 px-6 font-semibold">Account</th>
                                <th className="py-3 px-6 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="py-3 px-6 text-sm text-slate-500 whitespace-nowrap">{tx.date}</td>
                                    <td className="py-3 px-6 text-sm font-semibold text-slate-800">
                                        <div className="flex items-center">
                                            {getCategoryIcon(tx.category)}
                                            <div>
                                                <div className={tx.status === 'pending' ? 'italic text-gray-500' : ''}>{tx.description}</div>
                                                {tx.isRecurring && <span className="text-[10px] text-blue-500 bg-blue-50 px-1 rounded border border-blue-100">Recurring</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6"><Badge type="neutral">{tx.category}</Badge></td>
                                    <td className="py-3 px-6 text-sm text-slate-500">{tx.account}</td>
                                    <td className={`py-3 px-6 text-sm font-bold text-right ${tx.status === 'pending' ? 'italic text-gray-400' : tx.type === 'expense' ? 'text-opus-red' : 'text-opus-green'}`}>
                                        {tx.type === 'income' ? '+' : ''}{formatINR(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenses;