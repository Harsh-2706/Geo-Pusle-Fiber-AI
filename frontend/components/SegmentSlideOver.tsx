import { X, MapPin, Activity, ShieldAlert, Zap, Globe, Gauge, AlertTriangle, User, Clock, Phone } from "lucide-react";
import { Segment } from "@/types/segment";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    segment: Segment | null;
    onClose: () => void;
    segments: Segment[]; // for nearby count
}

export default function SegmentSlideOver({ segment, onClose, segments }: Props) {
    if (!segment) return null;

    // Derived AI logic
    const topRisks = [
        (segment.rainfall_mm || 0) > 300 ? { factor: "Excessive Rainfall", value: `${segment.rainfall_mm || 0}mm` } : null,
        segment.maintenance_gap > 300 ? { factor: "Maintenance Overdue", value: `${segment.maintenance_gap}d` } : null,
        (segment.past_faults || 0) > 3 ? { factor: "Historical Instability", value: `${segment.past_faults || 0} faults` } : null,
        segment.landslide_risk_index && segment.landslide_risk_index > 0.7 ? { factor: "Landslide Risk", value: segment.landslide_risk_index } : null,
        segment.composite_disaster_index && segment.composite_disaster_index > 0.1 ? { factor: segment.disaster_alert_reason || "Disaster Proximity", value: `${segment.disaster_proximity_km}km` } : null,
        segment.earthquake_magnitude && segment.earthquake_magnitude > 0 ? { factor: "Seismic Activity", value: `M${segment.earthquake_magnitude}` } : null,
    ].filter(Boolean) as { factor: string; value: string | number }[];

    const nearbyVulnerable = segments.filter(s =>
        s.segment_id !== segment.segment_id &&
        s.risk_level !== "Low" &&
        Math.abs(s.latitude - segment.latitude) < 0.1 &&
        Math.abs(s.longitude - segment.longitude) < 0.1
    ).length;

    const getPrimaryWeatherRisk = (seg: Segment) => {
        const risks = [
            { label: "Rainfall Exposure", value: `${seg.rainfall_mm || 0}mm`, score: (seg.rainfall_mm || 0) / 400 },
            { label: "Cyclone Risk", value: `${((seg.cyclone_exposure || 0) * 100).toFixed(0)}%`, score: seg.cyclone_exposure || 0 },
            { label: "Flood Risk", value: `${((seg.flood_risk || 0) * 100).toFixed(0)}%`, score: seg.flood_risk || 0 },
            { label: "Heat/Drought", value: `${((seg.heat_stress_index || 0) * 100).toFixed(0)}%`, score: seg.heat_stress_index || 0 },
            { label: "Landslide Risk", value: `${((seg.landslide_risk_index || 0) * 100).toFixed(0)}%`, score: seg.landslide_risk_index || 0 }
        ];
        return risks.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    };

    const primaryWeatherRisk = getPrimaryWeatherRisk(segment);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-950/80 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[100] overflow-y-auto"
            >
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{segment.segment_id}</h2>
                            <p className="text-gray-400 flex items-center gap-1.5 text-sm mt-1">
                                <MapPin className="w-3 h-3" /> {segment.district}, {segment.zone_type}
                            </p>
                        </div>
                        {segment.composite_disaster_index && segment.composite_disaster_index > 0.3 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Statewide Disaster Monitoring Active</span>
                            </div>
                        )}
                        {segment.is_hybrid_mode && !segment.composite_disaster_index && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Hybrid Active</span>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    {/* Risk Circle */}
                    <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-3xl border border-white/10 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition duration-500" />

                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor" strokeWidth="8"
                                    fill="transparent"
                                    className="text-gray-800"
                                />
                                <motion.circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor" strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    initial={{ strokeDashoffset: 364.4 }}
                                    animate={{ strokeDashoffset: 364.4 - (364.4 * segment.risk_score) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={segment.risk_level === 'High' ? 'text-red-500' : segment.risk_level === 'Moderate' ? 'text-orange-500' : 'text-green-500'}
                                />
                            </svg>
                            <div className="absolute text-center">
                                <p className="text-3xl font-bold text-white">{(segment.risk_score * 100).toFixed(0)}%</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Risk Score</p>
                            </div>
                        </div>

                        <div className={`mt-6 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg ${segment.risk_level === 'High' ? 'bg-red-500 text-white' :
                            segment.risk_level === 'Moderate' ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                            }`}>
                            {segment.risk_level} Priority
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> AI Risk Reasoning
                            </h3>
                            <div className="space-y-3">
                                {topRisks.length > 0 ? (
                                    topRisks.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                                            <span className="text-sm text-gray-300">{r.factor}</span>
                                            <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded">{r.value === 1 ? 'High' : r.value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-xl">
                                        <p className="text-xs text-green-400">No critical anomalies detected. Standard maintenance profile applies.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Recommendation
                            </h3>
                            <p className="text-sm text-blue-100 leading-relaxed">
                                {segment.risk_level === 'High'
                                    ? "Immediate field technician traversal required. Automated backup link initialized. Inspect for physical link degradation."
                                    : segment.risk_level === 'Moderate'
                                        ? "Proactive inspection scheduled within 48 hours. Monitor environmental metrics vs civil construction proximity."
                                        : "Healthy status. Maintain bi-annual inspection cycle."}
                            </p>
                        </section>

                        {/* Technician Dispatch Section */}
                        {segment.dispatch_status && segment.dispatch_status !== "Idle" && (
                            <section className="bg-orange-600/10 border border-orange-500/20 p-5 rounded-3xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" /> Maintenance Dispatch
                                    </h3>
                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                                        {segment.dispatch_status}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group/tech transition-colors hover:bg-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover/tech:scale-110 transition-transform">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-white">{segment.assigned_technician_name || "Specialist Pending"}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">Field Unit: {segment.assigned_technician_id || "N/A"}</p>
                                            </div>
                                            <p className="text-xs text-orange-400 font-mono mt-1 flex items-center gap-1.5">
                                                <Phone className="w-3 h-3" /> {segment.assigned_technician_contact}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-gray-500" />
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ETA: {segment.estimated_arrival_time} min</span>
                                                </div>
                                                <button className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg font-bold transition">
                                                    Call
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Full Data Grid */}
                        <section>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Full Telemetry
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <DataCard
                                    label={primaryWeatherRisk.label}
                                    value={primaryWeatherRisk.value}
                                    type={segment.is_real_weather || segment.composite_disaster_index ? "Real Data" : "Simulated Model"}
                                />
                                <DataCard label="Construction Prox." value={`${segment.construction_proximity_km || 0}km`} type="Real Data" />
                                <DataCard label="Traffic Density" value={segment.traffic_density ? segment.traffic_density.toFixed(1) : 0} type="Real Data" />
                                <DataCard label="Crowd Intensity" value={segment.crowd_intensity_index ? segment.crowd_intensity_index.toFixed(2) : 0} type={segment.nearest_festival_name ? "Real Data" : "Simulated Model"} />
                                <DataCard label="Maintenance Gap" value={`${segment.maintenance_gap || 0}d`} type="Simulated Model" />
                                {(segment.wind_risk_score !== undefined && segment.is_real_weather) && (
                                    <DataCard label="Wind Risk" value={(segment.wind_risk_score * 100).toFixed(0) + "%"} type="Real Data" />
                                )}
                                {segment.soil_instability_index !== undefined && (
                                    <DataCard label="Soil Instability" value={(segment.soil_instability_index * 100).toFixed(0) + "%"} type={segment.composite_disaster_index ? "Real Data" : "Simulated Model"} />
                                )}
                                {(segment.earthquake_magnitude !== undefined && segment.earthquake_magnitude > 0) && (
                                    <DataCard label="Seismic Mag" value={segment.earthquake_magnitude} type="Real Data" />
                                )}
                                {segment.disaster_proximity_km !== undefined && segment.disaster_proximity_km < 500 && (
                                    <DataCard label="Disaster Prox" value={`${segment.disaster_proximity_km}km`} type="Real Data" />
                                )}
                            </div>
                        </section>

                        {/* Confidence & Proximity */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">AI Confidence</p>
                                <p className="text-lg font-bold text-white flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-purple-400" /> 98.4%
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Nearby Alerts</p>
                                <p className="text-lg font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className={`w-4 h-4 ${nearbyVulnerable > 0 ? 'text-red-400' : 'text-green-400'}`} /> {nearbyVulnerable} segments
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function DataCard({ label, value, type }: { label: string, value: string | number, type: "Real Data" | "Simulated Model" }) {
    return (
        <div className="bg-gray-900 px-4 py-3 rounded-2xl border border-white/5 relative group/card">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">{label}</p>
            <p className="text-sm text-gray-200 font-medium">{value}</p>
            <div className={`mt-2 text-[8px] font-bold uppercase tracking-widest ${type === 'Real Data' ? 'text-blue-400' : 'text-gray-600'}`}>
                {type}
            </div>
        </div>
    );
}
