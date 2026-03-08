"use client";

import { useEffect, useState, useRef } from "react";
import {
    Bell,
    ShieldAlert,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Zap,
    MapPin,
    TrendingUp,
    ShieldCheck,
    Volume2,
    VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    notification_id: string;
    segment_id: string;
    district: string;
    alert_type: string;
    severity_level: "CRITICAL" | "HIGH" | "MEDIUM";
    reason_text: string;
    timestamp: string;
    technician_assigned: {
        id: string;
        name: string;
        specialty: string;
        eta: number;
    } | null;
    acknowledged: boolean;
}

export default function UnifiedOperationalCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [criticalCount, setCriticalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevCriticalIds = useRef<Set<string>>(new Set());

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch("http://127.0.0.1:8000/predictions/alerts", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            // The backend returns an array of notifications directly
            const notificationsArray = data || [];

            // Check for new MEDIUM/HIGH/CRITICAL alerts to play sound
            const currentHighs = notificationsArray.filter((n: Notification) => n.severity_level === "MEDIUM" || n.severity_level === "HIGH" || n.severity_level === "CRITICAL");
            const newHighDetected = currentHighs.some((n: Notification) => !prevCriticalIds.current.has(n.notification_id));

            if (newHighDetected && isAudioEnabled) {
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.log("Audio play blocked", e));
                }

                // VOICE ALERT (TTS)
                const firstNew = currentHighs.find((n: Notification) => !prevCriticalIds.current.has(n.notification_id));
                if (firstNew && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const msg = new SpeechSynthesisUtterance();
                    msg.text = `Alert: ${firstNew.severity_level} risk detected in ${firstNew.district} node. ${firstNew.alert_type}.`;
                    msg.rate = 0.9;
                    msg.pitch = 1.0;
                    window.speechSynthesis.speak(msg);
                }
            }

            // Update seen HIGHs
            currentHighs.forEach((n: Notification) => prevCriticalIds.current.add(n.notification_id));

            setNotifications(notificationsArray);
            setCriticalCount(notificationsArray.filter((n: Notification) => n.severity_level === "CRITICAL").length);
        } catch (e) {
            console.error("Failed to fetch alerts", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const acknowledge = (id: string) => {
        setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, acknowledged: true } : n));
    };

    const activeNotifications = notifications.filter(n => !n.acknowledged);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

            {/* Header / Stats */}
            <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2 text-blue-400">
                        NOTIFICATIONS CENTER
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Real-Time Core</span>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => {
                            const nextState = !isAudioEnabled;
                            setIsAudioEnabled(nextState);
                            if (nextState && 'speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const initMsg = new SpeechSynthesisUtterance("Voice alerts enabled");
                                initMsg.volume = 0.5;
                                window.speechSynthesis.speak(initMsg);
                            }
                        }}
                        className={`p-2 rounded-xl border transition ${isAudioEnabled ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                        title="Toggle TTS & Audio Alerts"
                    >
                        {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex flex-col items-center">
                        <span className="text-[10px] text-red-400 font-black">{criticalCount}</span>
                        <span className="text-[7px] text-red-500 font-bold">CRITICAL</span>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl flex flex-col items-center">
                        <span className="text-[10px] text-blue-400 font-black">{activeNotifications.length}</span>
                        <span className="text-[7px] text-blue-500 font-bold">TOTAL</span>
                    </div>
                </div>
            </div>

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-6 space-y-3">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 px-1">Active Alerts</p>
                <AnimatePresence mode="popLayout">
                    {activeNotifications.length > 0 ? (
                        activeNotifications.map((n) => (
                            <motion.div
                                layout
                                key={n.notification_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`relative overflow-hidden group p-4 rounded-2xl border transition-all ${n.severity_level === 'CRITICAL'
                                    ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                    : n.severity_level === 'HIGH'
                                        ? 'bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10'
                                        : 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'
                                    }`}
                            >
                                {n.severity_level === 'CRITICAL' && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-xl rounded-full -mr-8 -mt-8 animate-pulse" />
                                )}

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${n.severity_level === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' :
                                                n.severity_level === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'
                                                }`}>
                                                {n.severity_level}
                                            </span>
                                            <span className="text-[10px] text-white font-bold">{n.alert_type}</span>
                                        </div>
                                        <p className="text-[11px] text-white font-black leading-tight group-hover:text-blue-400 transition-colors uppercase">{n.segment_id}</p>
                                        <p className="text-[9px] text-gray-500 mt-0.5">{n.district}</p>
                                    </div>
                                    <button
                                        onClick={() => acknowledge(n.notification_id)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-500 hover:text-white"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-[10px] text-gray-400 italic mb-3">"{n.reason_text}"</p>

                                {n.technician_assigned && (
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white font-bold">{n.technician_assigned.name}</p>
                                                <p className="text-[7.5px] text-gray-500 uppercase">{n.technician_assigned.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-blue-400 font-bold flex items-center justify-end gap-1">
                                                <Clock className="w-2.5 h-2.5" /> {n.technician_assigned.eta}m
                                            </p>
                                            <p className="text-[7px] text-gray-600 font-bold uppercase">Assigned</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                            <ShieldCheck className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Network Secure</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Technician Summary Table */}
            <div className="bg-black/20 rounded-3xl p-4 border border-white/5 flex-shrink-0">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Responder Status
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.filter(n => n.technician_assigned).slice(0, 5).map(n => (
                        <div key={n.notification_id} className="flex items-center justify-between text-[10px] py-2 border-b border-white/5 last:border-0">
                            <div className="flex flex-col">
                                <span className="text-white font-bold">{n.technician_assigned?.name}</span>
                                <span className="text-[8px] text-orange-400 font-black uppercase">{n.segment_id}</span>
                            </div>
                            <div className="text-right">
                                <div className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full text-[8px] font-bold mb-0.5">ASSIGNED</div>
                                <span className="text-gray-500 text-[8px]">{n.technician_assigned?.eta}m arrival</span>
                            </div>
                        </div>
                    ))}
                    {!notifications.some(n => n.technician_assigned) && (
                        <p className="text-center py-4 text-[9px] text-gray-600 uppercase font-black">Fleet Idle</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
