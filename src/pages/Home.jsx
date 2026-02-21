import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Wallet, CalendarRange, Clock, Moon, Sun, Settings } from 'lucide-react';
import { formatMoney, formatLocalDate, formatLocalTime } from '../utils';
import TransactionForm from '../components/TransactionForm';
import ReimbursementTracker from '../components/ReimbursementTracker';

export default function Home({
    transactions, setTransactions,
    accounts,
    categories,
    budget, setBudget,
    autodlPrices, apiModels,
    viewPeriod, setViewPeriod,
    isDarkMode, setIsDarkMode,
    quickAdds,
    subscriptions, setSubscriptions,
    tags
}) {
    const [isBudgetOptOpen, setIsBudgetOptOpen] = React.useState(false);
    const [localBudget, setLocalBudget] = React.useState(budget);

    React.useEffect(() => {
        if (isBudgetOptOpen) setLocalBudget(budget);
    }, [isBudgetOptOpen, budget]);

    const handleAddTransaction = (newTx) => {
        setTransactions(prev => [newTx, ...prev]);
    };

    const handleReimburse = (id, amount) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, isReimbursed: true } : t));
        const originalTx = transactions.find(t => t.id === id);
        const reimburseTx = {
            id: uuidv4(),
            type: 'income',
            amount,
            toAccountId: originalTx?.fromAccountId || accounts[0]?.id,
            date: formatLocalDate(),
            note: `自动平账入账`,
        };
        setTransactions(prev => [reimburseTx, ...prev]);
    };

    const handleQuickAdd = (qa) => {
        const newTx = {
            id: uuidv4(),
            type: qa.type,
            amount: qa.amount,
            categoryId: qa.categoryId,
            fromAccountId: qa.type === 'expense' || qa.type === 'transfer' ? qa.accountId : undefined,
            toAccountId: qa.type === 'income' || qa.type === 'transfer' ? qa.accountId : undefined,
            date: formatLocalDate(),
            note: `[快捷记账] ${qa.name}`,
            isReimbursable: false,
            isReimbursed: false
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    const getUpcomingSubscriptions = () => {
        if (!subscriptions) return [];
        const todayStr = formatLocalDate();
        const today = new Date(todayStr);
        return subscriptions.filter(s => {
            const payDate = new Date(s.nextPayDate);
            const diffDays = (payDate - today) / (1000 * 60 * 60 * 24);
            return diffDays <= 7 && diffDays >= -365;
        });
    };
    const upcomingSubs = getUpcomingSubscriptions();

    const handleRenewSubscription = (sub) => {
        const newTx = {
            id: uuidv4(),
            type: 'expense',
            amount: sub.amount,
            categoryId: sub.categoryId,
            fromAccountId: sub.accountId,
            date: formatLocalDate(),
            note: `[周期订阅] ${sub.name}`,
            isReimbursable: false,
            isReimbursed: false
        };
        setTransactions(prev => [newTx, ...prev]);
        const currentPayDate = new Date(sub.nextPayDate);
        if (sub.cycle === 'monthly') {
            currentPayDate.setMonth(currentPayDate.getMonth() + 1);
        } else {
            currentPayDate.setFullYear(currentPayDate.getFullYear() + 1);
        }
        const newDateStr = formatLocalDate(currentPayDate);
        setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, nextPayDate: newDateStr } : s));
    };

    const totalAssetsInitial = accounts.filter(a => a.status !== 'inactive').reduce((sum, a) => sum + a.balance, 0);

    let netDelta = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    const currentMonthPrefix = formatLocalDate().substring(0, 7);

    transactions.forEach(t => {
        if (t.type === 'expense') {
            netDelta -= t.amount;
            totalExpense += t.amount;
        } else if (t.type === 'income') {
            netDelta += t.amount;
            totalIncome += t.amount;
        }
    });

    // 计算储备金额度被消耗的部分
    let totalSpendFromRollover = 0;
    categories.filter(c => c.isRollover).forEach(cat => {
        const allocated = budget.categoryLimits?.[cat.id] || 0;
        const initialRollover = budget.rolloverBalances?.[cat.id] || 0;

        const pastTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date.substring(0, 7) < currentMonthPrefix && !t.isReimbursable);
        const pastSpent = pastTx.reduce((sum, t) => sum + t.amount, 0);

        const allPastTx = transactions.filter(t => t.date.substring(0, 7) < currentMonthPrefix);
        let activePastMonths = 0;
        if (allPastTx.length > 0) {
            const minDateStr = allPastTx.reduce((min, t) => t.date < min ? t.date : min, allPastTx[0].date);
            const [mY, mM] = minDateStr.substring(0, 7).split('-').map(Number);
            const [cY, cM] = currentMonthPrefix.split('-').map(Number);
            activePastMonths = Math.max(0, (cY - mY) * 12 + (cM - mM));
        }

        const pastBudget = activePastMonths * allocated + initialRollover;
        const computedRollover = Math.max(0, pastBudget - pastSpent);

        const currentTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date.startsWith(currentMonthPrefix) && !t.isReimbursable);
        const currentSpent = currentTx.reduce((sum, t) => sum + t.amount, 0);

        const spendFromRollover = Math.min(currentSpent, computedRollover);
        totalSpendFromRollover += spendFromRollover;
    });

    const grossMonthExpense = transactions.reduce((sum, t) => {
        if (t.type === 'expense' && t.date.startsWith(currentMonthPrefix) && !t.isReimbursable) {
            const cat = categories.find(c => c.id === t.categoryId);
            if (cat && !cat.isAnnualFixed) {
                return sum + t.amount;
            }
        }
        return sum;
    }, 0);

    const currentMonthExpense = Math.max(0, grossMonthExpense - totalSpendFromRollover);

    const totalAssets = totalAssetsInitial + netDelta;
    const budgetProgress = Math.min((currentMonthExpense / (budget.monthlyTotal || 1)) * 100, 100);

    const handleLocalBudgetChange = (field, val) => {
        setLocalBudget(prev => ({ ...prev, [field]: val === '' ? '' : parseFloat(val) }));
    };

    const confirmBudget = () => {
        setBudget(localBudget);
        setIsBudgetOptOpen(false);
    };

    return (
        <div>
            <header className="bg-gray-900 text-white pt-12 pb-6 px-6 rounded-b-3xl shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight">赛博账本</h1>
                        <button
                            onClick={() => setViewPeriod(p => p === 'month' ? 'all' : 'month')}
                            className="flex items-center gap-1.5 bg-gray-800/80 hover:bg-gray-700/80 px-2.5 py-1 rounded-full text-xs font-medium text-gray-300 transition-colors border border-gray-700"
                        >
                            {viewPeriod === 'month' ? (
                                <><CalendarRange size={12} /> 当月视图</>
                            ) : (
                                <><Clock size={12} /> 全部/年度</>
                            )}
                        </button>
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="flex items-center justify-center w-7 h-7 bg-gray-800/80 hover:bg-gray-700/80 rounded-full text-gray-300 transition-colors border border-gray-700"
                            title="切换暗夜模式"
                        >
                            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-gray-400 text-sm mb-1">总净资产</p>
                    <div className="flex items-baseline gap-3">
                        <div className="text-4xl font-bold tracking-tight">
                            {formatMoney(totalAssets)}
                        </div>
                    </div>

                    <div className="mt-8 bg-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-300">本月生活预算</span>
                            <button
                                onClick={() => setIsBudgetOptOpen(true)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
                            >
                                <Settings size={12} />
                                设置
                            </button>
                        </div>
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-lg font-bold text-white">{formatMoney(currentMonthExpense)}</span>
                            <span className="text-xs text-gray-500">剩余 {formatMoney(Math.max(0, (budget.monthlyTotal || 0) - currentMonthExpense))}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${budgetProgress > 90 ? 'bg-red-500' : 'bg-green-400'}`}
                                style={{ width: `${budgetProgress}%` }}
                            ></div>
                        </div>

                        {/* 年度大盘概览 */}
                        {viewPeriod === 'all' && (
                            <div className="mt-5 pt-4 border-t border-gray-700">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-gray-400">年度全口径预算</span>
                                    <span className="text-gray-300 font-medium tracking-wide">{formatMoney(budget.annualTotal || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">累计总支 <span className="text-red-400 ml-1">{formatMoney(totalExpense)}</span></div>
                                </div>
                            </div>
                        )}


                        {/* 结转储备金条 (泛化处理所有 isRollover === true 的分类) */}
                        <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                            {categories.filter(c => c.isRollover).map(cat => {
                                const allocated = budget.categoryLimits?.[cat.id] || 0;
                                const initialRollover = budget.rolloverBalances?.[cat.id] || 0;

                                const pastTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date.substring(0, 7) < currentMonthPrefix);
                                const pastSpent = pastTx.reduce((sum, t) => sum + t.amount, 0);

                                const allPastTx = transactions.filter(t => t.date.substring(0, 7) < currentMonthPrefix);
                                let activePastMonths = 0;
                                if (allPastTx.length > 0) {
                                    const minDateStr = allPastTx.reduce((min, t) => t.date < min ? t.date : min, allPastTx[0].date);
                                    const [mY, mM] = minDateStr.substring(0, 7).split('-').map(Number);
                                    const [cY, cM] = currentMonthPrefix.split('-').map(Number);
                                    activePastMonths = Math.max(0, (cY - mY) * 12 + (cM - mM));
                                }

                                const pastBudget = activePastMonths * allocated + initialRollover;
                                const computedRollover = Math.max(0, pastBudget - pastSpent);
                                const totalLimit = computedRollover + allocated;

                                const currentTx = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense' && t.date.startsWith(currentMonthPrefix));
                                const currentSpent = currentTx.reduce((sum, t) => sum + t.amount, 0);

                                const spendFromRollover = Math.min(currentSpent, computedRollover);
                                const spendFromCurrent = Math.max(0, currentSpent - computedRollover);

                                const rolloverPct = totalLimit === 0 ? 0 : (computedRollover / totalLimit) * 100;
                                const currentPct = totalLimit === 0 ? 0 : (allocated / totalLimit) * 100;

                                return (
                                    <div key={cat.id}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-blue-300 font-medium tracking-wide flex items-center gap-1">
                                                {cat.name} {cat.isAutoDL && '💻'} {cat.isAPI && '🧠'} (储备)
                                            </span>
                                            <span className="text-blue-200">
                                                已用 {formatMoney(currentSpent)} / 总额 {formatMoney(totalLimit)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full flex bg-gray-800 rounded-full overflow-hidden relative border border-gray-700/50">
                                            <div className="h-full bg-emerald-900/40 relative" style={{ width: `${rolloverPct}%` }}>
                                                <div className="absolute left-0 top-0 h-full bg-emerald-400 transition-all rounded-r-sm shadow-[0_0_8px_rgba(52,211,153,0.4)]" style={{ width: `${(spendFromRollover / (computedRollover || 1)) * 100}%` }}></div>
                                            </div>
                                            <div className="h-full bg-blue-900/40 relative border-l border-gray-800/80" style={{ width: `${currentPct}%` }}>
                                                <div className="absolute left-0 top-0 h-full bg-blue-400 transition-all rounded-r-sm shadow-[0_0_8px_rgba(96,165,250,0.4)]" style={{ width: `${(spendFromCurrent / (allocated || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                                            <span>上月结转: {formatMoney(computedRollover)}</span>
                                            <span>本月配额: {formatMoney(allocated)}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex gap-6 mt-6 pt-6 border-t border-gray-800">
                        <div>
                            <p className="text-gray-500 text-xs mb-1">总计收入</p>
                            <p className="text-green-400 font-medium text-sm">+{formatMoney(totalIncome)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs mb-1">总计支出</p>
                            <p className="text-red-400 font-medium text-sm">-{formatMoney(totalExpense)}</p>
                        </div>
                    </div>
                </div>
            </header >

            <main className="px-4 py-6 space-y-8">
                {/* 快捷记账传送带 */}
                {quickAdds && quickAdds.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">快捷记账</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            {quickAdds.map(qa => (
                                <button
                                    key={qa.id}
                                    onClick={() => handleQuickAdd(qa)}
                                    className="flex flex-col items-center flex-shrink-0 w-[5.5rem] p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow active:scale-95"
                                >
                                    <span className="text-2xl mb-1">{qa.icon}</span>
                                    <span className="text-xs font-bold text-gray-800 truncate w-full">{qa.name}</span>
                                    <span className="text-[10px] font-medium text-gray-400 mt-0.5">¥{qa.amount}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* 近期周期订阅监控 */}
                {upcomingSubs.length > 0 && (
                    <section className="bg-purple-50 rounded-2xl p-4 border border-purple-100 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/50 rounded-full blur-2xl pointer-events-none"></div>
                        <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <span>🔔</span> 待续费的周期订阅
                        </h3>
                        <div className="space-y-2 relative z-10">
                            {upcomingSubs.map(sub => {
                                const payDate = new Date(sub.nextPayDate);
                                const today = new Date(formatLocalDate());
                                const daysDiff = Math.ceil((payDate - today) / (1000 * 60 * 60 * 24));
                                const urgency = daysDiff < 0 ? '已逾期' : daysDiff === 0 ? '默认今日扣除' : `还差 ${daysDiff} 天`;
                                const urgencyColor = daysDiff < 0 ? 'text-red-500' : daysDiff === 0 ? 'text-orange-600' : 'text-purple-600';

                                return (
                                    <div key={sub.id} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-purple-100 shadow-sm">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm tracking-tight">{sub.name}</p>
                                            <p className={`text-[10px] mt-0.5 ${urgencyColor} font-medium`}>{urgency}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-extrabold tracking-tight text-gray-900">¥{sub.amount}</span>
                                            <button
                                                onClick={() => handleRenewSubscription(sub)}
                                                className="bg-purple-600 text-white text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm active:scale-95"
                                            >
                                                确认缴费
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <ReimbursementTracker
                    transactions={transactions}
                    categories={categories}
                    accounts={accounts}
                    onReimburse={handleReimburse}
                />

                <section>
                    <TransactionForm
                        categories={categories}
                        accounts={accounts}
                        autodlPrices={autodlPrices}
                        apiModels={apiModels}
                        tags={tags}
                        onAddTransaction={handleAddTransaction}
                    />
                </section>
            </main>

            {/* 预算设置半模态弹窗 */}
            {
                isBudgetOptOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBudgetOptOpen(false)}></div>
                        <div className="relative bg-gray-900 border border-gray-700 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-white overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                            <h3 className="text-lg font-bold mb-6 text-center">预算设置</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">本月总预算设置 (¥)</label>
                                    <input
                                        type="number" value={localBudget.monthlyTotal === undefined ? '' : localBudget.monthlyTotal}
                                        onChange={e => handleLocalBudgetChange('monthlyTotal', e.target.value)}
                                        className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-center text-balance">控制本月生活开销进度条，额度包括所有常规类目。</p>
                                </div>

                                {categories.filter(c => c.isRollover).length > 0 && (
                                    <>
                                        <hr className="border-gray-800" />
                                        {categories.filter(c => c.isRollover).map(cat => (
                                            <div key={cat.id}>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">{cat.name} 每月储备固定额度 (¥)</label>
                                                <input
                                                    type="number" value={localBudget.categoryLimits?.[cat.id] === undefined ? '' : localBudget.categoryLimits[cat.id]}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setLocalBudget(prev => ({
                                                            ...prev,
                                                            categoryLimits: {
                                                                ...(prev.categoryLimits || {}),
                                                                [cat.id]: val === '' ? '' : parseFloat(val)
                                                            }
                                                        }));
                                                    }}
                                                    className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-center text-xl font-bold text-blue-300 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-600"
                                                />
                                            </div>
                                        ))}
                                    </>
                                )}

                                <hr className="border-gray-800" />

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">年度总预算 (¥)</label>
                                    <input
                                        type="number" value={localBudget.annualTotal === undefined ? '' : localBudget.annualTotal}
                                        onChange={e => handleLocalBudgetChange('annualTotal', e.target.value)}
                                        className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-center text-xl font-bold text-gray-300 focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-center text-balance">本年度所有的开销底线，包含年费与订阅。</p>
                                </div>
                            </div>

                            <button
                                onClick={confirmBudget}
                                className="w-full mt-8 py-3.5 bg-gray-100 hover:bg-white text-gray-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                确认
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}
