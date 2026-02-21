import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

export default function PinLock({ expectedPin, onSuccess }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handlePress = (digit) => {
        if (input.length < 4) {
            const newVal = input + digit;
            setInput(newVal);
            if (newVal.length === 4) {
                if (newVal === expectedPin) {
                    onSuccess();
                } else {
                    setError(true);
                    setTimeout(() => {
                        setInput('');
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setInput(prev => prev.slice(0, -1));
        setError(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white pb-20 select-none">
            <Lock size={48} className={`mb-8 transition-colors duration-300 ${error ? 'text-red-500 animate-bounce' : 'text-blue-500'}`} />
            <h2 className={`text-xl font-medium mb-10 tracking-widest transition-colors duration-300 ${error ? 'text-red-400' : 'text-gray-300'}`}>
                {error ? '密钥拒绝' : '请输入安全密钥'}
            </h2>

            <div className="flex gap-6 mb-16 h-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < input.length ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] scale-110' : 'bg-gray-700'}`} />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handlePress(num.toString())} className="w-20 h-20 rounded-full bg-gray-800 text-3xl font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors flex items-center justify-center shadow-lg active:scale-95 duration-100">
                        {num}
                    </button>
                ))}
                <div />
                <button onClick={() => handlePress('0')} className="w-20 h-20 rounded-full bg-gray-800 text-3xl font-semibold hover:bg-gray-700 active:bg-gray-600 transition-colors flex items-center justify-center shadow-lg active:scale-95 duration-100">
                    0
                </button>
                <button onClick={handleDelete} className="w-20 h-20 rounded-full text-gray-400 hover:text-white active:bg-gray-800 transition-colors flex items-center justify-center active:scale-95 duration-100">
                    <Delete size={32} />
                </button>
            </div>
        </div>
    );
}
