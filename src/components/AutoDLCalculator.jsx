import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

export default function AutoDLCalculator({ autodlPrices, onCalculate }) {
    const defaultId = autodlPrices && autodlPrices.length > 0 ? autodlPrices[0].id : '';
    const [gpuId, setGpuId] = useState(defaultId);
    const [hours, setHours] = useState('');

    useEffect(() => {
        if (hours && !isNaN(hours) && gpuId) {
            const gpu = autodlPrices.find(g => g.id === gpuId);
            if (gpu) {
                const total = (parseFloat(hours) * gpu.pricePerHour).toFixed(2);
                onCalculate(total, `AutoDL 算力: ${gpu.name} x ${hours}h`);
            }
        }
    }, [gpuId, hours, autodlPrices]);

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <Calculator size={14} />
                <span>AutoDL 算力计算器</span>
            </div>
            <div className="flex flex-col gap-2">
                <select
                    value={gpuId}
                    onChange={e => setGpuId(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded md:rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                >
                    {autodlPrices?.map(g => (
                        <option key={g.id} value={g.id}>{g.name} (¥{g.pricePerHour}/h)</option>
                    ))}
                </select>
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded md:rounded-md px-2 overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                    <input
                        type="number"
                        placeholder="使用时长"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        className="w-full py-1.5 outline-none bg-transparent"
                    />
                    <span className="text-gray-400 text-xs ml-1">h</span>
                </div>
            </div>
        </div>
    );
}
