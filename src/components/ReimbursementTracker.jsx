import React from 'react';
import { BadgeDollarSign, CheckSquare } from 'lucide-react';
import { formatMoney, formatDate } from '../utils';

export default function ReimbursementTracker({ transactions, categories, accounts, onReimburse }) {
    // 筛选出所有待报销且未报销的账单
    const pendingTransactions = transactions.filter(t => t.isReimbursable && !t.isReimbursed);

    if (pendingTransactions.length === 0) return null;

    const totalPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-800 font-semibold">
                    <BadgeDollarSign size={20} />
                    <span>待报销池</span>
                </div>
                <div className="text-right">
                    <p className="text-blue-900 font-bold text-lg">{formatMoney(totalPending)}</p>
                    <p className="text-blue-600 text-xs">总计 {pendingTransactions.length} 笔待处理</p>
                </div>
            </div>

            <div className="space-y-3">
                {pendingTransactions.map(t => {
                    const category = categories.find(c => c.id === t.categoryId);
                    return (
                        <div key={t.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {category?.name || '未知'} <span className="text-xs text-gray-400 font-normal ml-1">({formatDate(t.date)})</span>
                                </p>
                                {t.note && <p className="text-xs text-gray-500 mt-0.5">{t.note}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-900">{formatMoney(t.amount)}</span>
                                <button
                                    onClick={() => onReimburse(t.id, t.amount)}
                                    className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                    title="标记为已报销"
                                >
                                    <CheckSquare size={14} />
                                    平账
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
