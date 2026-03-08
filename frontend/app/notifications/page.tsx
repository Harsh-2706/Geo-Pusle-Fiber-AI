"use client";

import DashboardLayout from "@/components/DashboardLayout";
import UnifiedOperationalCenter from "@/components/UnifiedOperationalCenter";

export default function NotificationsPage() {
    return (
        <DashboardLayout allowedRoles={['admin', 'technician']}>
            <div className="flex-1 flex flex-col min-w-0 relative p-8">
                <div className="h-full w-full max-w-5xl mx-auto bg-black/30 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 overflow-hidden">
                    <UnifiedOperationalCenter />
                </div>
            </div>
        </DashboardLayout>
    );
}
