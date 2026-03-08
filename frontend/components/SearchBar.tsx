"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Segment } from "@/types/segment";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    segments: Segment[];
    onSelect: (segment: Segment) => void;
}

export default function SearchBar({ segments, onSelect }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Segment[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const filtered = segments.filter(s =>
            s.segment_id.toLowerCase().includes(q) ||
            (s.district?.toLowerCase().includes(q)) ||
            (s.zone_type?.toLowerCase().includes(q)) ||
            (s.risk_level?.toLowerCase().includes(q))
        ).slice(0, 8);

        setResults(filtered);
    }, [query, segments]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-[200]">
            <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-gray-400 opacity-50" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search by ID, District, Zone, or Risk..."
                    className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 focus:border-blue-500/50 outline-none rounded-2xl py-3 pl-12 pr-10 text-sm text-gray-100 transition shadow-inner"
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-4 text-gray-500 hover:text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute w-full mt-3 bg-gray-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[9999]"
                    >
                        {results.map((s) => (
                            <button
                                key={s.segment_id}
                                onClick={() => {
                                    onSelect(s);
                                    setIsOpen(false);
                                    setQuery("");
                                }}
                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition text-left"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white">{s.segment_id}</p>
                                    <p className="text-xs text-gray-500">{s.district} — {s.zone_type}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.risk_level === 'High' ? 'bg-red-500/10 text-red-500' :
                                    s.risk_level === 'Moderate' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-green-500/10 text-green-500'
                                    }`}>
                                    {s.risk_level}
                                </span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
