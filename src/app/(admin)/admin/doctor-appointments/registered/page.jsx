
"use client";

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { RegisteredUserSearchDashboard } from '@/components/admin/doctor-appointments/RegisteredUserSearchDashboard';

const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function RegisteredUserDoctorAppointmentsPage() {
    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_IN_VARIANTS}>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-8 w-8" />
                    Registered User Appointments
                </h2>
                 <p className="text-muted-foreground mt-2">Search for a registered user to view or manage their doctor appointments.</p>
            </motion.div>

            <motion.div variants={FADE_IN_VARIANTS}>
                <RegisteredUserSearchDashboard />
            </motion.div>
        </motion.div>
    );
}
