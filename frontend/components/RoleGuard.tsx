"use client";

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles?: ('admin' | 'technician')[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user.role)) {
                // Redirect to their respective "home" if they try to access a restricted area
                if (user.role === 'admin') router.push('/admin');
                else router.push('/technician');
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RoleGuard;
