import React from 'react';
import { Trash2, ArrowRightLeft } from 'lucide-react';
import { formatMoney, formatDate } from '../utils';

export default function TransactionList({ transactions, categories, accounts, tags, onDelete }) {
    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📝</span>
                </div>
                <h3 className="text-gray-900 font-medium">暂无账单记录</h3>
                <p className="text-gray-500 text-sm mt-1">开始记录你的第一笔账单吧</p>
            </div>
        );
    }

    // 按日期分组
    const grouped = transactions.reduce((acc, t) => {
        if (!acc[t.date]) acc[t.date] = [];
        acc[t.date].push(t);
        return acc;
    }, {});

    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="space-y-6">
            {dates.map(date => (
                <div key={date}>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 ml-2">{formatDate(date)}</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        {grouped[date].map((t, index) => {
                            const category = categories.find(c => c.id === t.categoryId);
                            const isTransfer = t.type === 'transfer';
                            const isExpense = t.type === 'expense';

                            const fromAccount = accounts?.find(a => a.id === t.fromAccountId);
                            const toAccount = accounts?.find(a => a.id === t.toAccountId);

                            let icon, title, amountClass, amountPrefix, accountTag;
                            if (isTransfer) {
                                icon = <ArrowRightLeft size={16} />;
                                title = '转账';
                                amountClass = 'text-gray-500';
                                amountPrefix = '';
                                accountTag = `${fromAccount?.name || '?'} ➝ ${toAccount?.name || '?'}`;
                            } else {
                                icon = category?.name.charAt(0) || '?';
                                title = category?.name || '未知分类';
                                amountClass = isExpense ? 'text-gray-900' : 'text-green-600';
                                amountPrefix = isExpense ? '-' : '+';
                                accountTag = isExpense ? `${fromAccount?.name || '?'} 出账` : `入账 ${toAccount?.name || '?'}`;
                            }

                            return (
                                <div
                                    key={t.id}
                                    className={`flex items-center justify-between p-4 ${index !== grouped[date].length - 1 ? 'border-b border-gray-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${isTransfer ? 'bg-blue-50 text-blue-500' : isExpense ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                            {icon}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 font-medium text-sm truncate">{title}</p>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium truncate flex-shrink-0 max-w-[85px] border border-gray-200">
                                                    💳 {accountTag}
                                                </span>
                                            </div>
                                            {t.note && <p className="text-gray-400 text-xs mt-0.5 truncate">{t.note}</p>}
                                            {t.tags && t.tags.length > 0 && tags && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {t.tags.map(tagId => {
                                                        const tagObj = tags.find(tg => tg.id === tagId);
                                                        return tagObj ? <span key={tagId} className="text-[10px] bg-indigo-50/80 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-100/50 truncate max-w-[60px]">#{tagObj.name}</span> : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`font-semibold whitespace-nowrap ${amountClass}`}>
                                            {amountPrefix}{formatMoney(t.amount)}
                                        </span>
                                        <button
                                            onClick={() => onDelete(t.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                                            title="删除记录"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
