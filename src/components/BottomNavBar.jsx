import React from 'react';
import { NavLink } from 'react-router-dom';
import { PenTool, List, PieChart, User, Landmark, Info } from 'lucide-react';

export default function BottomNavBar() {
    const navItems = [
        { to: '/', icon: PenTool, label: '记账' },
        { to: '/accounts', icon: Landmark, label: '资产' },
        { to: '/transactions', icon: List, label: '明细' },
        { to: '/stats', icon: PieChart, label: '统计' },
        { to: '/settings', icon: User, label: '我的' },
        { to: '/about', icon: Info, label: '关于' }
    ];

    return (
        <nav className="fixed bottom-0 w-full left-0 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto pb-1">
                {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${isActive ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
                                }`
                            }
                        >
                            <Icon size={22} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
