"use client";

import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, FileText, Database } from 'lucide-react';

interface CSVUploaderProps {
    onSuccess: () => void;
}

export default function CSVUploader({ onSuccess }: CSVUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus({ type: null, message: '' });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setStatus({ type: null, message: '' });

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/data/import-csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Upload failed');
            }

            setStatus({ type: 'success', message: result.message });
            setFile(null);
            onSuccess();
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-10 bg-white/5 transition-all hover:bg-white/10">
                <Upload size={48} className="text-gray-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Upload Real-Time Fiber Data</h3>
                <p className="text-xs text-gray-500 mb-6 text-center max-w-xs">
                    Drag and drop your spreadsheet here or click to browse. Supported format: .CSV
                </p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                />
                <label
                    htmlFor="csv-upload"
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest text-white cursor-pointer transition-all"
                >
                    {file ? 'Change File' : 'Select CSV'}
                </label>

                {file && (
                    <div className="mt-6 flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <FileText size={16} />
                        <span className="text-xs font-bold">{file.name}</span>
                    </div>
                )}
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full py-4 bg-primary rounded-2xl text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
            >
                {isUploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                ) : (
                    <>
                        <Database size={18} />
                        Process & Override Data
                    </>
                )}
            </button>

            {status.type && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-xs font-bold">{status.message}</p>
                </div>
            )}
        </div>
    );
}
