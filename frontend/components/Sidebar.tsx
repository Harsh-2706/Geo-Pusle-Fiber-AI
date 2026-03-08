"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
    LayoutDashboard,
    Database,
    ShieldCheck,
    HardHat,
    Map as MapIcon,
    Bell,
    LogOut,
    Settings,
    CloudRain
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const adminLinks = [
        { name: 'Analytics Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Import Data', href: '/data-import', icon: Database },
        { name: 'User Management', href: '/users', icon: ShieldCheck },
    ];

    const technicianLinks = [
        { name: 'Risk Alert Hub', href: '/technician', icon: HardHat },
        { name: 'Fleet Responder Page', href: '/technician/map', icon: MapIcon },
        { name: 'Notifications Center', href: '/notifications', icon: Bell },
    ];

    const links = user.role === 'admin' ? adminLinks : technicianLinks;

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                {/* Logo */}
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">GeoPulse</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fiber AI Platform</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 space-y-1">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {user.role} Navigation
                    </p>
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={clsx(
                                    "group flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 relative",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/20"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={clsx("mr-3 h-5 w-5 transition-colors", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-5 bg-white rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / User Profile */}
                <div className="mt-auto border-t border-white/10 pt-4 px-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                            {user.name[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
