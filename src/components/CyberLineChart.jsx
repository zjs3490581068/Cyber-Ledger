import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { formatMoney } from '../utils';

export default function CyberLineChart({ transactions, categories, period }) {
    const data = useMemo(() => {
        // 找到能够结转的极客开销 (AutoDL/API等)
        const cyberCategoryIds = categories.filter(c => c.isRollover).map(c => c.id);
        if (cyberCategoryIds.length === 0) return [];

        let cyberExpenses = transactions.filter(t => t.type === 'expense' && cyberCategoryIds.includes(t.categoryId));

        // 按周期过滤
        if (period) {
            cyberExpenses = cyberExpenses.filter(t => t.date.startsWith(period));
        }

        // 按日期聚合
        const dailyData = {};
        cyberExpenses.forEach(t => {
            const day = t.date.split('-').slice(1).join('-'); // MM-DD
            dailyData[day] = (dailyData[day] || 0) + t.amount;
        });

        // 排序组装
        const sortedDates = Object.keys(dailyData).sort();

        // 累积消费计算 (可选: 如果需要展示累计燃烧趋势)
        let cumulative = 0;
        return sortedDates.map(date => {
            cumulative += dailyData[date];
            return {
                date,
                amount: dailyData[date],
                cumulative
            };
        });
    }, [transactions, categories, period]);

    if (data.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg text-sm">
                    <p className="font-medium text-gray-800 mb-1">{label}</p>
                    <p className="text-blue-600">单日燃烧: {formatMoney(payload[0].value)}</p>
                    <p className="text-gray-500 text-xs">累计: {formatMoney(payload[0].payload.cumulative)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <Activity size={20} className="text-blue-500" />
                    <h2>结转项目燃烧趋势 (API/AutoDL)</h2>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            tickFormatter={(value) => `¥${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
