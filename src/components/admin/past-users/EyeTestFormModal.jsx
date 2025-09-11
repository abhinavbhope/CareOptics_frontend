"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { addEyeTestForPastUser, updateEyeTestForPastUser } from '@/lib/admin/pastUserApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Send } from 'lucide-react';

const measurementSchema = z.object({
  sph: z.coerce.number(),
  cyl: z.coerce.number().optional(),
  axis: z.coerce.number().optional(),
  add: z.coerce.number().optional(),
  vision: z.string().optional(),
}).default({ sph: 0 });

const stepSchemas = [
  z.object({ // Step 1: Vision Measurements
    dvRightEye: measurementSchema,
    dvLeftEye: measurementSchema,
    nvRightEye: measurementSchema,
    nvLeftEye: measurementSchema,
  }),
  z.object({ // Step 2: More Vision Measurements
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

const cleanMeasurement = (measurement) => {
    const cleaned = { ...measurement };
    for (const key in cleaned) {
        if (key !== 'sph' && (cleaned[key] === '' || cleaned[key] === null || isNaN(parseFloat(cleaned[key])))) {
            cleaned[key] = undefined;
        }
    }
    return cleaned;
};

const sanitizeData = (data) => {
    const sanitized = { ...data };
    for (const key in sanitized) {
        if (sanitized[key] === null) {
            sanitized[key] = '';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key]) && !(sanitized[key] instanceof Date)) {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }
    return sanitized;
}

export function EyeTestFormModal({ isOpen, onClose, onAddSuccess, onEditSuccess, existingTest, publicId }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const makeEmptyMeasurement = () => ({
    sph: 0,
    cyl: '',
    axis: '',
    add: '',
    vision: '',
  });
  const defaultValues = {
    dvRightEye: makeEmptyMeasurement(),
    dvLeftEye:  makeEmptyMeasurement(),
    nvRightEye: makeEmptyMeasurement(),
    nvLeftEye:  makeEmptyMeasurement(),
    imRightEye: makeEmptyMeasurement(),
    imLeftEye:  makeEmptyMeasurement(),

    frame: '',
    lens: '',
    notes: '',
    testDate: new Date(),
    bookingDate: new Date(),
    deliveryDate: new Date(),
  };
  
  const form = useForm({
    resolver: zodResolver(stepSchemas[currentStep]),
    defaultValues: {
      dvRightEye: { sph: 0 }, dvLeftEye: { sph: 0 },
      nvRightEye: { sph: 0 }, nvLeftEye: { sph: 0 },
      imRightEye: { sph: 0 }, imLeftEye: { sph: 0 },
      frame: '', lens: '', notes: '',
      testDate: new Date(), bookingDate: new Date(), deliveryDate: new Date(),
    },
  });
  

  useEffect(() => {
    if (existingTest) {
        form.reset({
            ...sanitizeData(existingTest),
            testDate: new Date(existingTest.testDate),
            bookingDate: new Date(existingTest.bookingDate),
            deliveryDate: new Date(existingTest.deliveryDate),
        });
    } else {
        form.reset({
            dvRightEye: { sph: 0 }, dvLeftEye: { sph: 0 },
            nvRightEye: { sph: 0 }, nvLeftEye: { sph: 0 },
            imRightEye: { sph: 0 }, imLeftEye: { sph: 0 },
            frame: '', lens: '', notes: '',
            testDate: new Date(), bookingDate: new Date(), deliveryDate: new Date(),
        });
    }
}, [existingTest, form]);

  const totalSteps = stepSchemas.length;
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) setCurrentStep(prev => prev + 1);
  };
  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
        const fullData = form.getValues();
        const submissionData = {
            ...fullData,
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
        
        let response;
        if (existingTest) {
            response = await updateEyeTestForPastUser(existingTest.testId, submissionData);
            onEditSuccess(response.data);
            toast({ title: "Test Updated", description: "The eye test has been saved." });
        } else {
            response = await addEyeTestForPastUser(publicId, submissionData);
            onAddSuccess(response.data);
            toast({ title: "Test Added", description: "The new eye test has been saved." });
        }
    } catch (error) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.response?.data?.message || "An error occurred." });
    }
  };

  const renderFormContent = () => {
      switch (currentStep) {
        case 0:
            return (
                <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <div className="space-y-4">
                        <MeasurementInput form={form} name="dvRightEye" title="Distance Vision (DV) - Right Eye" />
                        <MeasurementInput form={form} name="dvLeftEye" title="Distance Vision (DV) - Left Eye" />
                        <MeasurementInput form={form} name="nvRightEye" title="Near Vision (NV) - Right Eye" />
                        <MeasurementInput form={form} name="nvLeftEye" title="Near Vision (NV) - Left Eye" />
                    </div>
                </motion.div>
            )
        case 1:
            return (
                 <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                     <div className="space-y-4">
                        <MeasurementInput form={form} name="imRightEye" title="Intermediate Vision (IM) - Right Eye" />
                        <MeasurementInput form={form} name="imLeftEye" title="Intermediate Vision (IM) - Left Eye" />
                    </div>
                 </motion.div>
            )
        case 2:
            return (
                 <motion.div key="step3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>{existingTest ? 'Edit Eye Test' : 'Add New Eye Test'}</DialogTitle>
                <DialogDescription>
                    {existingTest ? `Editing test dated ${format(new Date(existingTest.testDate), "PPP")}` : 'Enter details for the new eye test.'}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Progress value={progress} className="mb-6" />
                <Form {...form}>
                    <form className="space-y-8">
                        <div className="min-h-[350px]">
                            <AnimatePresence mode="wait">
                                {renderFormContent()}
                            </AnimatePresence>
                        </div>
                        <div className="flex justify-between items-center mt-8">
                            <div>
                                {currentStep > 0 && <Button type="button" variant="ghost" onClick={handlePrev} disabled={form.formState.isSubmitting}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>}
                                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            </div>
                            <div>
                                {currentStep < totalSteps - 1 ? (
                                    <Button type="button" onClick={handleNext} disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="animate-spin"/> : <>Next <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                                ) : (
                                    <Button type="button" onClick={onSubmit} disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="animate-spin"/> : <>{existingTest ? 'Save Changes' : 'Submit Test'} <Send className="ml-2 h-4 w-4" /></>}</Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </DialogContent>
    </Dialog>
  );
}
