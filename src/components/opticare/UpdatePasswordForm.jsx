"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { sendOtp, verifyOtp, updatePassword } from '@/lib/api';
import { OtpInput } from '@/components/ui/otp-input';
import { motion, AnimatePresence } from 'framer-motion';

const otpSchema = z.object({
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
});

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});

export function UpdatePasswordForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [flowStep, setFlowStep] = useState('initial'); // initial, otp, password
    const [userEmail, setUserEmail] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const otpForm = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const passwordForm = useForm({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });
    
    const handleSendOtp = async () => {
        setIsLoading(true);
        const email = localStorage.getItem('userEmail');
        if (!email) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find user email.' });
            setIsLoading(false);
            return;
        }
        setUserEmail(email);
        try {
            await sendOtp({ email });
            toast({ title: 'OTP Sent', description: 'A verification code has been sent to your email.' });
            setFlowStep('otp');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to Send OTP', description: 'Could not send OTP. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (values) => {
        setIsLoading(true);
        try {
            await verifyOtp({ email: userEmail, otp: values.otp });
            toast({ title: 'OTP Verified', description: 'You can now update your password.' });
            setFlowStep('password');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Verification Failed', description: error.response?.data || 'Invalid or expired OTP.' });
        } finally {
            setIsLoading(false);
        }
    };

    async function handleUpdatePassword(values) {
        setIsLoading(true);
        try {
            await updatePassword({
                email: userEmail,
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            toast({ title: 'Password Updated!', description: 'Your password has been changed successfully.' });
            setFlowStep('initial');
            passwordForm.reset();
            otpForm.reset();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.response?.data || 'An error occurred.' });
        } finally {
            setIsLoading(false);
        }
    }

    const renderStep = () => {
        switch (flowStep) {
            case 'otp':
                return (
                    <motion.div key="otp" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                        <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code sent to <strong>{userEmail}</strong>.</p>
                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>One-Time Password</FormLabel>
                                            <FormControl>
                                                <OtpInput value={field.value} onChange={field.onChange} numInputs={6} isDisabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                     <Button type="button" variant="ghost" onClick={() => setFlowStep('initial')} disabled={isLoading}>Back</Button>
                                     <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Verify OTP
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </motion.div>
                );
            case 'password':
                 return (
                    <motion.div key="password" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                        <p className="text-sm text-muted-foreground mb-4">Create a new, strong password.</p>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4 max-w-sm">
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}><Eye className="h-4 w-4" /></Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}><Eye className="h-4 w-4" /></Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl><Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => setFlowStep('otp')} disabled={isLoading}>Back</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                                </div>
                            </form>
                        </Form>
                    </motion.div>
                );
            case 'initial':
            default:
                return (
                     <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="text-sm text-muted-foreground mb-4">
                            For security, you must verify your email before changing your password.
                        </p>
                        <Button onClick={handleSendOtp} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Verification Code
                        </Button>
                     </motion.div>
                );
        }
    };
    
    return (
        <div>
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </div>
    );
}
