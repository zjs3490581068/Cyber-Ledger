import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatMoney } from '../utils';

// Tailwind Colors
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function ExpensePieChart({ transactions, categories, period }) {
    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');

        // 可扩容：根据 period (如 '2026-02') 过滤
        let filteredExpenses = expenses;
        if (period) {
            filteredExpenses = expenses.filter(t => t.date.startsWith(period));
        }

        const stats = {};
        filteredExpenses.forEach(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const name = cat?.name || '未知分类';
            stats[name] = (stats[name] || 0) + t.amount;
        });

        return Object.keys(stats)
            .map(name => ({ name, value: stats[name] }))
            .sort((a, b) => b.value - a.value)
            .filter(d => d.value > 0);
    }, [transactions, categories, period]);

    if (data.length === 0) return null;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg text-sm">
                    <p className="font-medium text-gray-800 mb-1">{payload[0].name}</p>
                    <p className="text-gray-600">{formatMoney(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center gap-2 text-gray-800 font-semibold mb-6">
                <PieChartIcon size={20} className="text-gray-400" />
                <h2>支出构成分析</h2>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-6">
                {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-600 truncate max-w-[80px]">{entry.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatMoney(entry.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
