import React, { useEffect, useState } from 'react';
import { Card } from '../components/Shared';
import { COLORS, GLASS_TOOLTIP_STYLE } from '../constants';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart } from 'recharts';
import { Flag, Star, Car, Home, Plane, Calculator, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatINR, formatCompactINR } from '../utils';
import { FinancialGoal } from '../types';

interface GoalsProps {
    data: FinancialGoal[];
}

const Goals: React.FC<GoalsProps> = ({ data: goals }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Monte Carlo Mock (INR)
  const simulationData = Array.from({length: 30}).map((_, i) => ({
      year: 2023 + i,
      p10: 5000000 * Math.pow(1.08, i),
      p50: 5000000 * Math.pow(1.12, i),
      p90: 5000000 * Math.pow(1.15, i),
  }));

  const getIcon = (name: string) => {
      if (name.includes('Home')) return Home;
      if (name.includes('Car')) return Car;
      if (name.includes('Trip')) return Plane;
      return Flag;
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} className="text-opus-red ml-2" fill="currentColor" fillOpacity={0.1} />;
      case 'medium': return <AlertTriangle size={16} className="text-opus-amber ml-2" fill="currentColor" fillOpacity={0.1} />;
      case 'low': return <CheckCircle size={16} className="text-opus-green ml-2" fill="currentColor" fillOpacity={0.1} />;
      default: return null;
    }
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goal List */}
            <div className="space-y-6">
                {goals.map((goal) => {
                    const Icon = getIcon(goal.name);
                    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    
                    // Logic for status
                    // Simplistic "On Track" calculation: 
                    // If (Current + (Monthly * MonthsRemaining)) >= Target
                    const today = new Date();
                    const targetDate = new Date(goal.targetDate);
                    const monthsRemaining = Math.max(0, (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
                    const projectedAmount = goal.currentAmount + (goal.monthlyContribution * monthsRemaining);
                    const isOnTrack = projectedAmount >= goal.targetAmount;

                    let StatusIcon = CheckCircle;
                    let statusText = "On Track";
                    let statusColorClass = "bg-green-50 text-opus-green";

                    if (!isOnTrack) {
                        if (goal.priority === 'high') {
                            StatusIcon = AlertCircle;
                            statusText = "Off Track";
                            statusColorClass = "bg-red-50 text-opus-red";
                        } else {
                            StatusIcon = AlertTriangle;
                            statusText = "At Risk";
                            statusColorClass = "bg-amber-50 text-opus-amber";
                        }
                    }

                    return (
                        <Card key={goal.id} className="relative overflow-hidden hover:shadow-glow transition-all duration-300">
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center">
                                    <div className="p-3.5 bg-blue-50 text-opus-blue rounded-xl mr-4 shadow-sm">
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                          <h3 className="font-bold text-slate-900 text-lg tracking-tight">{goal.name}</h3>
                                          {getPriorityIcon(goal.priority)}
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Target: {goal.targetDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-900">{formatINR(goal.currentAmount)}</div>
                                    <div className="text-xs text-slate-400 font-medium mt-1">of {formatINR(goal.targetAmount)}</div>
                                </div>
                             </div>

                             {/* Progress Bar */}
                             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-2 shadow-inner">
                                 <div 
                                    className="h-full bg-gradient-to-r from-opus-blue to-opus-teal shadow-sm relative transition-all duration-[1500ms] ease-out" 
                                    style={{ width: `${mounted ? percent : 0}%` }}
                                 >
                                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/20"></div>
                                 </div>
                             </div>
                             <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wide">
                                 <span>Start</span>
                                 <span>50%</span>
                                 <span>Goal</span>
                             </div>
                             
                             <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                                 <div className="text-sm">
                                     <span className="text-slate-500">Monthly Contribution: </span>
                                     <span className="font-bold text-slate-800">{formatINR(goal.monthlyContribution)}</span>
                                 </div>
                                 <div className={`flex items-center text-sm font-bold px-3 py-1 rounded-full ${statusColorClass} transition-colors duration-300`}>
                                     <StatusIcon size={14} className="mr-1.5 stroke-2" /> {statusText}
                                 </div>
                             </div>
                        </Card>
                    )
                })}
                {goals.length === 0 && <div className="text-slate-500 text-center py-10">No goals found in upload.</div>}
            </div>

            {/* Simulation */}
            <Card className="bg-slate-900 text-white border-slate-800">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Retirement Projection</h2>
                        <p className="text-sm text-slate-400">Monte Carlo Simulation (10,000 runs)</p>
                    </div>
                </div>
                
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={simulationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactINR(v)} tick={{fill: '#94a3b8'}} />
                            <Tooltip 
                                formatter={(v: number) => formatINR(v)}
                                contentStyle={{
                                  ...GLASS_TOOLTIP_STYLE,
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  color: '#0F172A' // Overriding color for readability on light tooltip
                                }}
                                labelStyle={{color: '#64748B'}}
                            />
                            
                            {/* Confidence Bands */}
                            <Area type="monotone" dataKey="p90" stroke="none" fill={COLORS.blue} fillOpacity={0.2} />
                            <Area type="monotone" dataKey="p10" stroke="none" fill="#0f172a" fillOpacity={1} /> {/* Masking for band effect */}
                            
                            <Line type="monotone" dataKey="p50" stroke={COLORS.blue} strokeWidth={3} dot={false} name="Median Outcome" />
                            <Line type="monotone" dataKey="p90" stroke={COLORS.green} strokeWidth={1} strokeDasharray="3 3" dot={false} name="Optimistic" />
                            <Line type="monotone" dataKey="p10" stroke={COLORS.amber} strokeWidth={1} strokeDasharray="3 3" dot={false} name="Conservative" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-blue-200">
                    <strong className="text-white block mb-1 text-lg">87% Success Rate</strong>
                    Based on your current savings rate and asset allocation, you are highly likely to meet your retirement goal of <strong>{formatINR(50000000)}</strong> by age 60.
                </div>
            </Card>
        </div>
    </div>
  );
};

export default Goals;