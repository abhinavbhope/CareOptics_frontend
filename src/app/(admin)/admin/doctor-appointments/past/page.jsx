
"use client";

import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { PastUserSearchDashboard } from '@/components/admin/doctor-appointments/PastUserSearchDashboard';


const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function PastUserDoctorAppointmentsPage() {
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
                    Patient Records
                </h2>
                 <p className="text-muted-foreground mt-2">Search for an existing patient or create a new record to manage appointments.</p>
            </motion.div>

            <motion.div variants={FADE_IN_VARIANTS}>
                 <PastUserSearchDashboard />
            </motion.div>
        </motion.div>
    );
}
