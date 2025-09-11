
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getAppointmentsForPastUser } from '@/lib/admin/doctorPastUserApi';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, Loader2, Trash2, Edit } from 'lucide-react';
import { PastDoctorAppointmentRecord } from '@/components/admin/doctor-appointments/PastDoctorAppointmentRecord';
import { PastUserAppointmentFormModal } from '@/components/admin/doctor-appointments/PastUserAppointmentFormModal';
import { PastUserFormModal } from '@/components/admin/doctor-appointments/PastUserFormModal';
import { deletePastUser } from '@/lib/admin/doctorPastUserApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
    }),
};

export default function PastUserDoctorAppointmentsDetailsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    
    useEffect(() => {
        const storedUser = localStorage.getItem('selectedPastUserForDoctorAppointment');
        if (!storedUser) {
            toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a past user first.' });
            router.push('/admin/doctor-appointments/past');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router, toast]);


    const fetchAppointmentData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await getAppointmentsForPastUser(user.id);
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
        closeAppointmentModal();
    };
    
    const handleUserUpdateSuccess = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('selectedPastUserForDoctorAppointment', JSON.stringify(updatedUser));
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = async () => {
        try {
            await deletePastUser(user.id);
            toast({ title: 'User Deleted', description: `${user.name}'s record has been permanently removed.` });
            localStorage.removeItem('selectedPastUserForDoctorAppointment');
            router.push('/admin/doctor-appointments/past');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the user record.' });
        }
    };


    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
        setIsAppointmentModalOpen(true);
    };
    
    const closeAppointmentModal = () => {
        setIsAppointmentModalOpen(false);
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
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div className='flex items-center gap-4'>
                            <Avatar className="h-16 w-16">
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <CardDescription>Phone: {user.phone} | Age: {user.age}</CardDescription>
                            </div>
                        </div>
                        <div className='flex gap-2'>
                           <Button variant="outline" onClick={() => setIsUserModalOpen(true)}>
                               <Edit className='mr-2 h-4 w-4' /> Edit User
                           </Button>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete User</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this user and all their appointments.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>
            
            {isUserModalOpen && <PastUserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSuccess={handleUserUpdateSuccess} user={user} />}

            <motion.div variants={FADE_IN_VARIANTS}>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Appointment History ({appointments.length})</CardTitle>
                             <Button onClick={() => setIsAppointmentModalOpen(true)}>
                                <PlusCircle className="mr-2" /> Add New Appointment
                            </Button>
                        </div>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {isAppointmentModalOpen && (
                            <PastUserAppointmentFormModal
                                isOpen={isAppointmentModalOpen}
                                onClose={closeAppointmentModal}
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
                                <PastDoctorAppointmentRecord
                                    key={app.id} 
                                    appointment={app}
                                    onEdit={() => openEditModal(app)}
                                    onDeleteSuccess={fetchAppointmentData}
                                    pastUserId={user.id}
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
