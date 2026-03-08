"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { Segment } from "@/types/segment";
import { motion } from "framer-motion";

interface Props {
    segments: Segment[];
    onAction: (segment: Segment) => void;
}

export default function AlertBanner({ segments, onAction }: Props) {
    const highRisk = segments.filter(s => s.risk_level === 'High');
    if (highRisk.length === 0) return null;

    const mostCritical = [...highRisk].sort((a, b) => b.risk_score - a.risk_score)[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-4 flex items-center justify-between group cursor-pointer"
            onClick={() => onAction(mostCritical)}
        >
            <div className="flex items-center gap-4">
                <div className="bg-red-500 p-2 rounded-xl text-white animate-pulse">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-red-400 font-bold text-sm">Critical Failure Imminent</h4>
                    <p className="text-red-200/60 text-xs">
                        {highRisk.length} segments require immediate deployment. Most critical: {mostCritical.segment_id} ({mostCritical.district})
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                VIEW DETAILS <ArrowRight className="w-4 h-4" />
            </div>
        </motion.div>
    );
}
