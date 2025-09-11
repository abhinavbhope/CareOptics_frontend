
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createAppointmentForRegisteredUser, updateAppointmentForUser } from '@/lib/admin/doctorAppointmentAdminApi';

const appointmentSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(0, "Age must be between 0 and 150.").max(150, "Age must be between 0 and 150."),
  phone: z.string().length(10, { message: "Phone number must be exactly 10 digits." }),
  address: z.string().min(10, "Please provide a complete address."),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
  appointmentDate: z.date({
    required_error: "An appointment date is required.",
  }).refine(date => date > new Date(), { message: "Appointment date must be in the future." }),
});

export function RegisteredUserAppointmentFormModal({ isOpen, onClose, onSuccess, user, appointment = null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patientName: "", age: "", phone: "", address: "",
            reasonForVisit: "", appointmentDate: null
        }
    });

    useEffect(() => {
        if (appointment) {
            form.reset({
                ...appointment,
                appointmentDate: new Date(appointment.appointmentDate),
            });
        } else if (user) {
            form.reset({
                patientName: user.name || "",
                age: user.age || "",
                phone: user.phone || "",
                address: user.address || "",
                reasonForVisit: "",
                appointmentDate: null
            });
        }
    }, [appointment, user, form]);

    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...values,
                appointmentDate: values.appointmentDate.toISOString(),
                userId: user.id
            };
            
            let response;
            if (appointment) {
                response = await updateAppointmentForUser(appointment.id, submissionData);
                toast({ title: "Appointment Updated", description: "The appointment has been successfully updated." });
            } else {
                response = await createAppointmentForRegisteredUser(submissionData);
                toast({ title: "Appointment Created", description: "New appointment has been booked." });
            }
            onSuccess(response.data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Operation Failed',
                description: error.response?.data?.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{appointment ? 'Edit Appointment' : 'New Appointment'} for {user?.name}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to {appointment ? 'update' : 'create'} an appointment.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="patientName" render={({ field }) => (
                                <FormItem><FormLabel>Patient Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="age" render={({ field }) => (
                                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="reasonForVisit" render={({ field }) => (
                            <FormItem><FormLabel>Reason for Visit</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Appointment Date</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                                    <div className="p-3 border-t border-border"><Input type="time" onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(field.value);
                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                        field.onChange(newDate);
                                    }} /></div>
                                </PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>
                         )} />
                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {appointment ? 'Save Changes' : 'Create Appointment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
