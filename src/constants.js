export const DEFAULT_CATEGORIES = [
    { id: 'c1', name: '餐饮美食', type: 'expense', isAnnualFixed: false, isRollover: false },
    { id: 'c2', name: '交通出行', type: 'expense', isAnnualFixed: false, isRollover: false },
    { id: 'c3_1', name: 'AutoDL 算力', type: 'expense', isAnnualFixed: false, isRollover: true, isAutoDL: true },
    { id: 'c3_2', name: '大模型 API', type: 'expense', isAnnualFixed: false, isRollover: true, isAPI: true },
    { id: 'c4', name: '日常购物', type: 'expense', isAnnualFixed: false, isRollover: false },
    { id: 'c5', name: '服务器/域名', type: 'expense', isAnnualFixed: true, isRollover: false },
    { id: 'i1', name: '工资收入', type: 'income', isAnnualFixed: false, isRollover: false },
    { id: 'i2', name: '其他收入', type: 'income', isAnnualFixed: false, isRollover: false },
];

export const DEFAULT_ACCOUNTS = [
    { id: 'a1', name: '日常账户', type: 'standard', balance: 0 },
    { id: 'a2', name: '备用金账户', type: 'saving', balance: 0 },
];

export const DEFAULT_BUDGET = {
    monthlyTotal: 2500,
    categoryLimits: {},
    rolloverBalances: {},
};

// 赛博相关初始定义 (供后续从 LocalStorage 自定义管理)
export const DEFAULT_AUTODL_PRICES = [
    { id: 'gpu1', name: 'RTX 3090', pricePerHour: 1.58 },
    { id: 'gpu2', name: 'RTX 4090', pricePerHour: 2.08 },
    { id: 'gpu3', name: 'H800', pricePerHour: 8.88 },
];

export const DEFAULT_API_MODELS = [
    { id: 'm1', name: 'DeepSeek-V3', pricePer1M: 2.0 },
    { id: 'm2', name: 'GPT-4o', pricePer1M: 35.0 },
    { id: 'm3', name: 'Claude 3.5 Sonnet', pricePer1M: 21.0 },
];
