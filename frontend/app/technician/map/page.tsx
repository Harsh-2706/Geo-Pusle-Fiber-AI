"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RefreshCcw, Map as MapIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Segment, Technician } from "@/types/segment";
import SegmentSlideOver from "@/components/SegmentSlideOver";
import TechnicianFleet from "@/components/TechnicianFleet";
import NotificationCenter from "@/components/NotificationCenter";

export default function MaintenanceMapPage() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [techs, setTechs] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

    async function fetchData() {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [segRes, techRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/predictions/dashboard", { headers, cache: "no-store" }),
                fetch("http://127.0.0.1:8000/technicians", { cache: "no-store" })
            ]);

            const segData = await segRes.json();
            const techData = await techRes.json();

            setSegments(Array.isArray(segData) ? segData : []);
            setTechs(Array.isArray(techData) ? techData : []);
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
                    <MapIcon className="text-secondary h-6 w-6" />
                    <h1 className="text-sm font-black text-white uppercase tracking-widest">Responder Fleet & Dispatch</h1>
                </div>
                <div className="flex items-center gap-4">
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

                {/* Responder Fleet Complete Dataset */}
                <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <TechnicianFleet
                        techs={techs}
                        loading={loading}
                        onTechClick={(t) => {
                            if (t.assigned_to) {
                                const matchedSegment = segments.find(s => s.segment_id === t.assigned_to);
                                if (matchedSegment) {
                                    setSelectedSegment(matchedSegment);
                                }
                            }
                        }} />
                </div>

                {/* Dispatch Engine Visualization */}
                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 relative z-10 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Live Assignment Process Engine
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {segments.filter(s => s.dispatch_status && s.dispatch_status !== "Idle").slice(0, 6).map((seg, i) => (
                            <div key={seg.segment_id} className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 group hover:border-blue-500/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            High Risk Detected
                                        </div>
                                        <p className="text-sm font-bold text-white">{seg.segment_id}</p>
                                        <p className="text-[10px] text-gray-400">{seg.district} • {seg.zone_type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-500">{(seg.risk_score * 100).toFixed(0)}%</p>
                                    </div>
                                </div>

                                <div className="border-l-2 border-dashed border-blue-500/30 pl-3 py-1 my-1 ml-1 space-y-2">
                                    <p className="text-[10px] text-gray-500 font-mono tracking-tight leading-tight">
                                        &gt; Scanning nearest operatives...<br />
                                        &gt; Geolocating from [{seg.latitude.toFixed(2)}, {seg.longitude.toFixed(2)}]
                                    </p>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-[10px] text-blue-300 font-mono">
                                        MATCH FOUND:<br />
                                        ID: {seg.assigned_technician_id || "SYS-OP"}<br />
                                        Distance: {seg.estimated_arrival_time} min ETA
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between mt-auto">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Dispatched</p>
                                        <p className="text-xs font-bold text-white">{seg.assigned_technician_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            onClick={() => setSelectedSegment(seg)}
                                            className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md font-bold transition"
                                        >
                                            View Telemetry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {segments.filter(s => s.dispatch_status && s.dispatch_status !== "Idle").length === 0 && !loading && (
                            <div className="col-span-full py-12 text-center text-gray-500 text-xs font-mono border border-dashed border-white/10 rounded-2xl">
                                No active dispatch processes currently executing. All zones stable.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <SegmentSlideOver
                segment={selectedSegment}
                segments={segments}
                onClose={() => setSelectedSegment(null)}
            />

            {error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-xl text-white px-8 py-4 rounded-3xl shadow-2xl z-50">
                    ⚠️ {error}
                </div>
            )}
        </DashboardLayout>
    );
}
