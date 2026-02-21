import React, { useState, useEffect } from 'react';
import { formatLocalDate, formatLocalTime } from '../utils';

import { PlusCircle, MinusCircle, CheckCircle2, ArrowRightLeft, Cpu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AutoDLCalculator from './AutoDLCalculator';
import APICalculator from './APICalculator';

export default function TransactionForm({ categories, accounts, autodlPrices, apiModels, tags, onAddTransaction }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [fromAccountId, setFromAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(formatLocalDate());
    const [isReimbursable, setIsReimbursable] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    // 监听分类是否为 AutoDL/API 从而展示特定计算器 (原先写死的是“赛博消费”)
    const selectedCategory = categories.find(c => c.id === categoryId);
    const isAutoDL = selectedCategory?.isAutoDL;
    const isAPI = selectedCategory?.isAPI;

    // 过滤出活跃账户
    const activeAccounts = accounts.filter(a => a.status !== 'inactive');

    // 初始化默认账户供选择
    useEffect(() => {
        if (activeAccounts.length > 0) {
            setFromAccountId(activeAccounts.find(a => a.type === 'standard')?.id || activeAccounts[0].id);
            setToAccountId(activeAccounts.find(a => a.type === 'saving')?.id || activeAccounts[0].id);
        }
    }, [accounts]);

    const filteredCategories = categories.filter(c => c.type === type);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount <= 0) return alert('请输入有效的金额');
        if (type === 'transfer') {
            if (!fromAccountId || !toAccountId) return alert('请选择转出和转入账户');
            if (fromAccountId === toAccountId) return alert('转出和转入账户不能相同');
        } else {
            if (!categoryId) return alert('请选择分类');
        }

        const newTransaction = {
            id: uuidv4(),
            type,
            amount: parseFloat(amount),
            categoryId: type === 'transfer' ? undefined : categoryId,
            fromAccountId: (type === 'expense' || type === 'transfer') ? fromAccountId : undefined,
            toAccountId: (type === 'income' || type === 'transfer') ? toAccountId : undefined,
            date,
            note,
            tags: selectedTags,
            isReimbursable: type === 'expense' ? isReimbursable : false,
            isReimbursed: false,
        };

        onAddTransaction(newTransaction);

        // 重置表单
        setAmount('');
        setNote('');
        setSelectedTags([]);
        setIsReimbursable(false);
    };

    const handleCalculatorResult = (calcAmount, calcNote) => {
        setAmount(calcAmount.toString());
        setNote(calcNote);
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">记录新账单</h2>
            <div className="flex gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => { setType('expense'); setCategoryId(''); }}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${type === 'expense' ? 'bg-red-50 text-red-600 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    <MinusCircle size={18} />
                    支出
                </button>
                <button
                    type="button"
                    onClick={() => { setType('income'); setCategoryId(''); }}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${type === 'income' ? 'bg-green-50 text-green-600 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    <PlusCircle size={18} />
                    收入
                </button>
                <button
                    type="button"
                    onClick={() => { setType('transfer'); setCategoryId(''); }}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${type === 'transfer' ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    <ArrowRightLeft size={18} />
                    转账
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg font-medium placeholder-gray-400"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* 转出/入账户选择器（三态统合） */}
                {type === 'expense' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">支出账户</label>
                        <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                            {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                )}
                {type === 'income' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">收入入驻账户</label>
                        <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                            {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                )}
                {type === 'transfer' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">转出账户</label>
                            <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                                {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">转入账户</label>
                            <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                                {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* 分类及专属组件块 */}
                {type !== 'transfer' && (
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-gray-700">分类</label>
                            {selectedCategory?.isAnnualFixed && (
                                <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">不计入当月预算</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {filteredCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`py-2 px-3 rounded-lg text-sm transition-colors border ${categoryId === cat.id
                                        ? 'bg-gray-800 text-white border-gray-800'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* 算力/API 专属计算器挂载 */}
                        {(isAutoDL || isAPI) && type === 'expense' && (
                            <div className="mt-4 space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                {isAutoDL && <AutoDLCalculator autodlPrices={autodlPrices} onCalculate={handleCalculatorResult} />}
                                {isAPI && <APICalculator apiModels={apiModels} onCalculate={handleCalculatorResult} />}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">备注 (可选)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm placeholder-gray-400"
                            placeholder="如：午饭"
                        />
                    </div>
                </div>

                {tags && tags.length > 0 && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">附加交叉标签</label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => toggleTag(t.id)}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors border font-medium ${selectedTags.includes(t.id)
                                            ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    #{t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'expense' && (
                    <label className="flex items-center gap-2 cursor-pointer mt-2 select-none w-max">
                        <input
                            type="checkbox"
                            checked={isReimbursable}
                            onChange={(e) => setIsReimbursable(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">此笔支出待报销</span>
                    </label>
                )}

                <button
                    type="submit"
                    className="w-full py-3 mt-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={18} />
                    保存记录
                </button>
            </form>
        </div>
    );
}
