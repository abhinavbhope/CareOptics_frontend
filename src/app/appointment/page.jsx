
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Header } from '@/components/opticare/Header';
import { Footer } from '@/components/opticare/Footer';
import { User, Mail, Phone, MapPin, Eye, Calendar as CalendarIcon, Clock, PenSquare, Loader2 } from 'lucide-react';
import { AuthForm } from '@/components/opticare/AuthForm';
import { requestAppointment, getAvailableSlots } from '@/lib/appointmentApi';

const eyeProblemsOptions = [
  { id: 'blurred_vision', label: 'Blurred Vision' },
  { id: 'eye_strain', label: 'Eye Strain / Fatigue' },
  { id: 'headaches', label: 'Frequent Headaches' },
  { id: 'prescription_update', label: 'Prescription Update' },
  { id: 'glasses_lenses', label: 'New Glasses / Lenses' },
  { id: 'other', label: 'Other' },
];

const appointmentSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    address: z.string().min(10, { message: "Please provide a complete address." }),
    eyeProblems: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
    }),
    customProblem: z.string().optional(),
    preferredDate: z.date({
        required_error: "A date for the appointment is required.",
    }),
    preferredTime: z.string({
        required_error: "Please select a time for the appointment.",
    }),
}).refine(data => {
    if (data.eyeProblems.includes('other')) {
        return data.customProblem && data.customProblem.length > 5;
    }
    return true;
}, {
    message: "Please describe your problem if you select 'Other'.",
    path: ['customProblem'],
});

export default function AppointmentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [headerKey, setHeaderKey] = useState(0);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const form = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            eyeProblems: [],
            customProblem: "",
        },
    });

     useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/auth');
        } else {
            setIsCheckingAuth(false);
            setIsLoggedIn(true);
            const userName = localStorage.getItem('userName') || '';
            const userEmail = localStorage.getItem('userEmail') || '';
            
            form.reset({ 
                ...form.getValues(),
                name: userName, 
                email: userEmail,
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, form]);

    
    const watchEyeProblems = form.watch("eyeProblems");
    const watchPreferredDate = form.watch("preferredDate");
    const showCustomProblem = watchEyeProblems.includes('other');

    const fetchSlots = async (date) => {
        setIsLoadingSlots(true);
        try {
            const dateString = format(date, 'yyyy-MM-dd');
            const response = await getAvailableSlots(dateString);
            setAvailableSlots(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to fetch slots",
                description: "Could not load available time slots. Please try again.",
            });
            setAvailableSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };


    useEffect(() => {
        if (watchPreferredDate) {
            form.setValue('preferredTime', ''); // Reset time when date changes
            fetchSlots(watchPreferredDate);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchPreferredDate]);


    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...values,
                preferredDate: format(values.preferredDate, 'yyyy-MM-dd')
            };
            await requestAppointment(submissionData);
            toast({
                title: "Appointment Requested! ✅",
                description: "We've received your request and will contact you shortly to confirm.",
            });
            // Reset only non-user fields
            const currentValues = form.getValues();
            form.reset({
                ...currentValues,
                address: "",
                eyeProblems: [],
                customProblem: "",
                preferredDate: undefined,
                preferredTime: ""
            });
            setAvailableSlots([]);
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Booking Failed",
                description: error.response?.data?.message || "An unexpected error occurred.",
            });
            if (error.response?.status === 409) {
                 // Re-fetch slots if there was a conflict
                toast({
                    variant: "destructive",
                    title: "Slot Unavailable",
                    description: "This time slot was just booked. Please select another time.",
                });
                if(watchPreferredDate) fetchSlots(watchPreferredDate);
            }
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
            <Header key={headerKey} onOpenAuth={() => router.push('/auth')} />

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
                                Book Your Appointment
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Taking the first step towards better vision is easy. Fill out the form, and our team will get in touch with you to confirm your visit. We are committed to providing you with the best eye care experience.
                            </p>
                             <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Flexible Scheduling</h3>
                                        <p className="text-muted-foreground text-sm">Choose a date and time that works best for you. We offer a wide range of slots to fit your busy schedule.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                     <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Eye className="h-6 w-6 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Comprehensive Care</h3>
                                        <p className="text-muted-foreground text-sm">Our experts handle everything from routine check-ups to complex vision problems.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                         <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <Card className="bg-card/50 border-border/20 backdrop-blur-lg shadow-2xl shadow-primary/10">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-headline text-primary">Appointment Details</CardTitle>
                                    <CardDescription>Fill in your details to request an appointment.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Full Name</FormLabel>
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input placeholder="John Doe" {...field} className="pl-10 focus:ring-accent focus:border-accent" disabled={isLoggedIn} />
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email Address</FormLabel>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                <Input placeholder="you@example.com" {...field} className="pl-10 focus:ring-accent focus:border-accent" disabled={isLoggedIn}/>
                                                            </div>
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
                                                            <Input placeholder="+1 (555) 123-4567" {...field} className="pl-10 focus:ring-accent focus:border-accent" />
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
                                                            <Textarea placeholder="123 Visionary Lane, Optic City, 12345" {...field} className="pl-10 focus:ring-accent focus:border-accent" />
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name="eyeProblems"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Select/Describe you problem</FormLabel>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {eyeProblemsOptions.map((item) => (
                                                                <FormField
                                                                    key={item.id}
                                                                    control={form.control}
                                                                    name="eyeProblems"
                                                                    render={({ field }) => {
                                                                        return (
                                                                        <FormItem
                                                                            key={item.id}
                                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                                        >
                                                                            <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(item.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, item.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                        (value) => value !== item.id
                                                                                        )
                                                                                    )
                                                                                }}
                                                                            />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal">
                                                                                {item.label}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                        )
                                                                    }}
                                                                    />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {showCustomProblem && (
                                                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} transition={{duration: 0.3}}>
                                                    <FormField
                                                        control={form.control}
                                                        name="customProblem"
                                                        render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Please specify your problem</FormLabel>
                                                            <div className="relative">
                                                                <PenSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Textarea placeholder="Describe the issue you are facing..." {...field} className="pl-10 focus:ring-accent focus:border-accent" />
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                         
                                                        )}
                                                    />
                                                </motion.div>
                                            )}

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="preferredDate"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel>Preferred Date</FormLabel>
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
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
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
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="preferredTime"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Preferred Time</FormLabel>
                                                            <Select 
                                                                onValueChange={field.onChange} 
                                                                value={field.value}
                                                                disabled={!watchPreferredDate || isLoadingSlots}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={
                                                                            !watchPreferredDate ? "Please select a date first" :
                                                                            isLoadingSlots ? "Loading slots..." : "Select a time slot"
                                                                        } />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                     {availableSlots.length > 0 ? (
                                                                        availableSlots.map(slot => (
                                                                            <SelectItem key={slot} value={slot}>
                                                                                {slot}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <SelectItem value="no-slots" disabled>
                                                                            {isLoadingSlots ? "..." : watchPreferredDate ? "No available slots" : "Select a date"}
                                                                        </SelectItem>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Button 
                                                type="submit" 
                                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isSubmitting ? "Submitting..." : "Book Now"}
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
