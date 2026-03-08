"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { LogIn, ShieldCheck, HardHat } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Direct fetch to FastAPI
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();

            // Fetch user profile
            const userResponse = await fetch('http://127.0.0.1:8000/auth/me', {
                headers: { Authorization: `Bearer ${data.access_token}` },
            });

            const userData = await userResponse.json();
            login(data.access_token, userData);

        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white px-4">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-accent/20 blur-[100px]" />

            <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">GeoPulse Fiber AI</h1>
                    <p className="mt-2 text-sm text-gray-400">Enterprise Fiber Risk Intelligence Platform</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="admin@geopulse.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                        ) : (
                            <>Sign In to Dashboard</>
                        )}
                    </button>
                </form>

                <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <ShieldCheck className="text-primary mb-1" size={20} />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Administrator</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                        <HardHat className="text-secondary mb-1" size={20} />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Technician</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
