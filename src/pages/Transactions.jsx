import React from 'react';
import { formatLocalDate, formatLocalTime } from '../utils';

import { Download } from 'lucide-react';
import TransactionList from '../components/TransactionList';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export default function Transactions({ transactions, categories, accounts, tags, setTransactions }) {
    const handleDeleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleExportCSV = async () => {
        if (!transactions || transactions.length === 0) {
            return alert('当前没有流水记录可供导出。');
        }

        const headers = ['序列号(SN)', '交易类型(Type)', '发生日期(Date)', '业务分类(Category)', '发生额(Amount)', '结算机构(Account)', '支持报销(Reimbursable)', '报销平账(Settled)', '附加标签(Tags)', '交易快照(Note)'];

        const rows = transactions.map(t => {
            const typeStr = t.type === 'expense' ? '流出' : t.type === 'income' ? '流入' : '划转';
            const cat = categories.find(c => c.id === t.categoryId)?.name || '-';

            let accountStr = '-';
            if (t.type === 'transfer') {
                const from = accounts.find(a => a.id === t.fromAccountId)?.name || '?';
                const to = accounts.find(a => a.id === t.toAccountId)?.name || '?';
                accountStr = `${from} ➝ ${to}`;
            } else {
                const accId = t.type === 'expense' ? t.fromAccountId : t.toAccountId;
                accountStr = accounts.find(a => a.id === accId)?.name || '-';
            }

            const tagList = (t.tagIds || []).map(id => tags.find(tag => tag.id === id)?.name).filter(Boolean).join(';');

            return [
                t.id,
                typeStr,
                t.date,
                cat,
                t.amount.toString(),
                accountStr,
                t.isReimbursable ? '是' : '否',
                t.isReimbursed ? '是' : '否',
                `"${tagList}"`,
                `"${(t.note || '').replace(/"/g, '""')}"`
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const fileName = `CyberLedger_Statements_${formatLocalDate()}.csv`;
        const contentWithBom = '\uFEFF' + csvContent;

        const fallbackDownload = () => {
            // 关键：带上 UTF-8 BOM，阻止 Excel 打开中文乱码
            const blob = new Blob([contentWithBom], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        if (Capacitor.isNativePlatform()) {
            try {
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: contentWithBom,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });
                await Share.share({
                    title: 'Cyber Ledger Statements',
                    text: 'Cyber_Ledger 本地账单流水 CSV 导出',
                    url: result.uri,
                    dialogTitle: '保存或分享流水账单'
                });
            } catch (error) {
                console.error('Capacitor CSV Export failed:', error);
                alert('底层原生分享调用失败，请检查沙箱权限: ' + error.message);
                fallbackDownload();
            }
        } else {
            fallbackDownload();
        }
    };

    return (
        <div className="px-4 py-8 max-w-lg mx-auto pb-24">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">历史账单流水</h2>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                    <Download size={16} /> 导出 CSV
                </button>
            </div>
            <TransactionList
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                tags={tags}
                onDelete={handleDeleteTransaction}
            />
        </div>
    );
}
