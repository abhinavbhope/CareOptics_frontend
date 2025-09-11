
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { getAllUsers } from '@/lib/userApi';
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

export function EyeTestAdminDashboard() {
    const { toast } = useToast();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllUsers();
            setAllUsers(response.data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching users', description: 'Could not retrieve the list of users.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const filteredUsers = useMemo(() => {
        if (!debouncedSearchQuery) {
            return allUsers; 
        }
        return allUsers.filter(user =>
            user.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
    }, [debouncedSearchQuery, allUsers]);

    const handleUserSelect = (user) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedUserForEyeTest', JSON.stringify(user));
            router.push('/admin/eyetest/details');
        }
    };


    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/20">
            <CardHeader>
                <div className="relative">
                    <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Start typing a name or email to filter..." 
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
                    ) : filteredUsers.length > 0 ? (
                        <motion.div layout variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
                            {filteredUsers.map(user => (
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
                                                <p className="text-sm text-muted-foreground">Age: {user.age ?? "N/A"}</p>
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
