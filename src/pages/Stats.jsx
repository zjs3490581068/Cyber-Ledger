import React, { useState, useMemo } from 'react';
import { formatLocalDate, formatLocalTime } from '../utils';

import { CalendarRange, WalletCards } from 'lucide-react';
import ExpensePieChart from '../components/ExpensePieChart';
import CyberLineChart from '../components/CyberLineChart';

export default function Stats({ accounts, transactions, categories, viewPeriod, budget }) {
    const currentMonthPrefix = formatLocalDate().substring(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthPrefix);

    const availableMonths = useMemo(() => {
        const months = new Set(transactions.map(t => t.date.substring(0, 7)));
        months.add(currentMonthPrefix);
        return Array.from(months).sort().reverse();
    }, [transactions, currentMonthPrefix]);

    const monthTx = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);

    const monthExpense = useMemo(() => {
        let totalSpendFromRollover = 0;
        categories.filter(c => c.isRollover).forEach(cat => {
            const allocated = budget.categoryLimits?.[cat.id] || 0;
            const initialRollover = budget.rolloverBalances?.[cat.id] || 0;

            const pastTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date.substring(0, 7) < selectedMonth && !t.isReimbursable);
            const pastSpent = pastTx.reduce((sum, t) => sum + t.amount, 0);

            const allPastTx = transactions.filter(t => t.date.substring(0, 7) < selectedMonth);
            let activePastMonths = 0;
            if (allPastTx.length > 0) {
                const minDateStr = allPastTx.reduce((min, t) => t.date < min ? t.date : min, allPastTx[0].date);
                const [mY, mM] = minDateStr.substring(0, 7).split('-').map(Number);
                const [cY, cM] = selectedMonth.split('-').map(Number);
                activePastMonths = Math.max(0, (cY - mY) * 12 + (cM - mM));
            }

            const pastBudget = activePastMonths * allocated + initialRollover;
            const computedRollover = Math.max(0, pastBudget - pastSpent);

            const currentTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date.startsWith(selectedMonth) && !t.isReimbursable);
            const currentSpent = currentTx.reduce((sum, t) => sum + t.amount, 0);

            const spendFromRollover = Math.min(currentSpent, computedRollover);
            totalSpendFromRollover += spendFromRollover;
        });

        const grossMonthExpense = monthTx.reduce((sum, t) => {
            if (t.type === 'expense' && !t.isReimbursable) {
                const cat = categories.find(c => c.id === t.categoryId);
                if (cat && !cat.isAnnualFixed) {
                    return sum + t.amount;
                }
            }
            return sum;
        }, 0);

        return Math.max(0, grossMonthExpense - totalSpendFromRollover);
    }, [monthTx, categories, transactions, selectedMonth, budget]);

    const monthlyTotal = budget?.monthlyTotal || 2500;
    const progress = Math.min((monthExpense / monthlyTotal) * 100, 100);

    return (
        <div className="px-4 py-8 space-y-8 max-w-lg mx-auto pb-24">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">财务统计透视</h2>
                <div className="relative">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none bg-blue-50 text-blue-600 font-semibold text-sm py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        {availableMonths.map(m => (
                            <option key={m} value={m}>{m.replace('-', '年')}月</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-800 font-semibold mb-4">
                    <WalletCards size={20} className="text-blue-500" />
                    <h3>{selectedMonth.replace('-', '年')}月 预算进度</h3>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">已消费生活额度</span>
                        <span className="font-semibold text-gray-800">¥{monthExpense.toFixed(2)} / ¥{monthlyTotal}</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${progress >= 90 ? 'bg-red-500' : progress >= 75 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </section>

            <section>
                <ExpensePieChart
                    transactions={transactions}
                    categories={categories}
                    period={selectedMonth}
                />
            </section>

            <section>
                <CyberLineChart
                    transactions={transactions}
                    categories={categories}
                    period={selectedMonth}
                />
            </section>
        </div>
    );
}
