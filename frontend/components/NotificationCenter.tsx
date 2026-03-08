"use client";

import { Bell, X, AlertCircle, CheckCircle, Info, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Segment } from "@/types/segment";

export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: "error" | "warning" | "success" | "info";
    timestamp: string;
    read: boolean;
}

interface Props {
    segments: Segment[];
}

export default function NotificationCenter({ segments }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Initial permission request
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Track notified segments to prevent duplicates
    const [notifiedSegments, setNotifiedSegments] = useState<Set<string>>(new Set());

    // Monitor segments for new critical and moderate risks
    useEffect(() => {
        const highRisk = segments.filter(s => (s.risk_level === "High" || s.risk_level === "Moderate") && !notifiedSegments.has(s.segment_id));
        if (highRisk.length === 0) return;

        const newAlerts: SystemNotification[] = highRisk.map(s => ({
            id: `${s.segment_id}-${Date.now()}`,
            title: `${s.risk_level} Alert: ${s.segment_id}`,
            message: `${s.district} node showing ${(s.risk_score * 100).toFixed(1)}% failure probability.`,
            type: "error" as const,
            timestamp: new Date().toLocaleTimeString(),
            read: false
        })).slice(0, 3); // Limit to top 3 new ones

        setNotifications(prev => {
            const combined = [...newAlerts, ...prev].slice(0, 20); // Keep last 20
            setUnreadCount(combined.filter(n => !n.read).length);
            return combined;
        });

        // Track that we've notified about these segments
        setNotifiedSegments(prev => {
            const next = new Set(prev);
            highRisk.forEach(s => next.add(s.segment_id));
            return next;
        });

        // Browser Push Notification & Audio Alert
        if (newAlerts.length > 0) {
            if (isAudioEnabled) {
                // Audio Alert (Sound)
                try {
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                    audio.volume = 0.5;
                    audio.play().catch(e => console.log("Audio play blocked", e));
                } catch (e) {
                    console.warn("Audio play error", e);
                }

                // VOICE ALERT (TTS)
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const firstNew = newAlerts[0];
                    const msg = new SpeechSynthesisUtterance();
                    msg.text = `Attention: ${firstNew.title}. ${firstNew.message}`;
                    msg.rate = 1.0;
                    window.speechSynthesis.speak(msg);
                }
            }

            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("GeoPulse Fiber AI Alert", {
                    body: `${newAlerts.length} high-risk segments detected in the latest sync.`,
                    icon: "/favicon.ico"
                });
            }
        }
    }, [segments, notifiedSegments]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="flex items-center gap-2 relative">
            <button
                onClick={() => {
                    const next = !isAudioEnabled;
                    setIsAudioEnabled(next);
                    if (next && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const initMsg = new SpeechSynthesisUtterance("Voice alerts enabled");
                        initMsg.volume = 0.5;
                        window.speechSynthesis.speak(initMsg);
                    }
                }}
                className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition ${isAudioEnabled ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}
                title="Toggle Voice Alerts"
            >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition group"
            >
                <Bell className={`w-4 h-4 text-gray-400 group-hover:text-white transition-colors ${unreadCount > 0 ? "animate-bounce" : ""}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-gray-950">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-[140]" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[150] overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notifications Center</h3>
                                <button onClick={markAllRead} className="text-[10px] text-blue-400 font-bold hover:underline">Mark all read</button>
                            </div>

                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer ${!n.read ? "bg-blue-500/5" : ""}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 ${n.type === "error" ? "text-red-500" : "text-blue-500"}`}>
                                                    {n.type === "error" ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-white">{n.title}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                                                    <p className="text-[9px] text-gray-600 mt-2 font-mono">{n.timestamp}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-xs text-gray-500">No recent notifications</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
