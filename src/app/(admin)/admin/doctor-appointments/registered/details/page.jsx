
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getAppointmentsForRegisteredUser } from '@/lib/admin/doctorAppointmentAdminApi';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Loader2 } from 'lucide-react';
import { RegisteredDoctorAppointmentRecord } from '@/components/admin/doctor-appointments/RegisteredDoctorAppointmentRecord';
import { RegisteredUserAppointmentFormModal } from '@/components/admin/doctor-appointments/RegisteredUserAppointmentFormModal';

const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
    }),
};

export default function RegisteredUserDoctorAppointmentsDetailsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    
    useEffect(() => {
        const storedUser = localStorage.getItem('selectedRegisteredUserForDoctorAppointment');
        if (!storedUser) {
            toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a user first.' });
            router.push('/admin/doctor-appointments/registered');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router, toast]);


    const fetchAppointmentData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await getAppointmentsForRegisteredUser(user.id);
            const sortedAppointments = res.data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
            setAppointments(sortedAppointments);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: 'Could not retrieve appointment data.' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if(user) {
            fetchAppointmentData();
        }
    }, [user, fetchAppointmentData]);
    
    const handleSuccess = () => {
        fetchAppointmentData();
        closeModal();
    };

    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAppointment(null);
    };

    if (!user) {
         return (
            <div className="flex h-[50vh] w-full items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_IN_VARIANTS}>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            <motion.div variants={FADE_IN_VARIANTS}>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Appointment History ({appointments.length})</CardTitle>
                             <Button onClick={() => setIsModalOpen(true)}>
                                <PlusCircle className="mr-2" /> Add New Appointment
                            </Button>
                        </div>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {isModalOpen && (
                            <RegisteredUserAppointmentFormModal
                                isOpen={isModalOpen}
                                onClose={closeModal}
                                onSuccess={handleSuccess}
                                user={user}
                                appointment={editingAppointment}
                            />
                        )}

                        {isLoading ? (
                             <div className="text-center py-12 text-muted-foreground">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                <p className="mt-2">Loading appointment history...</p>
                            </div>
                        ) : appointments.length > 0 ? (
                            appointments.map(app => (
                                <RegisteredDoctorAppointmentRecord
                                    key={app.id} 
                                    appointment={app}
                                    onEdit={() => openEditModal(app)}
                                    onDeleteSuccess={fetchAppointmentData}
                                />
                            ))
                        ) : (
                             <div className="text-center py-12 text-muted-foreground">
                                <p>No doctor appointments found for this user.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
