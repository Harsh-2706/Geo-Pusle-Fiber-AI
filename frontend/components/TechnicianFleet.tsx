"use client";

import { User, Search, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Technician } from "@/types/segment";

interface Props {
    techs: Technician[];
    loading: boolean;
    onTechClick?: (tech: Technician) => void;
}

export default function TechnicianFleet({ techs = [], loading, onTechClick }: Props) {
    const [query, setQuery] = useState("");

    const filtered = techs.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.zone.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 w-full flex flex-col shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4 relative z-10 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" /> Responder Fleet
                    </h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Live Strategic Assets</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search fleet..."
                        className="bg-black/40 border border-white/5 rounded-xl py-1.5 pl-8 pr-3 text-[10px] text-white outline-none focus:border-blue-500/30 transition-all w-48"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative z-10 max-h-[300px]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 bg-gray-900 border-b border-white/10 z-20">
                        <tr className="text-[10px] uppercase text-gray-500 tracking-widest bg-black/20">
                            <th className="py-3 px-4 font-bold">Responder</th>
                            <th className="py-3 px-4 font-bold">Zone / Exp</th>
                            <th className="py-3 px-4 font-bold">Status</th>
                            <th className="py-3 px-4 font-bold">Mission / Active</th>
                            <th className="py-3 px-4 font-bold">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-xs text-gray-500">Connecting to secure comms...</td></tr>
                        ) : (
                            filtered.map((t) => (
                                <tr
                                    key={t.id}
                                    onClick={() => onTechClick?.(t)}
                                    className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/row"
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex flex-shrink-0 items-center justify-center text-blue-400 group-hover/row:scale-110 transition-transform">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white leading-tight">{t.name}</p>
                                                <p className="text-[9px] text-gray-500 mt-0.5">{t.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-xs text-gray-300">{t.zone}</p>
                                        <p className="text-[10px] text-gray-500">{t.experience}y exp</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-full inline-flex items-center gap-1.5 ${t.status === "Available" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Available' ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`} />
                                            {t.status}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {t.assigned_to ? (
                                            <div>
                                                <p className="text-[10.5px] text-orange-400 font-bold uppercase tracking-tight">{t.assigned_to}</p>
                                                <div className="flex items-center gap-1.5 opacity-60 mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    <span className="text-[8px] text-gray-400 uppercase font-black">Tracking</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 font-medium">Standby Mode</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs text-white font-bold">{t.rating}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10 flex-shrink-0">
                <div className="flex gap-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {techs.filter(t => t.status === 'Available').length} READY
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {techs.filter(t => t.status !== 'Available').length} DEPLOYED
                    </div>
                </div>
            </div>
        </div>
    );
}
