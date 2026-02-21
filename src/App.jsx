import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_BUDGET, DEFAULT_AUTODL_PRICES, DEFAULT_API_MODELS } from './constants';
import { pushToWebdav, pullFromWebdav } from './webdav';

import BaseLayout from './components/BaseLayout';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Accounts from './pages/Accounts';
import About from './pages/About';
import PinLock from './components/PinLock';

const DEFAULT_QUICK_ADDS = [];
const DEFAULT_TAGS = [];
const DEFAULT_SUBSCRIPTIONS = [];

function App() {
  const [transactions, setTransactions] = useLocalStorage('cyber-ledger-transactions', []);
  const [accounts, setAccounts] = useLocalStorage('cyber-ledger-accounts', DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useLocalStorage('cyber-ledger-categories', DEFAULT_CATEGORIES);

  const [quickAdds, setQuickAdds] = useLocalStorage('cyber-ledger-quickadds', DEFAULT_QUICK_ADDS);
  const [tags, setTags] = useLocalStorage('cyber-ledger-tags', DEFAULT_TAGS);
  const [subscriptions, setSubscriptions] = useLocalStorage('cyber-ledger-subs', DEFAULT_SUBSCRIPTIONS);

  const [viewPeriod, setViewPeriod] = useState('month'); // 'month' | 'all'
  const [isDarkMode, setIsDarkMode] = useLocalStorage('cyber-ledger-dark', false);

  const [pinCode, setPinCode] = useLocalStorage('cyber-ledger-pin', null);
  const [isUnlocked, setIsUnlocked] = useState(!pinCode);

  React.useEffect(() => {
    if (!pinCode) {
      setIsUnlocked(true);
    }
  }, [pinCode]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const [budget, setBudget] = useLocalStorage('cyber-ledger-budget', DEFAULT_BUDGET);

  // 【迁移守卫】检测本地是否残留旧版“赛博消费”大类，打散为专属 API 和 AutoDL 并迁移流水关联
  React.useEffect(() => {
    setCategories(prev => {
      const p = [...prev];
      const oldCyberIndex = p.findIndex(c => c.id === 'c3' && c.name === '赛博消费');
      if (oldCyberIndex !== -1) {
        p.splice(oldCyberIndex, 1);
        if (!p.some(c => c.id === 'c3_1')) {
          p.splice(oldCyberIndex, 0,
            { id: 'c3_1', name: 'AutoDL 算力', type: 'expense', isAnnualFixed: false, isRollover: true, isAutoDL: true },
            { id: 'c3_2', name: '大模型 API', type: 'expense', isAnnualFixed: false, isRollover: true, isAPI: true }
          );
        }
        return p;
      }
      return prev;
    });

    setTransactions(prev => {
      let changed = false;
      const next = prev.map(t => {
        if (t.categoryId === 'c3') {
          changed = true;
          // 模糊启发式：如果有 note 中包含模型相关或者显卡字眼，可以尝试细分；粗暴点统一先全部归给 AutoDL 也行。
          // 这里出于数据不丢失的目的，将旧的赛博消费全部合并到 c3_1 (AutoDL) 下。
          return { ...t, categoryId: 'c3_1' };
        }
        return t;
      });
      return changed ? next : prev;
    });
  }, []);

  // Settings State
  const [autodlPrices, setAutodlPrices] = useLocalStorage('cyber-ledger-autodl', DEFAULT_AUTODL_PRICES);
  const [apiModels, setApiModels] = useLocalStorage('cyber-ledger-api', DEFAULT_API_MODELS);
  const [webdavConfig, setWebdavConfig] = useLocalStorage('cyber-ledger-webdav', { url: '', username: '', password: '' });
  const [customCss, setCustomCss] = useLocalStorage('cyber-ledger-css', '');
  const [isSyncing, setIsSyncing] = useState(false);

  // 注入自定义 CSS
  React.useEffect(() => {
    if (!customCss) return;
    const styleEl = document.createElement('style');
    styleEl.innerHTML = customCss;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, [customCss]);

  // WebDAV 交互
  const handleSyncPush = async () => {
    try {
      setIsSyncing(true);
      const snapshot = { transactions, accounts, categories, budget, quickAdds, tags, subscriptions };
      await pushToWebdav(webdavConfig, snapshot);
      alert('配置已成功推送到云端！');
    } catch (err) {
      alert('推送失败: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncPull = async () => {
    try {
      setIsSyncing(true);
      const data = await pullFromWebdav(webdavConfig);
      if (data) {
        if (data.transactions) setTransactions(data.transactions);
        if (data.accounts) setAccounts(data.accounts);
        if (data.categories) setCategories(data.categories);
        if (data.budget) setBudget(data.budget);

        if (data.quickAdds) setQuickAdds(data.quickAdds);
        if (data.tags) setTags(data.tags);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        alert('拉取成功，本地数据已覆盖为云端数据。');
      } else {
        alert('云端暂无数据备份。');
      }
    } catch (err) {
      alert('拉取失败: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };


  if (!isUnlocked && pinCode) {
    return <PinLock expectedPin={pinCode} onSuccess={() => setIsUnlocked(true)} />;
  }

  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path="/" element={
          <Home
            transactions={transactions} setTransactions={setTransactions}
            accounts={accounts} categories={categories} budget={budget} setBudget={setBudget}
            autodlPrices={autodlPrices} apiModels={apiModels}
            viewPeriod={viewPeriod} setViewPeriod={setViewPeriod}
            isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
            quickAdds={quickAdds} subscriptions={subscriptions} setSubscriptions={setSubscriptions}
            tags={tags}
          />
        } />
        <Route path="/transactions" element={
          <Transactions
            transactions={transactions} categories={categories} accounts={accounts} tags={tags} setTransactions={setTransactions}
          />
        } />
        <Route path="/stats" element={
          <Stats
            transactions={transactions} categories={categories} viewPeriod={viewPeriod} accounts={accounts} budget={budget}
          />
        } />
        <Route path="/accounts" element={
          <Accounts
            accounts={accounts} setAccounts={setAccounts} transactions={transactions} setTransactions={setTransactions}
          />
        } />
        <Route path="/settings" element={
          <Settings
            pinCode={pinCode} setPinCode={setPinCode}
            transactions={transactions} setTransactions={setTransactions}
            webdavConfig={webdavConfig} setWebdavConfig={setWebdavConfig}
            customCss={customCss} setCustomCss={setCustomCss}
            onSyncPush={handleSyncPush} onSyncPull={handleSyncPull} isSyncing={isSyncing}
            accounts={accounts} setAccounts={setAccounts}
            categories={categories} setCategories={setCategories}
            budget={budget} setBudget={setBudget}
            autodlPrices={autodlPrices} setAutodlPrices={setAutodlPrices}
            apiModels={apiModels} setApiModels={setApiModels}

            quickAdds={quickAdds} setQuickAdds={setQuickAdds}
            tags={tags} setTags={setTags}
            subscriptions={subscriptions} setSubscriptions={setSubscriptions}
          />
        } />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}

export default App;
