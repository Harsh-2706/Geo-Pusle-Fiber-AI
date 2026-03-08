"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, LayoutDashboard, Bell, Activity } from "lucide-react";
import TechnicianFleet from "@/components/TechnicianFleet";
import { Technician } from "@/types/segment";

export default function FleetPage() {
    const [techs, setTechs] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTechs = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/technicians");
            const data = await res.json();
            setTechs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechs();
        const interval = setInterval(fetchTechs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen bg-gray-950 text-white selection:bg-purple-500/30 selection:text-white font-sans overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full -mr-96 -mt-96 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/10 blur-[150px] rounded-full -ml-96 -mb-96 animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="flex h-screen overflow-hidden relative z-10">
                {/* 1. Slim Sidebar (Nav) */}
                <aside className="w-20 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col items-center py-6 gap-8 flex-shrink-0">
                    <Link href="/">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center shadow-lg shadow-blue-500/20 group cursor-pointer transition hover:shadow-blue-500/40">
                            <Zap className="text-white w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                    </Link>
                    <nav className="flex flex-col gap-6 w-full px-4">
                        <Link href="/" className="flex justify-center p-3 text-gray-500 hover:text-white transition hover:bg-white/5 rounded-xl" title="Home">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </Link>
                        <Link href="/dashboard" className="flex justify-center p-3 text-gray-500 hover:text-white transition hover:bg-white/5 rounded-xl" title="Dashboard">
                            <LayoutDashboard className="w-6 h-6" />
                        </Link>
                        <Link href="/notifications" className="flex justify-center p-3 text-gray-500 hover:text-white transition hover:bg-white/5 rounded-xl" title="Notifications Center">
                            <Bell className="w-6 h-6" />
                        </Link>
                        <Link href="/fleet" className="flex justify-center p-3 text-blue-400 bg-blue-400/10 rounded-xl shadow-inner shadow-blue-400/20" title="Responder Fleet">
                            <Activity className="w-6 h-6" />
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 relative p-8">
                    <div className="h-full w-full max-w-5xl mx-auto bg-black/30 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col">
                        <TechnicianFleet techs={techs} loading={loading} />
                    </div>
                </main>
            </div>
        </div>
    );
}
