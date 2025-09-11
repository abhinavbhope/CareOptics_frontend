
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/opticare/Header';
import { Footer } from '@/components/opticare/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { X, Plus, Minus, ShoppingCart, Info, Phone, User, MapPin, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthForm } from '@/components/opticare/AuthForm';
import { getCart, updateCartItem, removeFromCart } from '@/lib/cartApi';
import { requestCallback } from '@/lib/callbackApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const callbackSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  address: z.string().min(10, { message: "Please enter a complete address." }),
});

const CartPage = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
    const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [headerKey, setHeaderKey] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        setShowAuth(false);
        setHeaderKey(prevKey => prevKey + 1);
        fetchCart();
    };

    const fetchCart = async () => {
        setIsLoading(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                // If not logged in, show an empty cart instead of redirecting
                setCart(null); 
                setIsLoggedIn(false);
                setIsLoading(false);
                return;
            }
            setIsLoggedIn(true);
            const response = await getCart();
            setCart(response.data);
        } catch (error) {
            // Handle cases where token is invalid or expired
            if (error.response?.status === 401) {
                setCart(null);
                setIsLoggedIn(false);
            } else {
              console.error("Failed to fetch cart:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            await handleRemoveItem(productId);
            return;
        }

        try {
            const response = await updateCartItem(productId, newQuantity);
            setCart(response.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update item quantity." });
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const response = await removeFromCart(productId);
            setCart(response.data);
             toast({ title: "Item Removed", description: "The item has been removed from your cart." });
        } catch (error) {
             toast({ variant: "destructive", title: "Removal Failed", description: "Could not remove the item." });
        }
    };

    const totalPrice = cart?.totalPrice || 0;
    const cartItems = cart?.items || [];

    const form = useForm({
        resolver: zodResolver(callbackSchema),
        defaultValues: { name: "", phone: "", address: "" },
    });
    
    useEffect(() => {
        if (isCallbackModalOpen && isLoggedIn) {
            const userName = localStorage.getItem('userName') || '';
            form.setValue('name', userName);
        }
    }, [isCallbackModalOpen, isLoggedIn, form]);

    async function onCallbackSubmit(values) {
        setIsSubmittingCallback(true);
        try {
            await requestCallback(values);
            toast({
                title: "Callback Requested! ✅",
                description: "Our team will contact you shortly to confirm your order.",
            });
            setIsCallbackModalOpen(false);
            form.reset({ name: isLoggedIn ? localStorage.getItem('userName') || '' : '', phone: '', address: '' });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Callback Failed",
                description: "Could not submit your request. Please try again.",
            });
        } finally {
            setIsSubmittingCallback(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your cart...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh w-full flex-col bg-background text-foreground font-sans">
             <Header key={headerKey} onOpenAuth={() => setShowAuth(true)} />

            {showAuth && (
                <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={() => setShowAuth(false)}
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
                    <h1 className="text-4xl font-bold font-headline mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Your Shopping Cart
                    </h1>

                    <AnimatePresence>
                        {cartItems.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Cart Items */}
                                <motion.div className="lg:col-span-2 space-y-4" layout>
                                    <AnimatePresence>
                                    {cartItems.map(item => (
                                        <motion.div
                                            key={item.productId}
                                            layout
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                                            className="bg-card/50 border border-border/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 relative overflow-hidden"
                                        >
                                            <div className="absolute left-0 top-0 h-full w-1 bg-accent/50"></div>
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                width={100}
                                                height={100}
                                                className="rounded-md object-cover"
                                                data-ai-hint="eyewear product"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-bold">{item.productName}</h3>
                                                <p className="text-muted-foreground text-sm">₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                            </div>
                                            <p className="font-bold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(item.productId)}><X className="h-5 w-5" /></Button>
                                        </motion.div>
                                    ))}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Cart Summary */}
                                <motion.div className="lg:col-span-1" layout>
                                    <Card className="bg-card/50 border-border/20 backdrop-blur-sm sticky top-24">
                                        <CardHeader>
                                            <CardTitle className="text-2xl font-headline flex items-center gap-2"><ShoppingCart />Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex justify-between items-center text-lg">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span className="font-bold">FREE</span>
                                            </div>
                                            <div className="border-t border-border/20 my-4"></div>
                                            <div className="flex justify-between items-center text-2xl">
                                                <span className="font-bold">Total</span>
                                                <span className="font-bold text-accent">₹{totalPrice.toFixed(2)}</span>
                                            </div>
                                            
                                             <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border/10">
                                                <h4 className="font-bold flex items-center gap-2"><Phone className="text-accent" /> Pay on Delivery</h4>
                                                <p className="text-sm text-muted-foreground mt-2">Request a callback to finalize your order with our team.</p>
                                                <Button size="lg" className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setIsCallbackModalOpen(true)}>Request Callback</Button>
                                            </div>

                                            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border/10">
                                                <h4 className="font-bold flex items-center gap-2"><Info className="text-accent" />Online Payment</h4>
                                                <p className="text-sm text-muted-foreground mt-2">Online payment options are coming soon. Stay tuned!</p>
                                                <Button size="lg" className="w-full mt-4" disabled>Pay Now (Coming Soon)</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        ) : (
                             <motion.div 
                                key="empty-cart"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                             >
                                <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
                                <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
                                <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
                                <Button className="mt-6" asChild>
                                    <Link href="/products/allItems">Start Shopping</Link>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
            <Footer />

            <AnimatePresence>
                {isCallbackModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsCallbackModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20, transition: { ease: "easeOut" } }}
                            className="w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                             <Card className="bg-card/80 border-border/30">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-headline text-accent">Request a Callback</CardTitle>
                                    <p className="text-muted-foreground">Confirm your details and we'll call you to finalize the order.</p>
                                </CardHeader>
                                <CardContent>
                                     <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onCallbackSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2"><User className="h-4 w-4 text-accent" /> Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} disabled={isLoggedIn} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1 (555) 123-4567" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Shipping Address</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="123 Visionary Lane, Optic City, 12345" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="ghost" onClick={() => setIsCallbackModalOpen(false)}>Cancel</Button>
                                                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmittingCallback}>
                                                    {isSubmittingCallback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Submit Request
                                                </Button>
                                            </div>
                                        </form>
                                     </Form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CartPage;
