
"use client";

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Package, UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { addProduct } from '@/lib/admin/productApi';

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  category: z.string().min(1, "Please select a category."),
  specstype: z.string().min(1, "Please select a specs type."),
  gender: z.string().min(1, "Please select a gender."),
  stock: z.coerce.number().min(0, "Stock must be a positive number."),
  tags: z.string().optional(),
  image: z.any().refine(file => file, "Product image is required."),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
});

const FADE_UP_ANIMATION = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AdminProductUploadPage() {
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState(null);

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            category: "",
            specstype: "",
            gender: "",
            stock: 0,
            tags: "",
            image: null,
            isPublic: true,
            isFeatured: false,
            isOnSale: false,
            isNewArrival: true,
        },
    });

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            form.setValue('image', file, { shouldValidate: true });
            setImagePreview(URL.createObjectURL(file));
        }
    }, [form]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
        maxFiles: 1,
    });

    const removeImage = () => {
        form.setValue('image', null, { shouldValidate: true });
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    async function onSubmit(values) {
        const { image, ...productData } = values;
        
        // Remove UI-only fields before sending to backend
        delete productData.isPublic;
        delete productData.isFeatured;
        delete productData.isOnSale;
        delete productData.isNewArrival;

        // Convert tags from a comma-separated string to an array
        if (productData.tags) {
            productData.tags = productData.tags.split(',').map(tag => tag.trim());
        } else {
            productData.tags = [];
        }


        try {
            await addProduct(productData, image);
            toast({
                title: "Product Created!",
                description: `${values.name} has been successfully added to your store.`,
            });
            form.reset();
            removeImage();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.response?.data?.message || "An unexpected error occurred.",
            });
        }
    }

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_UP_ANIMATION} className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Package className="h-8 w-8" />
                    Create New Product
                </h2>
            </motion.div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image Upload & Details */}
                    <motion.div variants={FADE_UP_ANIMATION} className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Media</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={() => (
                                        <FormItem>
                                            <div
                                                {...getRootProps()}
                                                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50'}`}
                                            >
                                                <input {...getInputProps()} />
                                                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                                                <p className="mt-4 text-center text-muted-foreground">
                                                    {isDragActive ? 'Drop the file here...' : "Drag 'n' drop an image here, or click to select"}
                                                </p>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {imagePreview && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-4 relative w-40 h-40"
                                    >
                                        <Image src={imagePreview} alt="Preview" layout="fill" className="rounded-md object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Product Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Classic Wayfarer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe the product's features, materials, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                  <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. stylish, lightweight, polarized" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column: Pricing, Category, etc. */}
                    <motion.div variants={FADE_UP_ANIMATION} className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock Quantity</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 100" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {['Classic', 'Fashion', 'Sport', 'Vintage', 'Minimalist'].map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="specstype"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specs Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {['Eyeglasses', 'Sunglasses','Lenses'].map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {['Men', 'Women', 'Unisex'].map(g => (
                                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Product Status</CardTitle>
                                <CardDescription>These fields are for UI purposes and not sent to the backend.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="isPublic"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Visibility</FormLabel>
                                            <FormDescription>
                                            Make this product public to customers.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2 pt-2">
                                     <FormField control={form.control} name="isFeatured" render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">Featured Product</FormLabel>
                                        </FormItem>
                                     )}/>
                                      <FormField control={form.control} name="isOnSale" render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">On Sale</FormLabel>
                                        </FormItem>
                                     )}/>
                                      <FormField control={form.control} name="isNewArrival" render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">New Arrival</FormLabel>
                                        </FormItem>
                                     )}/>
                                </div>
                             </CardContent>
                        </Card>
                         <motion.div variants={FADE_UP_ANIMATION} className="flex justify-end">
                            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {form.formState.isSubmitting ? 'Creating...' : 'Create Product'}
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
            </Form>
        </motion.div>
    );
}

    
