import React, { useState } from 'react';
import { formatLocalDate, formatLocalTime } from '../utils';

import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function AccountManager({ accounts, setAccounts }) {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editBalance, setEditBalance] = useState('');

    const handleAdd = () => {
        if (!name) return;
        setAccounts([...accounts, {
            id: 'a_' + uuidv4().slice(0, 8),
            name,
            balance: parseFloat(balance || 0)
        }]);
        setName('');
        setBalance('');
    };

    const handleEditSave = (id) => {
        if (!editName) return;
        setAccounts(accounts.map(a => a.id === id ? { ...a, name: editName, balance: parseFloat(editBalance || 0) } : a));
        setEditingId(null);
    };

    return (
        <section className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">账户管理 (Account)</h3>
            <div className="space-y-2">
                {accounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        {editingId === acc.id ? (
                            <div className="flex items-center gap-2 flex-1 mr-2">
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-2 py-1 text-xs border rounded" />
                                <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="w-20 px-2 py-1 text-xs border rounded" />
                                <button onClick={() => handleEditSave(acc.id)} className="text-green-600 font-bold ml-1 text-xs">保存</button>
                                <button onClick={() => setEditingId(null)} className="text-gray-400 font-bold ml-1 text-xs">取消</button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <span className="text-sm font-medium mr-2">{acc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-gray-500">¥{acc.balance}</span>
                                    <button onClick={() => { setEditingId(acc.id); setEditName(acc.name); setEditBalance(acc.balance); }} className="text-blue-500 hover:text-blue-700 text-xs ml-2">修改</button>
                                    <button onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))} className="text-red-400 hover:text-red-600 ml-1">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 mt-2">
                <input type="text" placeholder="新账户名称 (如：招行储蓄卡)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <input type="number" placeholder="初始期初金额 (0.00 ¥)" value={balance} onChange={e => setBalance(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <button onClick={handleAdd} className="w-full bg-gray-900 text-white px-4 py-2 mt-1 rounded-lg hover:bg-gray-800 flex items-center justify-center font-bold">
                    <Plus size={16} /><span className="ml-1 text-sm">新增</span>
                </button>
            </div>
        </section>
    );
}

export function CategoryManager({ categories, setCategories }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('expense');
    const [isAnnual, setIsAnnual] = useState(false);
    const [isRollover, setIsRollover] = useState(false);

    const handleAdd = () => {
        if (!name) return;
        setCategories([...categories, {
            id: 'c_' + uuidv4().slice(0, 8),
            name,
            type,
            isAnnualFixed: isAnnual,
            isRollover: isRollover
        }]);
        setName('');
    };

    return (
        <section className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">分类字典</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{cat.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${cat.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {cat.type === 'expense' ? '支出' : '收入'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {cat.isAnnualFixed && <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded">年度</span>}
                            {cat.isRollover && <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded">结转</span>}
                            <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-red-400 hover:text-red-600 ml-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                <input type="text" placeholder="新分类名称 (如：餐饮美食)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                    <option value="expense">支出</option>
                    <option value="income">收入</option>
                </select>
                <button onClick={handleAdd} className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center font-bold">
                    <Plus size={16} /><span className="ml-1 text-sm">添加分类</span>
                </button>
                {type === 'expense' && (
                    <div className="flex flex-col gap-2 text-xs text-gray-600 mt-1 border-t border-gray-200 pt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={isAnnual} onChange={e => setIsAnnual(e.target.checked)} className="rounded text-blue-500 focus:ring-0 w-3.5 h-3.5" />年度账单性质 (不挤占月费)</label>
                        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={isRollover} onChange={e => setIsRollover(e.target.checked)} className="rounded text-blue-500 focus:ring-0 w-3.5 h-3.5" />结余结转特性 (余额累加防吞)</label>
                    </div>
                )}
            </div>
        </section>
    );
}

