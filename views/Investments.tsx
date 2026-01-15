import React, { useState, useMemo } from 'react';
import { Card, SectionHeader } from '../components/Shared';
import { COLORS, GLASS_TOOLTIP_STYLE } from '../constants';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, ComposedChart, Line, Brush } from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, PieChart as PieIcon, LineChart, ArrowRight } from 'lucide-react';
import { formatINR, formatCompactINR } from '../utils';
import { InvestmentHolding } from '../types';

interface InvestmentsProps {
    data: InvestmentHolding[];
}

const Investments: React.FC<InvestmentsProps> = ({ data: holdings }) => {
    const [range, setRange] = useState('ALL');

    // Calculate Total Portfolio Value dynamically
    const portfolioValue = useMemo(() => {
        return holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    }, [holdings]);

    // Mock Portfolio Growth (INR) with more detail
    const fullData = useMemo(() => Array.from({length: 60}).map((_, i) => {
        const base = portfolioValue; // Start near current value
        const growth = i * 150000;
        const volatility = Math.random() * 800000 - 400000;
        
        return {
            date: `2023-${Math.floor(i/5) + 1}-${(i%5)*5 + 1}`, // Rough weekly dates
            value: base + growth + volatility,
            nifty: base + (i * 120000) + (Math.random() * 600000 - 300000),
            invested: (base * 0.9) + (i * 100000), // Cumulative contributions
        };
    }), [portfolioValue]);

    const data = useMemo(() => {
        if (range === '1M') return fullData.slice(-5);
        if (range === '3M') return fullData.slice(-15);
        if (range === 'YTD') return fullData.slice(-30);
        return fullData;
    }, [range, fullData]);

    const allocationData = holdings.map(h => ({ name: h.ticker, value: h.allocation }));

    // Sorted Holdings by Allocation (Descending)
    const sortedHoldings = useMemo(() => {
        return [...holdings].sort((a, b) => b.allocation - a.allocation);
    }, [holdings]);

    const topHolding = sortedHoldings.length > 0 ? sortedHoldings[0].ticker : 'N/A';

    return (
        <div className="p-8 space-y-8 animate-fade-in pb-20">
            {/* Main Portfolio Chart */}
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-2 text-slate-500">
                             <TrendingUp size={18} />
                             <span className="font-semibold text-sm uppercase tracking-wider">Total Portfolio Value</span>
                        </div>
                        <div className="flex items-baseline space-x-4">
                             <span className="text-4xl font-bold text-slate-900 tracking-tight">{formatINR(portfolioValue)}</span>
                             <span className="text-sm font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">+11.2% YTD</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-4 md:mt-0 bg-slate-100 p-1 rounded-lg">
                        {['1M', '3M', 'YTD', '1Y', 'ALL'].map(p => (
                            <button 
                                key={p} 
                                onClick={() => setRange(p)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${range === p ? 'bg-white text-opus-blue shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <defs>
                                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.05}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={false} axisLine={false} />
                            <YAxis domain={['auto', 'auto']} tickFormatter={(v) => formatCompactINR(v)} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={GLASS_TOOLTIP_STYLE}
                                formatter={(val: number, name: string) => [formatINR(val), name === 'value' ? 'Portfolio' : name === 'nifty' ? 'Benchmark' : 'Net Invested']}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            
                            {/* Cumulative Contributions (Area) */}
                            <Area type="monotone" dataKey="invested" name="Net Invested" stroke="none" fill="url(#colorInvested)" />
                            
                            {/* Benchmark (Line) */}
                            <Line type="monotone" dataKey="nifty" name="Benchmark (S&P)" stroke={COLORS.gray} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            
                            {/* Portfolio Value (Line) */}
                            <Line type="monotone" dataKey="value" name="Portfolio Value" stroke={COLORS.blue} strokeWidth={3} dot={false} activeDot={{r: 6}} />
                            
                            {/* Zoom/Brush Control */}
                            <Brush dataKey="date" height={30} stroke={COLORS.blue} fill="#f8fafc" tickFormatter={() => ''} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Allocation Donut */}
                <Card className="flex flex-col items-center justify-center">
                     <SectionHeader title="Asset Allocation" icon={PieIcon} />
                     <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.charts[index % COLORS.charts.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={GLASS_TOOLTIP_STYLE} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                             <div className="text-slate-400 text-xs font-semibold uppercase">Top Holding</div>
                             <div className="text-slate-900 font-bold text-lg mt-1">{topHolding}</div>
                        </div>
                     </div>
                </Card>

                {/* Holdings Table */}
                <Card className="lg:col-span-2">
                    <SectionHeader title="Portfolio Holdings" subtitle="Live market positions" icon={LineChart} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                                <tr>
                                    <th className="py-3 px-4 rounded-tl-lg font-semibold">Ticker</th>
                                    <th className="py-3 px-4 font-semibold">Qty</th>
                                    <th className="py-3 px-4 font-semibold">Price</th>
                                    <th className="py-3 px-4 text-right font-semibold">Value</th>
                                    <th className="py-3 px-4 text-right rounded-tr-lg font-semibold">Gain/Loss</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedHoldings.map((h) => {
                                    const value = h.shares * h.currentPrice;
                                    const gain = (h.currentPrice - h.costBasis) * h.shares;
                                    const gainPercent = h.costBasis > 0 ? ((h.currentPrice - h.costBasis) / h.costBasis) * 100 : 0;
                                    
                                    const isSignificantGain = gainPercent > 10;
                                    const isSignificantLoss = gainPercent < -10;
                                    const isPos = gain > 0;

                                    return (
                                        <tr key={h.ticker} className="hover:bg-slate-50 transition-colors group">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mr-3 shadow-sm group-hover:scale-105 transition-transform">
                                                        {h.ticker.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{h.ticker}</div>
                                                        <div className="text-xs text-slate-400 font-medium">{h.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600 font-medium">{h.shares}</td>
                                            <td className="py-4 px-4 text-sm text-slate-600 font-medium">{formatINR(h.currentPrice)}</td>
                                            <td className="py-4 px-4 text-right font-bold text-slate-900">{formatINR(value)}</td>
                                            <td className="py-4 px-4 text-right">
                                                <div className={`flex items-center justify-end font-bold text-sm ${isPos ? 'text-opus-green' : 'text-opus-red'}`}>
                                                    {isSignificantGain ? (
                                                        <ArrowUp size={14} className="mr-1 stroke-2 text-opus-green"/>
                                                    ) : isSignificantLoss ? (
                                                        <ArrowDown size={14} className="mr-1 stroke-2 text-opus-red"/>
                                                    ) : (
                                                        <ArrowRight size={14} className="mr-1 stroke-2 text-slate-400"/>
                                                    )}
                                                    <span>{Math.abs(gainPercent).toFixed(1)}%</span>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">{isPos ? '+' : ''}{formatINR(gain)}</div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Investments;