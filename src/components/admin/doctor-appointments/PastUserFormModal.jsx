
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createPastUser, updatePastUser } from '@/lib/admin/doctorPastUserApi';
import { Textarea } from '@/components/ui/textarea';

const pastUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(1, "Please enter a valid age."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address is required."),
});

export function PastUserFormModal({ isOpen, onClose, onSuccess, user = null }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(pastUserSchema),
        defaultValues: {
            name: "",
            age: "",
            phone: "",
            address: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                age: user.age,
                phone: user.phone,
                address: user.address,
            });
        } else {
             form.reset({
                name: "",
                age: "",
                phone: "",
                address: "",
            });
        }
    }, [user, form]);

    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            let response;
            if (user) {
                response = await updatePastUser(user.id, values);
                toast({ title: "User Updated", description: "The user's record has been successfully updated." });
            } else {
                response = await createPastUser(values);
                toast({ title: "User Created", description: `New past user record created for ${values.name}.` });
            }
            onSuccess(response.data);
        } catch (error) {
    const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||   // 👈 add this
        error.response?.data || "";

    if (typeof errorMessage === "string" && errorMessage.includes("Past user with this phone number already exists")) {
        toast({
            variant: "destructive",
            title: "Duplicate Entry",
            description: "A patient with this phone number already exists.",
        });
    } else {
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: errorMessage || "An unexpected error occurred. Please check the details and try again.",
        });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit Past User' : 'Create New Past User Record'}</DialogTitle>
                    <DialogDescription>Enter the details for the walk-in patient.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                           <FormField control={form.control} name="age" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g. 45" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl><Textarea placeholder="123 Main St, Anytown..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {user ? 'Save Changes' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
