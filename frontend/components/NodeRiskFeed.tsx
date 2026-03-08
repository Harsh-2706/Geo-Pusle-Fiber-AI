"use client";

import { Segment } from "@/types/segment";
import { AlertTriangle, Activity, MapPin, Zap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    segments: Segment[];
    onSelect?: (segment: Segment) => void;
}

export default function NodeRiskFeed({ segments, onSelect }: Props) {
    const highRiskNodes = segments
        .filter(s => s.risk_score > 0.4) // Show moderate and high
        .sort((a, b) => b.risk_score - a.risk_score);

    return (
        <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 h-full flex flex-col shadow-2xl overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" /> Node Risk Feed
                    </h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Live Critical Infrastructure</p>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-bold">
                    {highRiskNodes.length} ACTIVE
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                <AnimatePresence>
                    {highRiskNodes.map((node) => (
                        <motion.div
                            layout
                            key={node.segment_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => onSelect?.(node)}
                            className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer group/node relative overflow-hidden"
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${node.risk_level === "High" ? "bg-red-500" : "bg-orange-500"
                                }`} />

                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-xs font-bold text-white group-hover/node:text-purple-400 transition-colors">{node.segment_id}</p>
                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5" /> {node.district} ({node.zone_type})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-black ${node.risk_level === "High" ? "text-red-400" : "text-orange-400"
                                        }`}>
                                        {(node.risk_score * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className={`w-2.5 h-2.5 ${node.fiber_type === 'Aerial' ? 'text-yellow-400' : 'text-blue-400'}`} />
                                    <span className="text-[9px] text-gray-600 font-bold uppercase">{node.fiber_type}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-gray-700 group-hover/node:text-white transition-all transform group-hover/node:translate-x-1" />
                            </div>

                            {node.dispatch_status === "Dispatched" && (
                                <div className="mt-2 text-[8px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" /> Dispatch Active
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
