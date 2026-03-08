"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CSVUploader from '@/components/CSVUploader';
import { Database, RefreshCw, Clock, Table, AlertCircle } from 'lucide-react';

export default function DataImportPage() {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchMetadata = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:8000/data/mode', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMetadata(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const switchToSynthetic = async () => {
        const token = localStorage.getItem('token');
        try {
            await fetch('http://127.0.0.1:8000/data/switch-to-synthetic', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMetadata();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    return (
        <DashboardLayout allowedRoles={['admin']}>
            <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <Database className="text-primary h-6 w-6" />
                    <h1 className="text-sm font-black text-white uppercase tracking-widest">Data Management Center</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Uploader Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                1
                            </span>
                            Ingest Core Data
                        </h2>
                        <CSVUploader onSuccess={fetchMetadata} />
                    </div>

                    {/* Status Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                2
                            </span>
                            System Status
                        </h2>

                        <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Current Modality</p>
                                    <div className={`px-4 py-1 rounded-full border text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 ${metadata?.mode === 'real' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                        <span className={`h-2 w-2 rounded-full ${metadata?.mode === 'real' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        {metadata?.mode || 'Loading...'}
                                    </div>
                                </div>
                                {metadata?.mode === 'real' && (
                                    <button
                                        onClick={switchToSynthetic}
                                        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                                        title="Revert to Synthetic"
                                    >
                                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Last Sync</span>
                                    </div>
                                    <p className="text-sm font-bold text-white tracking-tight">{metadata?.last_import || 'Never'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Table size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Imported Records</span>
                                    </div>
                                    <p className="text-sm font-bold text-white tracking-tight">{metadata?.record_count || 0} Segments</p>
                                </div>
                            </div>

                            {metadata?.mode === 'synthetic' && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400/80">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <p className="text-[11px] font-medium leading-relaxed">
                                        The platform is currently operating in <strong>Autonomous Synthetic Mode</strong>. Fiber risk is being calculated using simulated Thanjavur district parameters.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Requirements Table */}
                <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Required CSV Schema</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {['segment_id', 'rainfall', 'soil_type', 'fiber_age', 'maintenance_gap'].map(col => (
                            <div key={col} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center">
                                <code className="text-xs font-bold text-primary">{col}</code>
                                <span className="text-[9px] text-gray-500 font-bold uppercase mt-2">Required</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
