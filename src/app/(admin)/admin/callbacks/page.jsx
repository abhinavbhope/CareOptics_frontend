
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { getCallbacks, getCallbackStats, markCallbackAsCompleted, deleteCallback } from '@/lib/admin/callbackApi';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PhoneCall, Search, Trash2, CheckCircle, Clock, DollarSign, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const FADE_UP_ANIMATION = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const PIE_COLORS = {
    Completed: '#22c55e', // green-500
    Pending: '#f97316'    // orange-500
};

const CallbackStatsChart = ({ stats, isLoading }) => {
    if (isLoading) return <Skeleton className="h-[250px] w-full" />;

    const data = [
        { name: 'Pending', value: stats?.pending || 0 },
        { name: 'Completed', value: stats?.completed || 0 },
    ];
    
    if (!stats || stats.total === 0) {
        return (
            <div className="h-[250px] w-full flex flex-col items-center justify-center text-muted-foreground">
                <PhoneCall className="h-16 w-16 opacity-30" />
                <p className="mt-4">No callback data available.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        if (percent === 0) return null;
                        return (
                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-sans font-bold text-sm">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name]} stroke={PIE_COLORS[entry.name]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                 <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
};


export default function CallbackRequestsPage() {
    const { toast } = useToast();
    const [callbacks, setCallbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [callbacksRes, statsRes] = await Promise.all([
                getCallbacks(),
                getCallbackStats()
            ]);
            setCallbacks(callbacksRes.data);
            setStats(statsRes.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to load data", description: "Could not fetch callback requests." });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkAsCompleted = async (id) => {
        try {
            const response = await markCallbackAsCompleted(id);
            setCallbacks(prev => prev.map(cb => cb.id === id ? response.data : cb));
            setStats(prev => ({
                ...prev,
                completed: prev.completed + 1,
                pending: prev.pending - 1
            }));
            toast({ title: "Callback Completed", description: "The request has been marked as complete." });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not mark as completed." });
        }
    };

    const handleDelete = async (id) => {
        const callbackToDelete = callbacks.find(cb => cb.id === id);
        try {
            await deleteCallback(id);
            setCallbacks(prev => prev.filter(cb => cb.id !== id));
            setStats(prev => ({
                ...prev,
                total: prev.total - 1,
                completed: callbackToDelete.completed ? prev.completed - 1 : prev.completed,
                pending: !callbackToDelete.completed ? prev.pending - 1 : prev.pending
            }));
            toast({ title: "Callback Deleted", description: "The request has been removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the request." });
        }
    };

    const filteredCallbacks = useMemo(() => {
        return callbacks
            .filter(cb => {
                if (filterStatus === 'all') return true;
                return filterStatus === 'completed' ? cb.completed : !cb.completed;
            })
            .filter(cb => {
                const searchLower = debouncedSearchTerm.toLowerCase();
                return cb.name.toLowerCase().includes(searchLower) || cb.phone.includes(searchLower);
            });
    }, [callbacks, filterStatus, debouncedSearchTerm]);


    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_UP_ANIMATION} className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <PhoneCall className="h-8 w-8" />
                    Callback Requests
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Callback List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card/50 border-border/20 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>All Requests</CardTitle>
                                    <CardDescription>Manage and view all user callback requests.</CardDescription>
                                </div>
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name or phone..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {filteredCallbacks.length > 0 ? filteredCallbacks.map(cb => (
                                        <motion.div
                                            key={cb.id}
                                            layout
                                            initial={{ opacity: 0, y: 20, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -20, height: 0 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="mb-4"
                                        >
                                            <Card className="bg-secondary/30 hover:border-primary/40 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold flex items-center gap-2"><User className="text-primary"/>{cb.name}</p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2"><PhoneCall className="text-primary/80"/>{cb.phone}</p>
                                                            <p className="text-sm text-muted-foreground flex items-start gap-2"><MapPin className="text-primary/80 mt-1"/>{cb.address}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg text-primary">₹{cb.totalPrice.toFixed(2)}</p>
                                                            <p className="text-xs text-muted-foreground">{format(new Date(cb.requestedAt), 'PPP p')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-border/20">
                                                        <h4 className="text-sm font-semibold mb-2">Items:</h4>
                                                        <div className="space-y-2">
                                                            {cb.items.map(item => (
                                                                <div key={item.productId} className="flex items-center gap-3 text-xs">
                                                                    <Image src={item.imageUrl} alt={item.productName} width={32} height={32} className="rounded" />
                                                                    <p className="flex-1">{item.productName} (x{item.quantity})</p>
                                                                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex justify-between items-center">
                                                         <Badge variant={cb.completed ? 'default' : 'secondary'} className={`${cb.completed ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                            {cb.completed ? <CheckCircle className="h-3 w-3 mr-1"/> : <Clock className="h-3 w-3 mr-1"/>}
                                                            {cb.completed ? 'Completed' : 'Pending'}
                                                        </Badge>
                                                        <div className="flex gap-2">
                                                            {!cb.completed && (
                                                                <Button size="sm" onClick={() => handleMarkAsCompleted(cb.id)}>Mark as Completed</Button>
                                                            )}
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/> </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this callback request.</AlertDialogDescription></AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(cb.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )) : (
                                         <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center text-muted-foreground py-12">
                                            <p>No matching callback requests found.</p>
                                         </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Right Panel: Stats */}
                <div className="lg:col-span-1">
                     <Card className="bg-card/50 border-border/20 backdrop-blur-sm sticky top-24">
                        <CardHeader>
                            <CardTitle>Request Stats</CardTitle>
                            <CardDescription>Overview of completed vs. pending requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <CallbackStatsChart stats={stats} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
