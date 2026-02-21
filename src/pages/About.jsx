import React, { useState } from 'react';
import { Info, Code, User, ArrowLeft, ExternalLink } from 'lucide-react';

export default function About() {
    const [activeTab, setActiveTab] = useState('project');

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* 顶部标题头 */}
            <div className="bg-gray-900 text-white pt-12 pb-6 px-6 rounded-b-3xl shadow-xl sticky top-0 z-20">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Info size={22} className="text-blue-400" />
                    关于
                </h1>

                {/* 选项卡切换 */}
                <div className="flex bg-gray-800 rounded-lg p-1 mt-6">
                    <button
                        onClick={() => setActiveTab('project')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === 'project' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Code size={16} /> 关于项目
                    </button>
                    <button
                        onClick={() => setActiveTab('author')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === 'author' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <User size={16} /> 关于作者
                    </button>
                </div>
            </div>

            <main className="px-5 py-8 max-w-lg mx-auto">
                {activeTab === 'project' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg overflow-hidden shrink-0 mt-2">
                                <img src="/icon.svg" alt="App Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cyber Ledger</h2>
                                <p className="text-sm font-medium text-blue-600 tracking-widest mt-0.5">SYS.LEDGER // v1.0.0</p>
                            </div>
                        </div>

                        <div className="space-y-6 prose prose-blue prose-sm text-gray-700 w-full max-w-none">
                            <p className="leading-relaxed">
                                <strong>赛博账本 (Cyber Ledger)</strong> 是一款专为数字游民、开发者与硬核玩家量身定做的本地优先 (Local-First) 资产管理及行为记账系统。
                                <br /><br />
                                除了日常水准的流水挂账、资金大盘和多户头资产隔离外，我们更是罕见地针对当下 AI 数字环境与极客人群的高频痛点定制了独家功能。所有数据流均在设备本地或您的私有云端封闭循环。
                            </p>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">🌟 七大核心纪元层</h3>
                                <ul className="space-y-4 pl-1">
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                        <span><strong>硬件算力与 API 引擎计价器</strong><br /><span className="text-xs text-gray-500 font-normal">内置 AutoDL 显卡时薪模拟器 (支持 H800 / 4090) 及针对大语言模型 (LLM) API 的汇率自动换算器，让烧钱的可视化更加直观。</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                                        <span><strong>结余资金无缝结转系统 (Rollover)</strong><br /><span className="text-xs text-gray-500 font-normal">告别月底清零！上月未耗尽的餐饮/交通/娱乐预算资金将自动顺延至下月，并在独立双色进度条中获取优先扣款权。</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                        <span><strong>动态储备金与报销隔离层</strong><br /><span className="text-xs text-gray-500 font-normal">单独录入的“待报销”款项将直接悬停于独立的追踪视图，仅执行资产总额的暂时冻结扣减，绝不参杂、虚损你的月度正常开销统计口径。</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                                        <span><strong>强自定义的周期性自动复利订阅源</strong><br /><span className="text-xs text-gray-500 font-normal">为 Netflix、服务器续费等建立自动订阅监视，时间一到即刻提醒并可一键完成从指定钱包到分类的扣发流水生成。</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0"></div>
                                        <span><strong>全局真实资产验算防篡改引擎</strong><br /><span className="text-xs text-gray-500 font-normal">所有实体账户的当前余额不再依赖容易出界的单独字段，而是通过对创世块 (第一条记录) 至今的所有流水进行全局实时回溯推演，确保对账分毫不差。</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                                        <span><strong>极客控制台级的中枢设定界面</strong><br /><span className="text-xs text-gray-500 font-normal">高自定义。包括全局的字典式分类系统 (年度/支出/收入)、实体账户录入网关以及对常用流水建立快捷命令捷径池 (Quick Add)。</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                        <span><strong>军事级护盾与多协议灾备</strong><br /><span className="text-xs text-gray-500 font-normal">基于冷启动阶段下发的 4 位 PIN 防窥门禁。并包含跨物理介质的全量 JSON 离线导出包、WebDAV 自动化云端同步协议。</span></span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-800 text-gray-300 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-700 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 relative z-10">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2 relative z-10">
                                    <span className="px-2.5 py-1 bg-gray-900 border border-gray-700 rounded-md text-xs font-mono">React / Vite</span>
                                    <span className="px-2.5 py-1 bg-gray-900 border border-gray-700 rounded-md text-xs font-mono">TailwindCSS</span>
                                    <span className="px-2.5 py-1 bg-gray-900 border border-gray-700 rounded-md text-xs font-mono">Recharts</span>
                                    <span className="px-2.5 py-1 bg-gray-900 border border-gray-700 rounded-md text-xs font-mono">Lucide</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'author' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl ring-4 ring-blue-50 p-1 overflow-hidden">
                                <img src="https://zycs-img-2lg.pages.dev/v2/B3pzFEB.jpeg" alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">小yo</h2>
                            <p className="text-blue-600 font-medium text-sm mt-1 mb-4 flex items-center justify-center gap-1.5">
                                西安交通大学 计算机科学与技术
                            </p>

                            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-2xl text-sm leading-relaxed mb-6 font-medium">
                                “我始终保持对新鲜事物的热情，并将我的知识与经验分享在我的博客中。”
                            </div>

                            <p className="text-sm text-gray-600 mb-6 px-2">
                                2024级本科生。期待在这里与你分享我的见解、经验和最新的技术动态。持续进步。
                            </p>

                            <div className="w-full space-y-3">
                                <a
                                    href="https://www.smallyo.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-3 rounded-xl transition-colors active:scale-95 group"
                                >
                                    <div className="flex items-center gap-3 text-gray-700 font-semibold text-sm">
                                        <span className="text-xl">🌍</span> 个人博客 (Blog)
                                    </div>
                                    <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </a>

                                <a
                                    href="https://github.com/zjs3490581068"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-3 rounded-xl transition-colors active:scale-95 group"
                                >
                                    <div className="flex items-center gap-3 text-gray-700 font-semibold text-sm">
                                        <span className="text-xl">🐙</span> GitHub 仓库
                                    </div>
                                    <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </a>

                                <div className="flex items-center justify-between w-full bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl">
                                    <div className="flex items-center gap-3 text-blue-800 font-bold text-sm">
                                        <span className="text-xl">💬</span> 联系邮箱
                                    </div>
                                    <span className="font-mono text-sm text-blue-600 font-bold tracking-tight">3490581068@qq.com</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-xs font-semibold text-gray-400 mt-8 mb-4">
                            Copyright © 2026 小yo | 持续进步
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
