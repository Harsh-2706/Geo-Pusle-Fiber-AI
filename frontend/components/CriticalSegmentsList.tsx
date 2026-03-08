"use client";

import { Segment } from "@/types/segment";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    segments: Segment[];
    onSelect: (segment: Segment) => void;
}

export default function CriticalSegmentsList({ segments, onSelect }: Props) {
    const critical = [...segments]
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5);

    return (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Critical Node Watchlist
            </h3>
            <div className="space-y-3">
                {critical.map((s, i) => (
                    <motion.button
                        key={s.segment_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => onSelect(s)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${s.risk_level === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                <span className="text-xs font-bold font-mono">{(s.risk_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">{s.segment_id}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{s.district} • {s.zone_type}</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
