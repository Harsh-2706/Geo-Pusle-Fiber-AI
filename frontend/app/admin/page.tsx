"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RefreshCcw, Database, ShieldCheck, CloudRain } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCards from "@/components/StatsCards";
import AIAgentPanel from "@/components/AIAgentPanel";
import SearchBar from "@/components/SearchBar";
import AlertBanner from "@/components/AlertBanner";
import SegmentSlideOver from "@/components/SegmentSlideOver";
import TechnicianFleet from "@/components/TechnicianFleet";
import { Segment, Technician } from "@/types/segment";
import NotificationCenter from "@/components/NotificationCenter";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[480px] flex items-center justify-center bg-gray-900/50 backdrop-blur-md rounded-3xl text-gray-500 text-sm animate-pulse border border-white/5">
            Initializing Geospatial Engine...
        </div>
    ),
});

export default function AdminDashboard() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [dataMode, setDataMode] = useState<{ mode: string, last_import: string | null }>({ mode: 'synthetic', last_import: null });
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
            const [segRes, techRes, modeRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/predictions/dashboard", { headers, cache: "no-store" }),
                fetch("http://127.0.0.1:8000/technicians", { headers, cache: "no-store" }),
                fetch("http://127.0.0.1:8000/data/mode", { headers, cache: "no-store" })
            ]);

            if (!segRes.ok || !techRes.ok) throw new Error("API Connection Failed");

            const [segData, techData, modeData] = await Promise.all([segRes.json(), techRes.json(), modeRes.json()]);
            setSegments(segData);
            setTechnicians(techData);
            setDataMode(modeData);
            setLastRefresh(new Date().toLocaleTimeString());
        } catch (e: any) {
            setError(e.message || "Satellite link disrupted");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // 5s Polling
        return () => clearInterval(interval);
    }, []);

    // Monitor for new critical risks to trigger alerts
    useEffect(() => {
        if (segments.length === 0) return;

        const currentHighRiskCount = segments.filter(s => s.risk_level === 'High').length;
        const prevCount = parseInt(localStorage.getItem('prevHighRiskCount') || '0');

        if (currentHighRiskCount > prevCount) {
            // Trigger Alert
            try {
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.volume = 0.5;
                audio.play();
            } catch (e) {
                console.warn("Audio play blocked),", e);
            }
        }

        localStorage.setItem('prevHighRiskCount', currentHighRiskCount.toString());
    }, [segments]);

    // Removing unused NASA variable
    // const nasaRainfall = segments[0]?.nasa_rainfall_mm || 0;

    return (
        <DashboardLayout allowedRoles={['admin']}>
            <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl z-30">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="text-primary h-6 w-6" />
                    <div>
                        <h1 className="text-sm font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-widest">Admin Analytics</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{lastRefresh ? `Master Sync: ${lastRefresh}` : 'Connecting...'}</p>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <SearchBar segments={segments} onSelect={setSelectedSegment} />
                </div>

                <div className="flex items-center gap-4">
                    {/* Data Mode Indicator */}
                    <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${dataMode.mode === 'real' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                        <Database size={12} />
                        {dataMode.mode} Data
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition group disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-4 h-4 text-gray-400 group-hover:text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Add Notification Center with segments prop */}
                    <div className="ml-2">
                        <NotificationCenter segments={segments} />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AlertBanner segments={segments} onAction={setSelectedSegment} />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <StatsCards segments={segments} />
                    </div>

                    {/* Responder Fleet Table */}
                    <div className="col-span-1 lg:col-span-4 mt-6">
                        <TechnicianFleet
                            techs={technicians}
                            loading={loading}
                            onTechClick={(t) => {
                                if (t.assigned_to) {
                                    const matchedSegment = segments.find(s => s.segment_id === t.assigned_to);
                                    if (matchedSegment) {
                                        setSelectedSegment(matchedSegment);
                                    } else {
                                        alert(`Technician ${t.name} is dispatched to ${t.assigned_to}, but it is out of current bounds.`);
                                    }
                                } else {
                                    alert(`${t.name} is currently ${t.status} in the ${t.zone} Zone.`);
                                }
                            }} />
                    </div>
                </div>

                {/* Map Display */}
                <div className="flex-1 min-h-[500px] bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                    <MapComponent
                        segments={segments}
                        technicians={technicians}
                        onSelect={setSelectedSegment}
                    />

                    {/* Legend Overlay */}
                    <div className="absolute top-6 left-6 z-[80] bg-black/80 backdrop-blur-2xl border border-white/10 px-5 py-3 rounded-2xl flex gap-6 text-[9px] font-black tracking-widest uppercase shadow-2xl">
                        <div className="flex items-center gap-2 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical</div>
                        <div className="flex items-center gap-2 text-orange-400"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Caution</div>
                        <div className="flex items-center gap-2 text-blue-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Responder</div>
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
