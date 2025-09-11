
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createPastUser } from '@/lib/admin/pastUserApi';
import { Loader2, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Send } from 'lucide-react';

const measurementSchema = z.object({
  sph: z.coerce.number(),
  cyl: z.coerce.number().optional(),
  axis: z.coerce.number().optional(),
  add: z.coerce.number().optional(),
  vision: z.string().optional(),
}).default({ sph: 0 });

const stepSchemas = [
  z.object({ // Step 1: Personal Info
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    address: z.string().optional(),
    age: z.coerce.number().positive().optional(),
  }),
  z.object({ // Step 2: Vision Measurements
    dvRightEye: measurementSchema,
    dvLeftEye: measurementSchema,
    nvRightEye: measurementSchema,
    nvLeftEye: measurementSchema,
    imRightEye: measurementSchema,
    imLeftEye: measurementSchema,
  }),
  z.object({ // Step 3: Additional Details
    frame: z.string().optional(),
    lens: z.string().optional(),
    notes: z.string().optional(),
    testDate: z.date(),
    bookingDate: z.date(),
    deliveryDate: z.date(),
  }),
];


const MeasurementInput = ({ form, name, title }) => (
    <div className="space-y-2 p-4 border rounded-lg bg-background/50">
        <h4 className="font-semibold text-primary">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <FormField control={form.control} name={`${name}.sph`} render={({ field }) => <FormItem><FormLabel>SPH</FormLabel><FormControl><Input type="number" step="0.25" placeholder="-1.25" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.cyl`} render={({ field }) => <FormItem><FormLabel>CYL</FormLabel><FormControl><Input type="number" step="0.25" placeholder="-0.75" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.axis`} render={({ field }) => <FormItem><FormLabel>AXIS</FormLabel><FormControl><Input type="number" placeholder="90" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.add`} render={({ field }) => <FormItem><FormLabel>ADD</FormLabel><FormControl><Input type="number" step="0.25" placeholder="2.00" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.vision`} render={({ field }) => <FormItem><FormLabel>Vision</FormLabel><FormControl><Input placeholder="6/6" {...field} /></FormControl></FormItem>} />
        </div>
    </div>
);

// Function to clean empty strings from optional numeric fields in measurements
const cleanMeasurement = (measurement) => {
    const cleaned = { ...measurement };
    for (const key in cleaned) {
        if (key !== 'sph' && (cleaned[key] === '' || cleaned[key] === null || isNaN(parseFloat(cleaned[key])))) {
            cleaned[key] = undefined;
        }
    }
    return cleaned;
};


export function PastUserForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(stepSchemas[currentStep]),
    defaultValues: {
      name: '', phone: '', email: '', address: '', age: '',
      dvRightEye: { sph: 0 }, dvLeftEye: { sph: 0 },
      nvRightEye: { sph: 0 }, nvLeftEye: { sph: 0 },
      imRightEye: { sph: 0 }, imLeftEye: { sph: 0 },
      frame: '', lens: '', notes: '',
      testDate: new Date(), bookingDate: new Date(), deliveryDate: new Date(),
    },
  });
  
  const totalSteps = stepSchemas.length;
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
        toast({variant: "destructive", title: "Validation Error", description: "Please fill all required fields correctly."});
        return;
    };

    setIsLoading(true);
    try {
        const fullData = form.getValues();
        const submissionData = {
            ...fullData,
            email: fullData.email === '' ? undefined : fullData.email,
            age: fullData.age ? parseInt(fullData.age, 10) : undefined,
            dvRightEye: cleanMeasurement(fullData.dvRightEye),
            dvLeftEye: cleanMeasurement(fullData.dvLeftEye),
            nvRightEye: cleanMeasurement(fullData.nvRightEye),
            nvLeftEye: cleanMeasurement(fullData.nvLeftEye),
            imRightEye: cleanMeasurement(fullData.imRightEye),
            imLeftEye: cleanMeasurement(fullData.imLeftEye),
            testDate: format(fullData.testDate, 'yyyy-MM-dd'),
            bookingDate: format(fullData.bookingDate, 'yyyy-MM-dd'),
            deliveryDate: format(fullData.deliveryDate, 'yyyy-MM-dd'),
        };
        
        await createPastUser(submissionData);
        toast({ title: "User Record Created", description: "The past user's record and eye test have been saved." });
        form.reset();
        setCurrentStep(0);

    } catch (error) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.response?.data?.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
      switch (currentStep) {
        case 0:
            return (
                <motion.div key="step0" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <h3 className="font-semibold mb-4 text-lg">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="age" render={({ field }) => <FormItem><FormLabel>Age (Optional)</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Address (Optional)</FormLabel><FormControl><Textarea placeholder="123 Main St..." {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                </motion.div>
            )
        case 1:
            return (
                 <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <h3 className="font-semibold mb-4 text-lg">Vision Measurements</h3>
                    <div className="space-y-4">
                        <MeasurementInput form={form} name="dvRightEye" title="Distance Vision (DV) - Right Eye" />
                        <MeasurementInput form={form} name="dvLeftEye" title="Distance Vision (DV) - Left Eye" />
                        <MeasurementInput form={form} name="nvRightEye" title="Near Vision (NV) - Right Eye" />
                        <MeasurementInput form={form} name="nvLeftEye" title="Near Vision (NV) - Left Eye" />
                        <MeasurementInput form={form} name="imRightEye" title="Intermediate Vision (IM) - Right Eye" />
                        <MeasurementInput form={form} name="imLeftEye" title="Intermediate Vision (IM) - Left Eye" />
                    </div>
                </motion.div>
            )
        case 2:
            return (
                 <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                   <h3 className="font-semibold mb-4 text-lg">Appointment & Order Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="frame" render={({ field }) => <FormItem><FormLabel>Frame Details</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                         <FormField control={form.control} name="lens" render={({ field }) => <FormItem><FormLabel>Lens Details</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                         <FormField control={form.control} name="notes" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                          
                          <FormField control={form.control} name="testDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Test Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="bookingDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Booking Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Delivery Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                          )} />
                    </div>
                 </motion.div>
            )
        default:
           return null;
      }
  }


  return (
    <div className="w-full">
      <Progress value={progress} className="mb-6" />
      <Form {...form}>
        <form className="space-y-8">
            <AnimatePresence mode="wait">
              {renderFormContent()}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8">
                <div>
                    {currentStep > 0 && (
                        <Button type="button" variant="ghost" onClick={handlePrev} disabled={isLoading}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    )}
                </div>

                <div>
                    {currentStep < totalSteps - 1 ? (
                        <Button type="button" onClick={handleNext} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : <>Next <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                    ) : (
                        <Button type="button" onClick={onSubmit} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : <>Submit Record <Send className="ml-2 h-4 w-4" /></>}</Button>
                    )}
                </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
