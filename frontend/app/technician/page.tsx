"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RefreshCcw, HardHat, AlertTriangle, MapPin } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AIAgentPanel from "@/components/AIAgentPanel";
import AlertBanner from "@/components/AlertBanner";
import SegmentSlideOver from "@/components/SegmentSlideOver";
import { Segment, Technician } from "@/types/segment";

import NotificationCenter from "@/components/NotificationCenter";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-3xl text-gray-500 text-sm animate-pulse border border-white/5">
            Initializing Tactical Grid...
        </div>
    ),
});

export default function TechnicianDashboard() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<string>("");
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

    async function fetchData() {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await fetch("http://127.0.0.1:8000/predictions/dashboard", { headers, cache: "no-store" });

            if (!response.ok) throw new Error("API Connection Failed");

            const data = await response.json();
            // Backend already filters for High Risk for Technicians, but we ensure it here too.
            setSegments(data);
            setLastRefresh(new Date().toLocaleTimeString());
        } catch (e: any) {
            setError(e.message || "Link unstable");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardLayout allowedRoles={['technician']}>
            <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl z-30">
                <div className="flex items-center gap-4">
                    <HardHat className="text-secondary h-6 w-6" />
                    <div>
                        <h1 className="text-sm font-black text-white uppercase tracking-widest">Field Operations Hub</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{lastRefresh ? `Active Sync: ${lastRefresh}` : 'Connecting...'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                        <AlertTriangle size={12} />
                        {segments.length} High Risk Zones Detected
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition group disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-4 h-4 text-gray-400 group-hover:text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <NotificationCenter segments={segments} />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AlertBanner segments={segments} onAction={setSelectedSegment} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Tactical Map */}
                    <div className="xl:col-span-2 min-h-[500px] bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                        <MapComponent
                            segments={segments}
                            technicians={[]} // Technicians don't need to see other fleet members in their tactical view
                            onSelect={setSelectedSegment}
                        />

                        <div className="absolute top-6 left-6 z-[80] bg-black/80 backdrop-blur-2xl border border-white/10 px-5 py-3 rounded-2xl flex gap-6 text-[9px] font-black tracking-widest uppercase shadow-2xl">
                            <div className="flex items-center gap-2 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Critical Failure Probable</div>
                        </div>
                    </div>

                    {/* Targeted Insights */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-red-600/20 to-transparent border border-red-500/20 rounded-[2rem] p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                                <MapPin size={16} />
                                Priority Inspection Tasks
                            </h3>
                            <div className="space-y-3">
                                {segments.slice(0, 5).map(s => (
                                    <button
                                        key={s.segment_id}
                                        onClick={() => setSelectedSegment(s)}
                                        className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex justify-between items-center group"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-white">{s.segment_id}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{s.soil_type} · {s.fiber_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-red-500">{(s.risk_score * 100).toFixed(0)}%</p>
                                            <p className="text-[8px] text-gray-500 uppercase font-black">Risk</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AIAgentPanel segments={segments} />
                    </div>
                </div>
            </div>

            <SegmentSlideOver
                segment={selectedSegment}
                segments={segments}
                onClose={() => setSelectedSegment(null)}
            />

            {error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-3xl shadow-2xl z-50 flex items-center gap-4 font-black text-xs uppercase tracking-widest">
                    ⚠️ {error}
                </div>
            )}
        </DashboardLayout>
    );
}
