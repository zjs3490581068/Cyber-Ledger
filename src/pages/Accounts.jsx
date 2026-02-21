import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus } from 'lucide-react';
import { formatMoney, formatLocalDate, formatLocalTime } from '../utils';

export default function Accounts({ accounts, setAccounts, transactions, setTransactions }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editBalance, setEditBalance] = useState('');

    const [newName, setNewName] = useState('');
    const [newBalance, setNewBalance] = useState('');

    // 过滤出未激活的账户
    const aliveAccounts = accounts.filter(a => a.status !== 'inactive');

    // 核心验算引擎：基于所有历史流水计算每张卡的动态准确余额
    const dynamicAccounts = aliveAccounts.map(account => {
        let currentBalance = account.balance || 0;
        transactions.forEach(t => {
            if (t.fromAccountId === account.id) currentBalance -= t.amount;
            if (t.toAccountId === account.id) currentBalance += t.amount;
        });
        return { ...account, currentBalance };
    });

    const totalAssets = dynamicAccounts.reduce((acc, a) => acc + a.currentBalance, 0);

    const handleSaveEdit = (accountId, oldCurrentBalance) => {
        if (!editName.trim()) return;

        // 更新账户名称
        setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, name: editName.trim() } : a));

        // 计算差额生成平账流水
        const newTargetBalance = parseFloat(editBalance) || 0;
        const diff = newTargetBalance - oldCurrentBalance;

        if (Math.abs(diff) > 0.01) {
            const type = diff > 0 ? 'income' : 'expense';
            const newTx = {
                id: 'tx_' + uuidv4().slice(0, 8),
                type,
                amount: Math.abs(diff),
                fromAccountId: type === 'expense' ? accountId : undefined,
                toAccountId: type === 'income' ? accountId : undefined,
                date: formatLocalDate(),
                note: `[金库校准] 人工重置当期总额 (自动抹平修正)`,
                isReimbursable: false,
                isReimbursed: false,
            };
            setTransactions(prev => [newTx, ...prev]);
        }
        setEditingId(null);
    };

    const handleHideAccount = (id) => {
        if (confirm('隐藏账户后仅从当期大盘隐去，历史流水关联不受影响。确认隐藏该实体卡片？')) {
            setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: 'inactive' } : a));
        }
    };

    const handleAddAccount = () => {
        if (!newName.trim()) return;
        setAccounts(prev => [...prev, {
            id: 'a_' + uuidv4().slice(0, 8),
            name: newName.trim(),
            balance: parseFloat(newBalance) || 0,
            status: 'active'
        }]);
        setNewName('');
        setNewBalance('');
    };

    return (
        <div className="px-4 py-8 space-y-8 max-w-lg mx-auto pb-32">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2 tracking-tight">实体资产保险柜</h2>

            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center mb-2">
                    <p className="text-gray-400 text-sm font-medium">总净资产</p>
                    <div className="flex items-baseline mb-2">
                        {formatMoney(totalAssets)}
                    </div>
                </div>
            </section>

            {/* 单张实体账户独立流水视图挂载与编辑 */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">当前账户</h3>
                <div className="space-y-3">
                    {dynamicAccounts.map(account => (
                        <div key={account.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            {editingId === account.id ? (
                                <div className="flex flex-col gap-3 w-full">
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="w-full">
                                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-400" placeholder="实体账户名称 (如：招行储蓄卡)" />
                                        </div>
                                        <div className="w-full -mt-1">
                                            <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="w-full px-3 py-2 text-sm font-bold text-blue-700 border border-gray-200 rounded-xl bg-blue-50/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-400" placeholder="当前绝对开户额度 (¥)" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={() => setEditingId(null)} className="text-gray-500 font-medium text-xs px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors">取消修改</button>
                                        <button onClick={() => handleSaveEdit(account.id, account.currentBalance)} className="text-white font-bold text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors active:scale-95">定稿并平账</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg shadow-inner bg-white border border-gray-100 text-gray-700">
                                            💳
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-800 text-sm tracking-tight truncate">{account.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">基础资产实体</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end flex-shrink-0">
                                        <p className="text-lg font-bold text-gray-800 tracking-tight whitespace-nowrap">
                                            {formatMoney(account.currentBalance)}
                                        </p>
                                        <div className="flex gap-2 mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingId(account.id); setEditName(account.name); setEditBalance(account.currentBalance); }} className="text-blue-600 hover:text-blue-800 text-[11px] font-bold px-2 py-0.5 bg-blue-50 rounded whitespace-nowrap">编辑</button>
                                            <button onClick={() => handleHideAccount(account.id)} className="text-red-500 hover:text-red-700 text-[11px] font-bold px-2 py-0.5 bg-red-50 rounded whitespace-nowrap">删除</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="mt-6 pt-4 border-t border-dashed border-gray-200 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-gray-500 bg-gray-100 border border-gray-200"><Plus size={16} /></div>
                            <span className="font-semibold text-gray-800 text-sm">新建账户</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="实体资产名称 (如：招行储蓄卡)" className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-400" />
                            <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="初始期初金额 (¥)" className="w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-xl bg-white focus:bg-gray-50 transition-colors outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-400" />
                            <button onClick={handleAddAccount} className="w-full mt-1 px-8 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-1">
                                <Plus size={18} /> 新建账户
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
