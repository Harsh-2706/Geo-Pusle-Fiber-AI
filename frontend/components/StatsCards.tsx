import { Segment } from "@/types/segment";

interface Props {
    segments: Segment[];
}

export default function StatsCards({ segments }: Props) {
    const total = segments.length;
    const highRisk = segments.filter((s) => s.risk_level === "High").length;
    const avgRisk =
        total > 0
            ? (segments.reduce((sum, s) => sum + s.risk_score, 0) / total).toFixed(3)
            : "0.000";

    const cards = [
        {
            label: "Total Segments",
            value: total,
            color: "from-blue-600 to-blue-800",
            icon: "🗂️",
        },
        {
            label: "High Risk",
            value: highRisk,
            color: "from-red-600 to-red-800",
            icon: "⚠️",
        },
        {
            label: "Avg Risk Score",
            value: avgRisk,
            color: "from-orange-500 to-orange-700",
            icon: "📊",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {cards.map((c) => (
                <div
                    key={c.label}
                    className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 overflow-hidden transition-all hover:border-white/10 hover:bg-gray-900/60 shadow-2xl min-w-0"
                >
                    {/* Background Icon */}
                    <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 scale-150 pointer-events-none">
                        <span className="text-7xl">{c.icon}</span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-1">{c.label}</p>
                        <p className="text-4xl font-black text-white tracking-tighter mb-4">{c.value}</p>

                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Live Telemetry</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
