
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { OtpInput } from '@/components/ui/otp-input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { sendExternalOtp, verifyExternalOtp, registerAndTestExternal, createTestForUser, updateTestForUser } from '@/lib/eyetestApi';
import { Loader2, User, Mail, Phone, MapPin, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Send } from 'lucide-react';

const measurementSchema = z.object({
  sph: z.coerce.number().default(0),
  cyl: z.union([z.string(), z.number()]).optional(),
  axis: z.union([z.string(), z.number()]).optional(),
  add: z.union([z.string(), z.number()]).optional(),
  vision: z.string().optional(),
});

const stepSchemas = [
  z.object({ // Step 1: Personal Info
    email: z.string().email(),
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Phone number is required"),
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
    bookingDate: z.date(),
    deliveryDate: z.date(),
  }),
];

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits."),
});

const MeasurementInput = ({ form, name, title }) => (
    <div className="space-y-2 p-4 border rounded-lg bg-background/50">
        <h4 className="font-semibold text-primary">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <FormField control={form.control} name={`${name}.sph`} render={({ field }) => <FormItem><FormLabel>SPH</FormLabel><FormControl><Input type="number" step="0.25" placeholder="e.g., -1.25" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.cyl`} render={({ field }) => <FormItem><FormLabel>CYL</FormLabel><FormControl><Input type="number" step="0.25" placeholder="e.g., -0.75" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.axis`} render={({ field }) => <FormItem><FormLabel>AXIS</FormLabel><FormControl><Input type="number" placeholder="e.g., 90" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.add`} render={({ field }) => <FormItem><FormLabel>ADD</FormLabel><FormControl><Input type="number" step="0.25" placeholder="e.g., 2.00" {...field} /></FormControl></FormItem>} />
            <FormField control={form.control} name={`${name}.vision`} render={({ field }) => <FormItem><FormLabel>Vision</FormLabel><FormControl><Input placeholder="e.g., 6/6" {...field} /></FormControl></FormItem>} />
        </div>
    </div>
);

const defaultMeasurement = { sph: 0, cyl: '', axis: '', add: '', vision: '' };

const defaultFormValues = {
    email: '', name: '', phone: '', address: '', age: '',
    dvRightEye: { ...defaultMeasurement },
    dvLeftEye: { ...defaultMeasurement },
    nvRightEye: { ...defaultMeasurement },
    nvLeftEye: { ...defaultMeasurement },
    imRightEye: { ...defaultMeasurement },
    imLeftEye: { ...defaultMeasurement },
    frame: '', lens: '', notes: '',
    bookingDate: new Date(), deliveryDate: new Date(),
};

const getSafeMeasurement = (measurement) => ({
    ...defaultMeasurement,
    ...measurement,
    sph: measurement?.sph ?? 0,
});

const cleanMeasurement = (measurement) => {
  const cleaned = { ...measurement };
  cleaned.sph = measurement?.sph ?? 0;
  cleaned.cyl = cleaned.cyl === '' ? 0 : parseFloat(cleaned.cyl) || undefined;
  cleaned.axis = cleaned.axis === '' ? 0 : parseInt(cleaned.axis, 10) || undefined;
  cleaned.add  = cleaned.add  === '' ? 0 : parseFloat(cleaned.add)  || undefined;
  return cleaned;
};



export function ExternalUserEyeTestForm({ existingUser = null, existingTest = null, onSuccess, onCancel }) {
  
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(!!existingUser || !!existingTest);
  const [flow, setFlow] = useState('form');
   // 'form' or 'otp'

  const form = useForm({
    resolver: zodResolver(stepSchemas[currentStep]),
    defaultValues: useMemo(() => defaultFormValues, []),
  });

  useEffect(() => {
    let valuesToSet = { ...defaultFormValues };

    if (existingUser) {
        valuesToSet = {
            ...valuesToSet,
            name: existingUser.name ?? '',
            email: existingUser.email ?? '',
            phone: existingUser.phone ?? '',
            age: existingUser.age ?? '',
            address: existingUser.address ?? '',
        };
    }

    if (existingTest) {
        valuesToSet = {
            ...valuesToSet,
            email: existingTest.email ?? valuesToSet.email,
            name: existingTest.name ?? valuesToSet.name,
            phone: existingTest.phone ?? valuesToSet.phone,
            address: existingTest.address ?? valuesToSet.address,
            age: existingTest.age ?? valuesToSet.age,  // ✅ fix
            bookingDate: new Date(existingTest.bookingDate),
            deliveryDate: new Date(existingTest.deliveryDate),
            frame: existingTest.frame ?? '',
            lens: existingTest.lens ?? '',
            notes: existingTest.notes ?? '',
            dvRightEye: getSafeMeasurement(existingTest.dvRightEye),
            dvLeftEye: getSafeMeasurement(existingTest.dvLeftEye),
            nvRightEye: getSafeMeasurement(existingTest.nvRightEye),
            nvLeftEye: getSafeMeasurement(existingTest.nvLeftEye),
            imRightEye: getSafeMeasurement(existingTest.imRightEye),
            imLeftEye: getSafeMeasurement(existingTest.imLeftEye),
        };
    }

    form.reset(valuesToSet);
}, [existingTest, existingUser, form]);



  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });
  
  const totalSteps = stepSchemas.length;
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      if (currentStep === 0 && !isOtpVerified) {
        setIsLoading(true);
        try {
          await sendExternalOtp(form.getValues('email'));
          toast({ title: "OTP Sent", description: "A verification code has been sent to the email address." });
          setFlow('otp');
        } catch (error) {
          toast({ variant: "destructive", title: "Failed to send OTP", description: error.response?.data?.message || "Please try again." });
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (flow === 'otp') {
        setFlow('form');
    } else {
        setCurrentStep(prev => prev - 1)
    }
  };

  const handleOtpSubmit = async (data) => {
    setIsLoading(true);
    try {
      await verifyExternalOtp(form.getValues('email'), data.otp);
      toast({ title: "OTP Verified", description: "Email has been successfully verified." });
      setIsOtpVerified(true);
      setFlow('form');
      setCurrentStep(1); // Move to next step of main form
    } catch (error) {
      toast({ variant: "destructive", title: "Verification Failed", description: error.response?.data?.message || "Invalid or expired OTP." });
    } finally {
      setIsLoading(false);
    }
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
            dvRightEye: cleanMeasurement(fullData.dvRightEye),
            dvLeftEye: cleanMeasurement(fullData.dvLeftEye),
            nvRightEye: cleanMeasurement(fullData.nvRightEye),
            nvLeftEye: cleanMeasurement(fullData.nvLeftEye),
            imRightEye: cleanMeasurement(fullData.imRightEye),
            imLeftEye: cleanMeasurement(fullData.imLeftEye),
            bookingDate: format(fullData.bookingDate, 'yyyy-MM-dd'),
            deliveryDate: format(fullData.deliveryDate, 'yyyy-MM-dd'),
            age: fullData.age ? parseInt(fullData.age, 10) : undefined,
        };
        
        let response;
        if (existingTest) {
            response = await updateTestForUser(existingTest.email, existingTest.testId, submissionData);
            toast({ title: "Test Updated", description: "The eye test record has been successfully updated." });
            onSuccess(response);
        } else if (existingUser) {
            response = await createTestForUser(existingUser.email, submissionData);
             toast({ title: "Test Created", description: `New eye test added for ${existingUser.email}.` });
             onSuccess(response);
        } else {
            response = await registerAndTestExternal(submissionData);
            toast({ title: "Registration & Test Submitted", description: "Thank you! We've received your information." });
            onSuccess(response);
        }

    } catch (error) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.response?.data?.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
      if (flow === 'otp') {
          return (
             <motion.div key="step_otp" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <h3 className="font-semibold mb-4">Email Verification</h3>
                <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code sent to <strong>{form.getValues('email')}</strong>.</p>
                <FormProvider {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                        <FormField control={otpForm.control} name="otp" render={({ field }) => (
                            <FormItem>
                                <FormLabel>One-Time Password</FormLabel>
                                <FormControl>
                                    <OtpInput value={field.value} onChange={field.onChange} numInputs={6} isDisabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="animate-spin mr-2" />} Verify OTP</Button>
                    </form>
                </FormProvider>
            </motion.div>
          )
      }
      switch (currentStep) {
        case 0:
            return (
                <motion.div key="step0" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={!!existingUser?.name} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled={!!existingUser?.email} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="age" render={({ field }) => <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                </motion.div>
            )
        case 1:
            return (
                 <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <h3 className="font-semibold mb-4">Vision Measurements</h3>
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
                   <h3 className="font-semibold mb-4">Appointment & Order Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField control={form.control} name="frame" render={({ field }) => <FormItem><FormLabel>Frame Details</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                         <FormField control={form.control} name="lens" render={({ field }) => <FormItem><FormLabel>Lens Details</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                         <FormField control={form.control} name="notes" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
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
      <Progress value={progress} className="mb-4" />
        <FormProvider {...form}>
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {renderFormContent()}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8">
                <div>
                    {(currentStep > 0 || flow === 'otp') && (
                        <Button type="button" variant="ghost" onClick={handlePrev} disabled={isLoading}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    )}
                     <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                </div>

                <div>
                    {flow === 'form' && currentStep < totalSteps - 1 && (
                        <Button type="button" onClick={handleNext} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : <>Next <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                    )}
                    {flow === 'form' && currentStep === totalSteps - 1 && (
                        <Button type="button" onClick={onSubmit} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : <>{existingTest ? 'Update Test' : 'Submit Test'} <Send className="ml-2 h-4 w-4" /></>}</Button>
                    )}
                </div>
            </div>
          </div>
        </FormProvider>
    </div>
  );
}
