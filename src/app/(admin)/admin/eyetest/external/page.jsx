
"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalUserEyeTestForm } from '@/components/admin/eyetest/ExternalUserEyeTestForm';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function ExternalUserEyeTestPage() {
    const router = useRouter();

    const handleSuccess = (response) => {
        // After successful creation, redirect to the main eye test page or a success page.
        router.push('/admin/eyetest');
    };

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_IN_VARIANTS}>
                 <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <UserPlus className="h-8 w-8" />
                    Create External User Test Record
                </h2>
                 <p className="text-muted-foreground mt-2">
                    Fill out the form below to create a new user and their first eye test record.
                    An OTP will be sent to the user's email for verification before submission.
                 </p>
            </motion.div>

            <motion.div variants={FADE_IN_VARIANTS}>
                 <Card className="bg-card/50 border-border/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <ExternalUserEyeTestForm 
                            onSuccess={handleSuccess}
                            onCancel={() => router.push('/admin/eyetest')}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
