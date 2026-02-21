<div align="center">
  <img src="./public/icon.svg" width="120" height="120" alt="Cyber Ledger Logo" />
  <h1>Cyber Ledger (赛博账本) v1.0.0</h1>
  <p><strong>一款基于本地优先 (Local-First) 的现代化个人记账与资产管理应用。</strong></p>
  
  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF.svg?style=flat-square&logo=vite" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC.svg?style=flat-square&logo=tailwind-css" alt="TailwindCSS" /></a>
    <a href="https://capacitorjs.com/"><img src="https://img.shields.io/badge/Capacitor-📱-119EFF.svg?style=flat-square" alt="Capacitor" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" /></a>
  </p>
</div>

---

## 📖 项目简介
Cyber Ledger 是一款专为开发者、技术爱好者设计的轻量级个人财务管理工具。它摒弃了传统记账工具臃肿的社交与广告元素，将数据完全留存在本地设备，确保用户隐私与安全；同时结合了大模型 API 计价、算力租赁（AutoDL）模拟等针对开发者日常开销的独家功能。

## 🌟 核心功能

*   **多账户资金管理**
    支持统一查看“总资产”和各独立钱包的实时余额，告别死记硬背。账户余额由历代记录推算得出，实现财务流水不差一分一毫。
*   **开发者开销专属组件**
    内置 AutoDL 显卡时薪模拟器（如 RTX_4090 / H800）和针对大语言模型（LLM）API的 Token 费用精算器，精准量化开发成本。
*   **结转预算机制 (Rollover Budget)**
    本月未花完的开支额度将自动滚入次月，通过双色进度条展示优先扣款顺序。不用每天焦虑“预算月底失效”的痛点。
*   **出差报销隔离资金池**
    将一笔开销标记为“待报销”，该金额将仅作资产暂扣核减，单独展示于悬浮报销面板中，绝不干扰你正常的月度花销统计。待打款后支持一键清除/还原。
*   **周期订阅追踪**
    为你的服务器续费、流媒体（Netflix/Spotify）等付费行为开启固定周期自动提醒与快速记账，防范“吃灰续费扣款”。
*   **本地至上 & WebDAV 私有云同步**
    您的数据在任何时候都属于您自己。支持 4 位 PIN 码锁防偷窥；内置本地 JSON 离线数据的完整导出导入以及基于 WebDAV 协议的远端跨设备同步备份功能。
*   **快捷记账 (Quick Add)**
    允许自定义创建常用的开支图标与金额模板，实现主页顶部“一键入账”。

## 🚀 部署与使用

### 1. 开发环境运行
你需要安装 Node.js (v18+) 与包管理器 (npm/pnpm)。

```bash
git clone https://github.com/YourUsername/Cyber-Ledger.git
cd Cyber-Ledger

# 安装依赖
npm install

# 启动本地开发服务 (http://localhost:5173)
npm run dev
```

### 2. 构建 Android 安装包 (APK)
借助 Capacitor，您可以轻松将本 Web 专有应用打包成拥有原生体验的 Android App。

```bash
# 执行前端静态资源打包
npm run build

# 同步文件至 Android 原生项目目录
npx cap sync android

# 借助 Gradle 进行测试包 (Debug APK) 编译
cd android && ./gradlew assembleDebug
```
> APK 生成路径：`android/app/build/outputs/apk/debug/app-debug.apk`。 
> 或者您可查收根目录下直接编译好的测试包：**`CyberLedger.apk`**。

## 🎨 页面导航
*   **`🏠 首页`**：核心看板。管理当月消费占比、剩余结转资金与使用快捷面板一键记账。
*   **`🧾 流水`**：按东八区时间轴详尽列出所有历史花销，支持删改及打标签。
*   **`� 账户`**：创建或下线您的实体存钱罐/银行卡/网络虚拟钱包，一览账面资产大盘。
*   **`� 统计`**：生成历史年度与月度消费报表雷达与柱状图。
*   **`⚙️ 设置`**：配置 WebDAV 远程同步、修改数据字典（分类/应用 API 及周期性订阅）。

## 🤝 贡献或反馈
发现任何 Bug 或是期望加入的新组件，欢迎随时提交 `Issue` 或提出 `Pull Request`。

## 📄 License
基于 **MIT License** 开源。详见 `LICENSE`。
