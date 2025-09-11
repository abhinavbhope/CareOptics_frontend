
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Stethoscope, ChevronDown, User, Phone, MapPin } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteAppointmentForUser } from '@/lib/admin/doctorAppointmentAdminApi';

const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export function RegisteredDoctorAppointmentRecord({ appointment, onEdit, onDeleteSuccess }) {
    const { toast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteAppointmentForUser(appointment.id);
            toast({ title: "Appointment Deleted", description: "The appointment has been removed." });
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: "Could not delete the appointment."});
        }
    }

    return (
        <motion.div layout variants={itemVariants}>
            <Card className="bg-secondary/30 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <div>
                            <p className="font-bold flex items-center gap-2"><Calendar className="text-primary/80" />Appointment Date: {appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'PPP p') : 'N/A'}</p>
                            <p className="text-sm text-muted-foreground ml-7">Reason: {appointment.reasonForVisit || "N/A"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <ChevronDown className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-border/20 space-y-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><User size={14}/> Patient Name:</p>
                                        <p>{appointment.patientName}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Patient Age:</p>
                                        <p>{appointment.age}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><Phone size={14}/> Contact:</p>
                                        <p>{appointment.phone}</p>
                                    </div>
                                     <div>
                                        <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><MapPin size={14}/> Address:</p>
                                        <p>{appointment.address}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><Stethoscope size={14}/> Reason for Visit:</p>
                                        <p className="text-xs p-2 bg-background/40 rounded-md mt-1">{appointment.reasonForVisit || "Not specified"}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                     <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(appointment)}>
                            <Edit size={16} className="mr-1" /> Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm"><Trash2 size={16} className="mr-1" /> Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete this appointment record. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
