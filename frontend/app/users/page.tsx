"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, ShieldCheck, Mail, LogIn, Clock } from "lucide-react";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        // Mock user data for the hackathon
        setUsers([
            { id: 1, name: "Super Admin", email: "admin@geopulse.com", role: "admin", lastLogin: "Just now" },
            { id: 2, name: "Ground Tech", email: "tech@geopulse.com", role: "technician", lastLogin: "2 hours ago" },
            { id: 3, name: "Field Ops Lead", email: "ops@geopulse.com", role: "technician", lastLogin: "Yesterday" }
        ]);
    }, []);

    return (
        <DashboardLayout allowedRoles={['admin']}>
            <header className="h-20 px-8 flex items-center border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <Users className="text-primary h-6 w-6" />
                    <h1 className="text-sm font-black text-white uppercase tracking-widest">User Management</h1>
                </div>
            </header>

            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div className="rounded-[2.5rem] border border-white/5 bg-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">User</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Last Active</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-0.5">{u.name}</p>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1"><Mail size={10} /> {u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${u.role === 'admin' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                                            <Clock size={12} /> {u.lastLogin}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                                            Edit Access
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
