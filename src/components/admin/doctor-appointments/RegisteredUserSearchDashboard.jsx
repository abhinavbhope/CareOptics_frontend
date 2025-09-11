
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { searchRegisteredUsers, getAllRegisteredUsers } from '@/lib/admin/doctorAppointmentAdminApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserSearch, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export function RegisteredUserSearchDashboard() {
    const { toast } = useToast();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async (query) => {
        setIsLoading(true);
        try {
            let response;
            if (query) {
                response = await searchRegisteredUsers(query);
            } else {
                response = await getAllRegisteredUsers();
            }
            setUsers(response.data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching users', description: 'Could not retrieve the list of users.' });
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUsers(debouncedSearchQuery);
    }, [debouncedSearchQuery, fetchUsers]);

    const handleUserSelect = (user) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedRegisteredUserForDoctorAppointment', JSON.stringify(user));
            router.push('/admin/doctor-appointments/registered/details');
        }
    };


    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
            <CardHeader>
                <div className="relative">
                    <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Start typing a name or email to search..." 
                        className="pl-10" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] overflow-y-auto pr-2 -mr-2">
                    {isLoading ? (
                        <div className="space-y-4">
                           {[...Array(5)].map((_, i) => (
                               <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                 <Skeleton className="h-12 w-12 rounded-full" />
                                 <div className="space-y-2">
                                   <Skeleton className="h-4 w-[250px]" />
                                   <Skeleton className="h-4 w-[200px]" />
                                 </div>
                               </div>
                           ))}
                        </div>
                    ) : users.length > 0 ? (
                        <motion.div layout variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
                            {users.map(user => (
                                <motion.div key={user.id} layout variants={itemVariants}>
                                    <button
                                        onClick={() => handleUserSelect(user)}
                                        className="w-full text-left p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
                                                    <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No users found matching your search.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
