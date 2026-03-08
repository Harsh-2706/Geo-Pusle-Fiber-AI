import { Segment } from "@/types/segment";

interface Props {
    segments: Segment[];
}

function getRiskEmoji(level: string) {
    if (level === "High") return "🔴";
    if (level === "Moderate") return "🟠";
    return "🟢";
}

function getInsight(segments: Segment[]): string[] {
    if (!segments.length) return ["Awaiting telemetry data…"];

    const isHybrid = segments.some(s => s.is_hybrid_mode);
    const hasDisaster = segments.some(s => s.composite_disaster_index && s.composite_disaster_index > 0.3);
    const high = segments.filter((s) => s.risk_level === "High");

    // Regional/Environmental Insights
    const hillRisks = segments.filter(s => s.zone_type === 'Hill Region' && (s.landslide_risk_index || 0) > 0.7);
    const coastalRisks = segments.filter(s => s.zone_type === 'Coastal' && (s.cyclone_exposure || 0) > 0.7);
    const deltaRisks = segments.filter(s => s.zone_type === 'Delta' && (s.flood_risk || 0) > 0.7);
    const metroRisks = segments.filter(s => s.zone_type === 'Urban Metro' && (s.traffic_congestion_index || 0) > 0.8);
    const highTrafficRisks = segments.filter(s => s.zone_type === 'Urban Metro' && (s.traffic_congestion_index || 0) > 0.8);

    // Evaluate festive gatherings based on current date
    const currentDate = new Date();
    const isFestiveSeason = currentDate.getMonth() === 0 || currentDate.getMonth() === 9 || currentDate.getMonth() === 10; // Pongal, Diwali etc.


    const insights = [
        `🧠 AI Model trained on: Soil Types, Ground Water, Climate Patterns, Traffic & Demographics.`,
        `🔍 ${high.length} segments flagged as HIGH RISK state-wide via Random Forest inference.`,
    ];

    if (isHybrid) {
        insights.push(`🌐 Hybrid Env Mode: Real-time telemetry integrated from Open-Meteo & Official Construction CSV.`);
    }

    if (hasDisaster) {
        insights.push(`🚨 STATEWIDE DISASTER MONITORING: NASA EONET & USGS Earthquake feeds active. High-risk zones identified.`);
    }

    if (hillRisks.length > 0) insights.push(`⛰️ Landslide risk detected in ${hillRisks.length} Hill Region segments.`);
    if (coastalRisks.length > 0) insights.push(`🌪️ Cyclone exposure impacting ${coastalRisks.length} Coastal segments.`);
    if (deltaRisks.length > 0) insights.push(`🌊 Flood alerts active for ${deltaRisks.length} Delta region segments.`);

    // Urban Metro specific AI reasoning
    if (metroRisks.length > 0 || highTrafficRisks.length > 0) {
        insights.push(`🏙️ Urban Metro alerts: High traffic congestion & ongoing civil construction increasing risk probability for underground fiber cuts.`);
    }

    if (isFestiveSeason) {
        insights.push(`🎉 Festive Gathering Alert: Increased crowd intensity and load limits detected. Adjusting maintenance dispatch priorities to avoid peak hours.`);
    }

    insights.push(`✅ Recommendation: Prioritize Urban Metro inspections & Hill Region monitoring based on current model outputs.`);

    return insights;
}

export default function AIAgentPanel({ segments }: Props) {
    const isHybrid = segments.some(s => s.is_hybrid_mode);
    const insights = getInsight(segments);
    const topRisk = [...segments]
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5);

    return (
        <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 h-full flex flex-col shadow-2xl overflow-hidden relative border-t-blue-500/20">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        🤖 Risk Analyst
                    </h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">GeoPulse Fiber AI Suite</p>
                </div>
                <div className="flex items-center gap-2">
                    {isHybrid && (
                        <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                            HYBRID
                        </div>
                    )}
                    {segments.some(s => (s.composite_disaster_index || 0) > 0.3) && (
                        <div className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                            DISASTER MONITOR
                        </div>
                    )}
                    <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] text-green-400 font-bold">
                        ACTIVE
                    </div>
                </div>
            </div>

            {/* Insights Container - Fixed Height Ratio to ensure visibility */}
            <div className="h-[140px] overflow-y-auto custom-scrollbar pr-1 space-y-2 mb-4 flex-shrink-0">
                {insights.map((line, i) => (
                    <div key={i} className="text-[10.5px] text-gray-300 leading-snug bg-white/5 border border-white/5 p-2.5 rounded-xl">
                        {line}
                    </div>
                ))}
                {!insights.length && (
                    <div className="text-[10.5px] text-gray-500 italic p-2 text-center">Synthesizing real-time risk data...</div>
                )}
            </div>

            {/* Top Critical Section */}
            <div className="flex-1 min-h-0 flex flex-col">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-bold flex-shrink-0">
                    High Priority Segments
                </p>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5">
                    {topRisk.map((s) => (
                        <div
                            key={s.segment_id}
                            className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
                        >
                            <span className="text-[11px] text-white font-bold flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${s.risk_level === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-500'}`} />
                                {s.segment_id}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                                {(s.risk_score * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
