"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, ShoppingCart, Calendar, Star, Loader2, Info } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useEffect, useState, useCallback } from 'react';
import { getUserDetails } from '@/lib/userApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const StaticStarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
        ))}
    </div>
);

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

export function UserDetailModal({ user, isOpen, onClose }) {
    const { toast } = useToast();
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const response = await getUserDetails(user.id);
            setDetails(response.data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to load details',
                description: 'Could not fetch user details. Please try again.',
            });
            onClose(); // Close modal on error
        } finally {
            setIsLoading(false);
        }
    }, [user, toast, onClose]);

    useEffect(() => {
        if (isOpen) {
            fetchDetails();
        }
    }, [isOpen, fetchDetails]);

    if (!user) return null;

    const { user: userData, cart, appointments, reviews } = details || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogContent
                        className="max-w-3xl p-0"
                        onInteractOutside={onClose}
                    >
                         <DialogHeader className="sr-only">
                            <DialogTitle>User Details for {user.name}</DialogTitle>
                            <DialogDescription>View user information, cart, appointments, and reviews.</DialogDescription>
                         </DialogHeader>
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="grid grid-cols-1 md:grid-cols-3"
                        >
                            {/* Left Panel */}
                            <div className="col-span-1 bg-card/80 p-6 flex flex-col items-center text-center border-r border-border/20">
                                <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
                                    <AvatarFallback>{user.name ? user.name.charAt(0) : user.email.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold">{user.name || "N/A"}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="mt-4">{user.role}</Badge>
                                <div className="text-xs text-muted-foreground mt-6 text-left space-y-2 w-full">
                                    <p><strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                                    <p><strong>Status:</strong> <span className="text-green-400">Active</span></p>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-6">Deactivate User</Button>
                            </div>

                            {/* Right Panel */}
                            <div className="col-span-2 p-6">
                                <Tabs defaultValue="cart">
                                    <TabsList className="grid w-full grid-cols-4 mb-4">
                                        <TabsTrigger value="profile"><User className="h-4 w-4" /></TabsTrigger>
                                        <TabsTrigger value="cart"><ShoppingCart className="h-4 w-4" /></TabsTrigger>
                                        <TabsTrigger value="appointments"><Calendar className="h-4 w-4" /></TabsTrigger>
                                        <TabsTrigger value="reviews"><Star className="h-4 w-4" /></TabsTrigger>
                                    </TabsList>
                                    
                                    <div className="h-[400px] overflow-y-auto pr-2">
                                        {isLoading ? (
                                                <div className="space-y-4 pt-4">
                                                <Skeleton className="h-16 w-full" />
                                                <Skeleton className="h-16 w-full" />
                                                <Skeleton className="h-16 w-full" />
                                                </div>
                                        ) : (
                                            <>
                                                <TabsContent value="profile">
                                                    <h3 className="font-bold text-lg mb-4">User Information</h3>
                                                    <div className="space-y-3 text-sm">
                                                        <p><strong>Full Name:</strong> {userData?.name || 'N/A'}</p>
                                                        <p><strong>Email:</strong> {userData?.email}</p>
                                                        <p><strong>Phone:</strong> {userData?.phone || 'Not provided'}</p>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="cart">
                                                    <h3 className="font-bold text-lg mb-4">Cart Summary ({cart?.items?.length || 0} items)</h3>
                                                    {cart && cart.items.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {cart.items.map(item => (
                                                                <Card key={item.productId} className="bg-secondary/50 flex items-center p-3 gap-3">
                                                                    <Image
                                                                    src={item.imageUrl.trimEnd()}
                                                                    alt={item.productName}
                                                                    width={50}
                                                                    height={50}
                                                                    className="rounded"
                                                                    data-ai-hint="eyewear product"
                                                                    />

                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-sm">{item.productName}</p>
                                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="font-bold text-sm">₹{item.price.toFixed(2)}</p>
                                                                </Card>
                                                            ))}
                                                            <div className="font-bold text-right mt-4">Total: ₹{cart.totalPrice.toFixed(2)}</div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-center py-8">
                                                            {cart ? "User's cart is empty." : "No cart items selected by the user."}
                                                        </p>
                                                    )}
                                                </TabsContent>
                                                <TabsContent value="appointments">
                                                    <h3 className="font-bold text-lg mb-4">Appointments ({appointments?.length || 0})</h3>
                                                    {appointments && appointments.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {appointments.map(app => (
                                                                <Card key={app.id} className="p-3 bg-secondary/50">
                                                                    <div className="flex justify-between items-center">
                                                                        <p className="font-semibold text-sm">{format(new Date(app.preferredDate), "PPP")} @ {app.preferredTime}</p>
                                                                        <Badge variant="secondary">{app.status}</Badge>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {Array.isArray(app.eyeProblems) ? app.eyeProblems.join(', ') : ''}
                                                                        {app.customProblem ? `${app.eyeProblems?.length > 0 ? ' - ' : ''}${app.customProblem}` : ''}
                                                                    </p>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-center py-8">No appointments found.</p>
                                                    )}
                                                </TabsContent>
                                                <TabsContent value="reviews">
                                                    <h3 className="font-bold text-lg mb-4">Reviews ({reviews?.length || 0})</h3>
                                                        {reviews && reviews.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {reviews.map(review => (
                                                                <Card key={review.id} className="p-3 bg-secondary/50">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <p className="font-semibold text-sm">{review.productName}</p>
                                                                        <StaticStarRating rating={review.rating} />
                                                                    </div>
                                                                    <p className="text-xs italic text-muted-foreground">"{review.comment}"</p>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                        ) : (
                                                        <p className="text-muted-foreground text-center py-8">No reviews found.</p>
                                                        )}
                                                </TabsContent>
                                            </>
                                        )}
                                    </div>
                                </Tabs>
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
