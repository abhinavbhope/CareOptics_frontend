"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KeyRound, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UpdatePasswordForm } from '@/components/opticare/UpdatePasswordForm';

export default function AdminSettingsPage() {
    const [user, setUser] = useState({ name: '', email: '' });

    useEffect(() => {
        const userName = localStorage.getItem('userName') || 'Admin';
        const userEmail = localStorage.getItem('userEmail') || 'admin@example.com';
        setUser({ name: userName, email: userEmail });
    }, []);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
    >
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="bg-card/50 border-border/20 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> Profile</CardTitle>
                        <CardDescription>Your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=admin`} />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="bg-card/50 border-border/20 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound/> Change Password</CardTitle>
                        <CardDescription>Update your password below. Remember to use a strong password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <UpdatePasswordForm />
                    </CardContent>
                </Card>
            </div>
        </div>

    </motion.div>
  );
}
