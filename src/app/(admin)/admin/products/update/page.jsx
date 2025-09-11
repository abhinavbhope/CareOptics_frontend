
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { getAllProducts, updateProduct, deleteProduct } from '@/lib/admin/productApi';
import { Edit, Trash2, Search, Package, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

const FADE_UP_ANIMATION = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const productUpdateSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  category: z.string().min(1, "Please select a category."),
  specstype: z.string().min(1, "Please select a specs type."),
  gender: z.string().min(1, "Please select a gender."),
  stock: z.coerce.number().min(0, "Stock must be a positive number."),
  tags: z.string().optional(),
});

function UpdateProductModal({ product, isOpen, onClose, onProductUpdate }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm({
        resolver: zodResolver(productUpdateSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            category: product?.category || "",
            specstype: product?.specstype || "",
            gender: product?.gender || "",
            stock: product?.stock || 0,
            tags: Array.isArray(product?.tags) ? product.tags.join(', ') : "",
        }
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                specstype: product.specstype,
                gender: product.gender,
                stock: product.stock,
                tags: Array.isArray(product.tags) ? product.tags.join(', ') : "",
            });
        }
    }, [product, form]);

    async function onSubmit(values) {
        if (!product) return;
        setIsSubmitting(true);
        try {
            const updateData = {
                ...values,
                tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
                averageRating: product.averageRating || 0, // Add default value
                reviewIds: product.reviewIds || [], // Add default value
            };
            const updatedProduct = await updateProduct(product.id, updateData);
            onProductUpdate(updatedProduct.data);
            toast({ title: "Product Updated!", description: `${values.name} has been successfully updated.` });
            onClose();
        } catch (error) {
             toast({ variant: "destructive", title: "Update Failed", description: error.response?.data?.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Product: {product?.name}</DialogTitle>
                    <DialogDescription>Make changes to the product details below.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Product Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="stock" render={({ field }) => (
                            <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Classic', 'Fashion', 'Sport', 'Vintage', 'Minimalist'].map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="specstype" render={({ field }) => (
                            <FormItem><FormLabel>Specs Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Eyeglasses', 'Sunglasses'].map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Men', 'Women', 'Unisex'].map(g => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="tags" render={({ field }) => (
                            <FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="stylish, lightweight" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter className="col-span-2 mt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminUpdateProductPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const productsPerPage = 8;

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllProducts();
            setProducts(response.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load products", description: "Could not fetch product data." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }, [products, debouncedSearchTerm]);

    const paginatedProducts = useMemo(() => {
        const start = currentPage * productsPerPage;
        const end = start + productsPerPage;
        return filteredProducts.slice(start, end);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handleUpdateClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleProductUpdate = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteProduct(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast({ title: "Product Deleted", description: "The product has been successfully removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the product." });
        }
    };
    
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
                    Manage Products
                </h2>
            </motion.div>

            <motion.div variants={FADE_UP_ANIMATION}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                           <div>
                            <CardTitle>Product List</CardTitle>
                            <CardDescription>Update, edit, or delete products from your inventory.</CardDescription>
                           </div>
                           <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search by name..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : paginatedProducts.length > 0 ? (
                                    paginatedProducts.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="rounded-md object-cover" />
                                                    <span className="font-medium">{p.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                                            <TableCell>{p.stock}</TableCell>
                                            <TableCell>₹{p.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => handleUpdateClick(p)}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteProduct(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No products found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                         {totalPages > 1 && (
                            <div className="flex justify-end items-center mt-6 gap-2">
                                <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                <span className="text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
                                <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
            
            <AnimatePresence>
            {isModalOpen && (
                <UpdateProductModal 
                    product={selectedProduct} 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onProductUpdate={handleProductUpdate}
                />
            )}
            </AnimatePresence>

        </motion.div>
    );
}



    