
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Header } from '@/components/opticare/Header';
import { Footer } from '@/components/opticare/Footer';
import { User, Mail, Phone, MapPin, Calendar as CalendarIcon, Loader2, Stethoscope } from 'lucide-react';
import { AuthForm } from '@/components/opticare/AuthForm';
import { bookDoctorAppointment } from '@/lib/doctorAppointmentApi';

const appointmentSchema = z.object({
  patientName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(0, "Age must be between 0 and 150.").max(150, "Age must be between 0 and 150."),
  phone: z.string().length(10, { message: "Phone number must be exactly 10 digits." }),
  address: z.string().min(10, { message: "Please provide a complete address." }),
  reasonForVisit: z.string().min(5, { message: "Please provide a reason for your visit." }),
  appointmentDate: z.date({
    required_error: "An appointment date is required.",
  }).refine(date => date > new Date(), { message: "Appointment date must be in the future." }),
});

export default function DoctorAppointmentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [headerKey, setHeaderKey] = useState(0);

    const form = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patientName: "",
            age: "",
            phone: "",
            address: "",
            reasonForVisit: "",
        },
    });

    const handleLoginSuccess = () => {
        setShowAuth(false);
        setHeaderKey(prevKey => prevKey + 1);
        const token = localStorage.getItem('authToken');
         if (token) {
            setIsLoggedIn(true);
            const userName = localStorage.getItem('userName') || '';
            const userPhone = localStorage.getItem('userPhone') || '';
            form.reset({
                ...form.getValues(),
                patientName: userName,
                phone: userPhone,
            });
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setShowAuth(true);
            setIsCheckingAuth(false);
        } else {
            setIsLoggedIn(true);
            const userName = localStorage.getItem('userName') || '';
            const userPhone = localStorage.getItem('userPhone') || '';
            form.reset({
                ...form.getValues(),
                patientName: userName,
                phone: userPhone,
            });
            setIsCheckingAuth(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...values,
                appointmentDate: values.appointmentDate.toISOString()
            };
            await bookDoctorAppointment(submissionData);
            toast({
                title: "Appointment Booked! ✅",
                description: "Your appointment has been successfully scheduled. We look forward to seeing you.",
            });
            const currentValues = form.getValues();
             form.reset({
                ...currentValues,
                age: "",
                address: "",
                reasonForVisit: "",
                appointmentDate: undefined,
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Booking Failed",
                description: error.response?.data?.message || "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isCheckingAuth) {
         return (
            <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying access...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
            <Header key={headerKey} onOpenAuth={() => setShowAuth(true)} />
            
            {showAuth && !isLoggedIn && (
                <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                <div onClick={(e) => e.stopPropagation()}>
                    <AuthForm onLoginSuccess={handleLoginSuccess} />
                </div>
                </div>
            )}

            <main className="flex-1 py-12 md:py-20">
                <motion.div
                    className="container mx-auto max-w-7xl px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold font-headline bg-gradient-to-r from-primary to-accent-neon bg-clip-text text-transparent">
                                Book a Doctor's Appointment
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Your health is our priority. Schedule a consultation with one of our expert doctors. Fill out the form for yourself or a family member.
                            </p>
                        </motion.div>

                         <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <Card className="bg-card/50 border-border/20 backdrop-blur-lg shadow-2xl shadow-primary/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-headline text-primary">Appointment Details</CardTitle>
                                    <CardDescription>Enter patient details to request an appointment.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="patientName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Patient Name</FormLabel>
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input placeholder="John Doe" {...field} className="pl-10 focus:ring-accent focus:border-accent" />
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="age"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Age</FormLabel>
                                                            <Input type="number" placeholder="e.g., 30" {...field} className="focus:ring-accent focus:border-accent" />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                             <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                         <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="1234567890" {...field} className="pl-10 focus:ring-accent focus:border-accent" />
                                                         </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Address</FormLabel>
                                                        <div className="relative">
                                                             <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Textarea placeholder="123 Health St, Wellness City, 12345" {...field} className="pl-10 focus:ring-accent focus:border-accent" />
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="reasonForVisit"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Reason for Visit</FormLabel>
                                                        <Textarea placeholder="e.g., Annual check-up, specific symptom..." {...field} className="focus:ring-accent focus:border-accent" />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                    control={form.control}
                                                    name="appointmentDate"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Appointment Date</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP HH:mm")
                                                                    ) : (
                                                                        <span>Pick a date and time</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) =>
                                                                            date < new Date(new Date().setHours(0,0,0,0))
                                                                        }
                                                                        initialFocus
                                                                    />
                                                                    <div className="p-3 border-t border-border">
                                                                        <Input type="time" onChange={(e) => {
                                                                            const [hours, minutes] = e.target.value.split(':');
                                                                            const newDate = new Date(field.value);
                                                                            newDate.setHours(parseInt(hours), parseInt(minutes));
                                                                            field.onChange(newDate);
                                                                        }} />
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            <Button 
                                                type="submit" 
                                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isSubmitting ? "Booking..." : "Book Appointment"}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </motion.div>
                     </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}

