"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Zap, RefreshCcw, LayoutDashboard, Bell } from "lucide-react";

import StatsCards from "@/components/StatsCards";
import AIAgentPanel from "@/components/AIAgentPanel";
import SearchBar from "@/components/SearchBar";
import SegmentSlideOver from "@/components/SegmentSlideOver";
import AlertBanner from "@/components/AlertBanner";
import CriticalSegmentsList from "@/components/CriticalSegmentsList";
import TechnicianFleet from "@/components/TechnicianFleet";
import { Segment, Technician } from "@/types/segment";

import NotificationCenter from "@/components/NotificationCenter";

// Client-side only components
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[480px] flex items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-3xl text-gray-500 text-sm animate-pulse border border-white/5">
            Initializing Geospatial Engine...
        </div>
    ),
});

export default function DashboardPage() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<string>("");

    // UI State
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

    async function fetchData() {
        setLoading(true);
        setError(null);
        try {
            const [segRes, techRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/dashboard", { cache: "no-store" }),
                fetch("http://127.0.0.1:8000/technicians", { cache: "no-store" })
            ]);

            if (!segRes.ok || !techRes.ok) throw new Error("API Connection Failed");

            const [segData, techData] = await Promise.all([segRes.json(), techRes.json()]);
            setSegments(segData);
            setTechnicians(techData);
            setLastRefresh(new Date().toLocaleTimeString());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Satellite link disrupted");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen bg-gray-950 text-white selection:bg-purple-500/30 selection:text-white font-sans overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full -mr-96 -mt-96 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full -ml-96 -mb-96 animate-pulse" style={{ animationDelay: '1.5s' }} />
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
                        <Link href="/dashboard" className="flex justify-center p-3 text-blue-400 bg-blue-400/10 rounded-xl shadow-inner shadow-blue-400/20" title="Dashboard">
                            <LayoutDashboard className="w-6 h-6" />
                        </Link>
                        <Link href="/notifications" className="flex justify-center p-3 text-gray-500 hover:text-white transition hover:bg-white/5 rounded-xl" title="Notifications Center">
                            <Bell className="w-6 h-6" />
                        </Link>
                    </nav>
                </aside>

                {/* 2. Left Feed: Responder Fleet */}
                <aside className="w-[380px] 2xl:w-[440px] border-r border-white/5 bg-black/20 backdrop-blur-2xl p-6 flex flex-col min-w-0 hidden lg:flex flex-shrink-0">
                    <TechnicianFleet techs={technicians} loading={loading} />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 relative">
                    {/* Floating Header */}
                    <header className="h-20 px-8 flex items-center justify-between bg-gray-950/40 backdrop-blur-2xl border-b border-white/5 flex-shrink-0 z-[100]">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-sm font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-[0.2em]">GeoPulse Fiber AI</h1>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">{lastRefresh ? `Sync: ${lastRefresh}` : 'Connecting...'}</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-xl mx-8">
                            <SearchBar segments={segments} onSelect={setSelectedSegment} />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition group disabled:opacity-50 shadow-sm"
                            >
                                <RefreshCcw className={`w-4 h-4 text-gray-400 group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <NotificationCenter segments={segments} />
                        </div>
                    </header>

                    {/* Content Hub */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="max-w-[1800px] mx-auto space-y-6 flex flex-col h-full">
                            <AlertBanner segments={segments} onAction={setSelectedSegment} />

                            {/* Analytics Row */}
                            <StatsCards segments={segments} />

                            {/* Map & Main Display */}
                            <div className="flex-1 flex flex-col min-h-[500px] bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                {loading && segments.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">
                                        Calibrating Geospatial Matrix...
                                    </div>
                                ) : (
                                    <MapComponent
                                        segments={segments}
                                        technicians={technicians}
                                        onSelect={setSelectedSegment}
                                    />
                                )}
                                {/* Legend Overlay */}
                                <div className="absolute top-6 left-6 z-[80] bg-black/80 backdrop-blur-2xl border border-white/10 px-5 py-3 rounded-2xl flex gap-6 text-[9px] font-black tracking-widest uppercase shadow-2xl">
                                    <div className="flex items-center gap-2 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Critical</div>
                                    <div className="flex items-center gap-2 text-orange-400"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Caution</div>
                                    <div className="flex items-center gap-2 text-blue-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> Responder</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 3. Right Sidebar: Insights */}
                <aside className="w-[360px] 2xl:w-[420px] border-l border-white/5 bg-black/30 backdrop-blur-3xl p-6 flex flex-col gap-6 flex-shrink-0 hidden xl:flex min-w-0 overflow-hidden h-full">
                    <div className="flex-1 min-h-0">
                        <AIAgentPanel segments={segments} />
                    </div>
                </aside>
            </div>

            {/* Global Overlays */}
            <SegmentSlideOver
                segment={selectedSegment}
                segments={segments}
                onClose={() => setSelectedSegment(null)}
            />

            {error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.3)] z-[200] flex items-center gap-4 font-black text-xs uppercase tracking-widest border border-white/20">
                    <span className="p-1 bg-white/20 rounded-lg">⚠️</span> {error}
                </div>
            )}
        </div>
    );
}
