import React, { useState } from 'react';
import { formatLocalDate, formatLocalTime } from '../utils';

import { CloudDownload, CloudUpload, Save, FileDown, FileUp, Lock } from 'lucide-react';
import { AccountManager, CategoryManager, AutoDLDictManager, APIDictManager, QuickAddManager, SubscriptionManager } from '../components/ConfigManagers';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export default function Settings({
    pinCode, setPinCode,
    transactions, setTransactions,
    webdavConfig, setWebdavConfig,
    customCss, setCustomCss,
    onSyncPush, onSyncPull, isSyncing,
    accounts, setAccounts,
    categories, setCategories,
    budget, setBudget,
    autodlPrices, setAutodlPrices,
    apiModels, setApiModels,
    quickAdds, setQuickAdds,
    tags, setTags,
    subscriptions, setSubscriptions
}) {
    const [url, setUrl] = useState(webdavConfig.url || '');
    const [username, setUsername] = useState(webdavConfig.username || '');
    const [password, setPassword] = useState(webdavConfig.password || '');
    const [cssCode, setCssCode] = useState(customCss || '');

    const [isSettingPin, setIsSettingPin] = useState(false);
    const [newPin, setNewPin] = useState('');

    const togglePin = () => {
        if (pinCode) {
            if (confirm('确认关闭应用安全锁吗？你的记账隐私将失去这层保护。')) {
                setPinCode(null);
            }
        } else {
            setIsSettingPin(true);
        }
    };

    const handleSavePin = () => {
        if (newPin.length === 4 && /^\d+$/.test(newPin)) {
            setPinCode(newPin);
            setIsSettingPin(false);
            setNewPin('');
            alert('PIN 访问锁已成功启用！');
        } else {
            alert('PIN 码必须是严格的 4 位数字');
        }
    };

    const handleSave = () => {
        setWebdavConfig({ url, username, password });
        setCustomCss(cssCode);
        alert('设置已保存至本地');
    };

    const handleExportBackup = async () => {
        const backup = {
            version: '2.0',
            timestamp: formatLocalTime(),
            data: {
                transactions, accounts, categories, budget,
                quickAdds, tags, subscriptions, autodlPrices, apiModels
            }
        };
        const jsonStr = JSON.stringify(backup, null, 2);
        const fileName = `cyber_ledger_backup_${formatLocalDate()}.json`;
        const blob = new Blob([jsonStr], { type: 'application/json' });

        const fallbackDownload = () => {
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objUrl);
        };

        if (Capacitor.isNativePlatform()) {
            try {
                // 先利用原生 IO 写入底层 Cache 中暂存
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: jsonStr,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });

                // 读取系统级 file:// URI 去调起原生分享菜单与存储
                await Share.share({
                    title: 'Cyber Ledger Backup 资产导出备份',
                    text: 'Cyber_Ledger 本地冷备份数据导出',
                    url: result.uri,
                    dialogTitle: '保存或分享备份文件',
                });
            } catch (error) {
                console.error('Capacitor Filesystem / Share API failed:', error);
                alert('原生分享调用失败: ' + error.message);
                fallbackDownload();
            }
        } else {
            fallbackDownload();
        }
    };

    const handleImportBackup = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);
                if (!backup.data) throw new Error("无效的备份格式");
                const { data } = backup;
                if (confirm('警告：此操作将覆盖当前所有本地数据，确认要恢复备份吗？')) {
                    if (data.transactions) setTransactions(data.transactions);
                    if (data.accounts) setAccounts(data.accounts);
                    if (data.categories) setCategories(data.categories);
                    if (data.budget) setBudget(data.budget);
                    if (data.quickAdds) setQuickAdds(data.quickAdds);
                    if (data.tags) setTags(data.tags);
                    if (data.subscriptions) setSubscriptions(data.subscriptions);
                    if (data.autodlPrices) setAutodlPrices(data.autodlPrices);
                    if (data.apiModels) setApiModels(data.apiModels);
                    alert('备份恢复成功！');
                    // 清除 file input 值以免重复导入相同文件失效
                    e.target.value = '';
                }
            } catch (err) {
                alert('恢复失败，文件可能已损坏: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="px-4 py-8 max-w-lg mx-auto pb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2 tracking-tight">系统中枢管理</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 space-y-8">
                    <CategoryManager categories={categories} setCategories={setCategories} />
                    <hr className="border-gray-100" />
                    <QuickAddManager quickAdds={quickAdds} setQuickAdds={setQuickAdds} categories={categories} accounts={accounts} />
                    <hr className="border-gray-100" />
                    <SubscriptionManager subscriptions={subscriptions} setSubscriptions={setSubscriptions} categories={categories} accounts={accounts} />
                    <hr className="border-gray-100" />
                    <AutoDLDictManager autodlPrices={autodlPrices} setAutodlPrices={setAutodlPrices} />
                    <hr className="border-gray-100" />
                    <APIDictManager apiModels={apiModels} setApiModels={setApiModels} />
                    <hr className="border-gray-100" />

                    <section>
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Lock size={16} />安全与隐私锁</h3>
                            <button onClick={togglePin} className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${pinCode ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {pinCode ? '卸除 PIN 锁' : '启动 PIN 锁'}
                            </button>
                        </div>
                        {isSettingPin && !pinCode && (
                            <div className="flex flex-col gap-3 mt-3">
                                <input type="password" maxLength={4} placeholder="输入四位密码(如: 0000)" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-gray-900 transition-all font-mono tracking-widest text-center outline-none placeholder-gray-400" />
                                <div className="flex gap-3">
                                    <button onClick={handleSavePin} className="flex-1 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-95">确定</button>
                                    <button onClick={() => { setIsSettingPin(false); setNewPin(''); }} className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors active:scale-95">取消</button>
                                </div>
                            </div>
                        )}
                        {pinCode && !isSettingPin && (
                            <p className="text-xs text-gray-500 font-medium">✅ 进出隔离级保护门禁已上线，冷启动本系统必须验证4位授权密钥才能下发组件树渲染。</p>
                        )}
                    </section>

                    <hr className="border-gray-100" />

                    <section>
                        <h3 className="font-semibold text-gray-800 text-sm mb-4">本地数据备份</h3>
                        <div className="flex gap-3">
                            <button onClick={handleExportBackup} className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-700 transition-colors">
                                <FileDown size={16} className="text-blue-500" />
                                导出完整 JSON
                            </button>
                            <label className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-700 transition-colors cursor-pointer">
                                <FileUp size={16} className="text-orange-500" />
                                覆盖恢复数据
                                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                            </label>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 text-sm">WebDAV 云端同步</h3>
                            <div className="flex gap-2">
                                <button onClick={onSyncPull} disabled={isSyncing || !url} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50" title="从云端拉取覆盖本地">
                                    <CloudDownload size={16} />
                                </button>
                                <button onClick={onSyncPush} disabled={isSyncing || !url} className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50" title="将本地推送到云端">
                                    <CloudUpload size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="服务器地址 (如: https://dav.example.com/dav/)" value={url} onChange={e => setUrl(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 transition-all shadow-sm placeholder-gray-400" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="云账户名" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 transition-all shadow-sm placeholder-gray-400" />
                                <input type="password" placeholder="应用授权码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 transition-all shadow-sm placeholder-gray-400" />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={handleSave} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 flex justify-center items-center gap-2 transition-colors">
                        <Save size={16} /> 永久保存设置 (Save)
                    </button>
                </div>
            </div>
        </div>
    );
}
