import React from 'react';
import { Card, SectionHeader } from '../components/Shared';
import { COLORS } from '../constants';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { AlertCircle, CheckCircle, Grid } from 'lucide-react';
import { formatINR } from '../utils';
import { BudgetCategory } from '../types';

interface BudgetProps {
    data: BudgetCategory[];
}

const Budget: React.FC<BudgetProps> = ({ data: budgets }) => {
  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((cat, idx) => {
          const percent = cat.budget > 0 ? (cat.actual / cat.budget) * 100 : 0;
          const isOver = percent > 100;
          const color = isOver ? COLORS.red : percent > 80 ? COLORS.amber : COLORS.green;
          
          const data = [{ name: 'L1', value: Math.min(percent, 100), fill: color }];

          return (
            <Card key={idx} className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{cat.category}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">
                        {isOver ? 'Over budget' : 'Remaining'}: <span className="font-mono text-slate-600 ml-1">{formatINR(Math.abs(cat.budget - cat.actual))}</span>
                    </p>
                </div>
                {isOver ? <AlertCircle size={20} className="text-opus-red" /> : <CheckCircle size={20} className="text-opus-green" />}
              </div>
              
              <div className="h-40 w-full relative flex items-center justify-center my-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="75%" outerRadius="100%" data={data} startAngle={180} endAngle={0} barSize={12}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={12} />
                    </RadialBarChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-5 text-center">
                    <span className={`text-3xl font-extrabold tracking-tight ${isOver ? 'text-opus-red' : 'text-slate-800'}`}>{Math.round(percent)}%</span>
                 </div>
              </div>

              {/* Matrix Bar below */}
              <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}></div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <SectionHeader title="Budget Variance Matrix" subtitle="Month-over-Month Category Performance" icon={Grid} />
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs rounded-tl-lg">Category</th>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => <th key={m} className="p-4 text-center font-bold text-slate-600 uppercase tracking-wider text-xs">{m}</th>)}
                        <th className="p-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs rounded-tr-lg">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {budgets.map((cat, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 font-semibold text-slate-800">{cat.category}</td>
                             {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, j) => {
                                 // Simulate variance
                                 const variance = Math.floor(Math.random() * 200) - 100;
                                 const isNeg = variance > 50; // bad
                                 return (
                                     <td key={j} className="p-4 text-center">
                                         <span className={`px-2 py-1 rounded-md text-xs font-bold ${isNeg ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {variance > 0 ? '+' : ''}{variance}%
                                         </span>
                                     </td>
                                 )
                             })}
                            <td className="p-4 text-right font-mono font-medium text-slate-600 group-hover:text-opus-blue transition-colors">{formatINR(cat.actual * 5)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default Budget;