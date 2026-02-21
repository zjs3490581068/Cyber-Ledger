import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

export default function BaseLayout() {
    return (
        <div className="min-h-screen max-w-screen overflow-x-hidden bg-gray-50 text-gray-900 font-sans pb-24 selection:bg-gray-200">
            {/* 核心内容渲染区通过 Outlet 展现子页面组件 */}
            <div className="w-full">
                <Outlet />
            </div>

            {/* 吸底导航栏容器 */}
            <BottomNavBar />
        </div>
    );
}
