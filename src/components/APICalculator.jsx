import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

// 这里假设按照每1M Token的美元计费，然后乘以汇率(例如6.91)
const USD_RATE = 6.91;

export default function APICalculator({ apiModels, onCalculate }) {
    const defaultId = apiModels && apiModels.length > 0 ? apiModels[0].id : '';
    const [modelId, setModelId] = useState(defaultId);
    const [tokens, setTokens] = useState('');

    useEffect(() => {
        if (tokens && !isNaN(tokens) && modelId) {
            const model = apiModels.find(m => m.id === modelId);
            if (model) {
                // tokens 的输入单位现在直接约定为 M (百万)
                const totalUSD = parseFloat(tokens) * model.pricePer1M;
                const totalRMB = (totalUSD * USD_RATE).toFixed(2);
                onCalculate(totalRMB, `API消耗: ${model.name} - ${tokens}M Tokens`);
            }
        }
    }, [modelId, tokens, apiModels]);

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <Cpu size={14} />
                <span>API Token 汇率换算</span>
            </div>
            <div className="flex flex-col gap-2">
                <select
                    value={modelId}
                    onChange={e => setModelId(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded md:rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                >
                    {apiModels?.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded md:rounded-md px-2 overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                    <input
                        type="number"
                        placeholder="数量 (M)"
                        value={tokens}
                        onChange={e => setTokens(e.target.value)}
                        className="w-full py-1.5 outline-none bg-transparent placeholder-gray-400"
                    />
                </div>
            </div>
            <p className="text-xs text-gray-400">目前按汇率 $1 = ¥6.91 估算</p>
        </div>
    );
}