export function AutoDLDictManager({ autodlPrices, setAutodlPrices }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const handleAdd = () => {
        if (!name || !price) return;
        setAutodlPrices([...autodlPrices, { id: 'gpu_' + uuidv4().slice(0, 6), name, pricePerHour: parseFloat(price) }]);
        setName(''); setPrice('');
    }
    return (
        <section className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">AutoDL 机型定价库</h3>
            <div className="space-y-2">
                {autodlPrices?.map(g => (
                    <div key={g.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium">{g.name}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">¥{g.pricePerHour}/h</span>
                            <button onClick={() => setAutodlPrices(autodlPrices.filter(x => x.id !== g.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 mt-2">
                <input type="text" placeholder="机型代号 (如: 三体 H800)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <div className="relative w-full">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs">¥</span>
                    <input type="number" step="0.1" placeholder="按时计费价格 / 每小时单价" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                </div>
                <button onClick={handleAdd} className="w-full bg-gray-900 text-white px-4 py-2 mt-1 rounded-lg hover:bg-gray-800 flex items-center justify-center font-bold">
                    <Plus size={16} /><span className="ml-1 text-sm">新增机型</span>
                </button>
            </div>
        </section>
    );
}

export function APIDictManager({ apiModels, setApiModels }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const handleAdd = () => {
        if (!name || !price) return;
        setApiModels([...apiModels, { id: 'api_' + uuidv4().slice(0, 6), name, pricePer1M: parseFloat(price) }]);
        setName(''); setPrice('');
    }
    return (
        <section className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">API 大模型汇率表 (USD / 1M token)</h3>
            <div className="space-y-2">
                {apiModels?.map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium">{m.name}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">${m.pricePer1M}/1M</span>
                            <button onClick={() => setApiModels(apiModels.filter(x => x.id !== m.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 mt-2">
                <input type="text" placeholder="大模型全称 (如: Claude-3.5-Sonnet)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <div className="relative w-full">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                    <input type="number" step="0.01" placeholder="一百万 Token 汇率金额" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                </div>
                <button onClick={handleAdd} className="w-full bg-gray-900 text-white px-4 py-2 mt-1 rounded-lg hover:bg-gray-800 flex items-center justify-center font-bold">
                    <Plus size={16} /><span className="ml-1 text-sm">新增 API</span>
                </button>
            </div>
        </section>
    );
}

export function QuickAddManager({ quickAdds, setQuickAdds, categories, accounts }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');

    const handleAdd = () => {
        if (!name || (!categoryId && categories.length > 0) || (!accountId && accounts.length > 0)) return;
        setQuickAdds([...quickAdds, {
            id: 'qa_' + uuidv4().slice(0, 6),
            name, icon, amount: parseFloat(amount || 0), type, categoryId, accountId
        }]);
        setName(''); setAmount('');
    }

    return (
        <section className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">快捷记账</h3>
            <div className="space-y-2">
                {quickAdds?.map(q => (
                    <div key={q.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{q.icon}</span>
                            <span className="text-sm font-medium">{q.name}</span>
                            <span className="text-xs text-gray-400">¥{q.amount}</span>
                        </div>
                        <button onClick={() => setQuickAdds(quickAdds.filter(x => x.id !== q.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2 shadow-sm">
                <input type="text" placeholder="快捷图标 (如☕)" value={icon} onChange={e => setIcon(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <input type="text" placeholder="快速记账名称 (如: 购买咖啡)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <input type="number" placeholder="固定执行金额 (¥)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-3 mt-1">
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                        <option value="expense">支出</option>
                        <option value="income">收入</option>
                    </select>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                        <option value="">分类（请选择）</option>
                        {categories.filter(c => c.type === type && !c.isAutoDL && !c.isAPI).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                        <option value="">账户（请选择）</option>
                        {accounts.filter(a => a.status !== 'inactive').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} className="w-full bg-gray-900 text-white px-3 py-3 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-1 font-bold mt-2"><Plus size={16} /> 新建快捷记账</button>
            </div>
        </section>
    );
}



export function SubscriptionManager({ subscriptions, setSubscriptions, categories, accounts }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [cycle, setCycle] = useState('monthly');
    const [nextPayDate, setNextPayDate] = useState(formatLocalDate());
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');

    const handleAdd = () => {
        if (!name || !amount || !nextPayDate || !categoryId || !accountId) return;
        setSubscriptions([...subscriptions, {
            id: 's_' + uuidv4().slice(0, 6),
            name, amount: parseFloat(amount), cycle, nextPayDate, categoryId, accountId
        }]);
        setName(''); setAmount('');
    }

    return (
        <section className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">周期订阅</h3>
            <div className="space-y-2">
                {subscriptions?.map(s => (
                    <div key={s.id} className="flex flex-col bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{s.name} <span className="text-[10px] bg-purple-100 text-purple-600 px-1 rounded ml-1">{s.cycle === 'monthly' ? '月度' : '年度'}</span></span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700">¥{s.amount}</span>
                                <button onClick={() => setSubscriptions(subscriptions.filter(x => x.id !== s.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                            <span>下次扣准: <b className="text-gray-700">{s.nextPayDate}</b></span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
                <input type="text" placeholder="订阅内容名称 (如: Spotify VIP)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <input type="number" placeholder="周期固定额度 (¥)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 placeholder-gray-400" />
                <select value={cycle} onChange={e => setCycle(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                    <option value="monthly">扣费周期：每月</option>
                    <option value="yearly">扣费周期：每年</option>
                </select>
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-3 mt-1">
                    <span className="text-[11px] font-bold text-gray-500 -mb-1 px-1">下一次扣费预警日</span>
                    <input type="date" value={nextPayDate} onChange={e => setNextPayDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600" />
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                        <option value="">分类（请选择）</option>
                        {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-gray-600">
                        <option value="">账户（请选择）</option>
                        {accounts.filter(a => a.status !== 'inactive').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd} className="w-full bg-gray-900 text-white px-3 py-3 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-1 font-bold mt-2"><Plus size={16} /> 新建周期订阅</button>
            </div>
        </section>
    );
}
