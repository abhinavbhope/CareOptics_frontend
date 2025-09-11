
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { createPastUser, updatePastUser } from '@/lib/admin/pastUserApi';
import { useEffect } from 'react';


const userSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    address: z.string().optional(),
    age: z.coerce.number().positive().optional(),
});


export function PastUserFormModal({ isOpen, onClose, onSuccess, existingUser = null }) {
    const { toast } = useToast();
    const form = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: { name: '', phone: '', email: '', address: '', age: '' },
    });
    
    useEffect(() => {
        if (existingUser) {
            form.reset({
                name: existingUser.name || '',
                phone: existingUser.phone || '',
                email: existingUser.email || '',
                address: existingUser.address || '',
                age: existingUser.age || '',
            });
        } else {
            form.reset({ name: '', phone: '', email: '', address: '', age: '' });
        }
    }, [existingUser, form]);


    const onSubmit = async (data) => {
        try {
            const submissionData = {
                ...data,
                email: data.email === '' ? undefined : data.email,
                age: data.age ? parseInt(data.age, 10) : undefined,
            };
            
            let response;
            if (existingUser) {
                response = await updatePastUser(existingUser.publicId, submissionData);
                 toast({ title: "User Updated", description: "The user's record has been saved." });
            } else {
                 response = await createPastUser(submissionData);
                 toast({ title: "User Created", description: "The new user record has been saved." });
            }
            onSuccess(response.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Submission Failed", description: error.response?.data?.message || "An unexpected error occurred." });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>{existingUser ? 'Edit Past User' : 'Create New Past User Record'}</DialogTitle>
                    <DialogDescription>{existingUser ? 'Update the details for this record.' : 'Fill in the form to create a new record.'}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="123-456-7890" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="age" render={({ field }) => <FormItem><FormLabel>Age (Optional)</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Address (Optional)</FormLabel><FormControl><Textarea placeholder="123 Main St..." {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {existingUser ? 'Save Changes' : 'Create Record'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
