"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";


export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/auth');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            // Check expiry
            if (decodedToken.exp * 1000 < Date.now()) {
                localStorage.clear();
                router.push('/auth');
                return;
            }
            // Check role
            if (decodedToken.role !== 'ADMIN') {
                router.push('/');
                return;
            }
            setIsVerified(true);

        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.clear();
            router.push('/auth');
        }

    }, [router]);

    if (!isVerified) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen w-full bg-background">
            <AdminSidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
                <AdminHeader />
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
