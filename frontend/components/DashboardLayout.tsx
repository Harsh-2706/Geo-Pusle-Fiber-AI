"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import RoleGuard from '@/components/RoleGuard';

interface DashboardLayoutProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'technician')[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
    return (
        <RoleGuard allowedRoles={allowedRoles}>
            <div className="flex h-screen bg-black overflow-hidden selection:bg-primary/30 selection:text-white">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 pl-64 overflow-hidden">
                    {children}
                </main>
            </div>
        </RoleGuard>
    );
}
