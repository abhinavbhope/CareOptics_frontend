
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { getAllPastUsers, searchUsersByName, searchUserByPhone } from '@/lib/admin/pastUserApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UserSearch, ChevronRight, History, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { PastUserFormModal } from '@/components/admin/past-users/PastUserFormModal';


const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};


export default function PastUserManagementPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const fetchAndSetUsers = useCallback(async (fetcher) => {
        setIsLoading(true);
        try {
            const response = await fetcher();
            const data = response.data;
            if (Array.isArray(data)) {
                 setUsers(data);
            } else if (data) {
                setUsers([data]);
            } else {
                setUsers([]);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setUsers([]);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not retrieve user records.' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (debouncedSearchQuery) {
            const isNumeric = !isNaN(debouncedSearchQuery) && !isNaN(parseFloat(debouncedSearchQuery));
            if (isNumeric) {
                fetchAndSetUsers(() => searchUserByPhone(debouncedSearchQuery));
            } else {
                fetchAndSetUsers(() => searchUsersByName(debouncedSearchQuery));
            }
        } else {
            fetchAndSetUsers(getAllPastUsers);
        }
    }, [debouncedSearchQuery, fetchAndSetUsers]);

    const handleUserSelect = (user) => {
        router.push(`/admin/past-users/${user.publicId}`);
    };
    
    const handleCreateSuccess = (newUser) => {
        setIsModalOpen(false);
        toast({ title: "User Created", description: `Record for ${newUser.name} has been created.`});
        setUsers(prev => [newUser, ...prev]);
        router.push(`/admin/past-users/${newUser.publicId}`);
    };

    return (
        <>
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={itemVariants}>
                 <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <History className="h-8 w-8" />
                    Past User Records
                </h2>
                 <p className="text-muted-foreground mt-2">Search for existing records or create a new one.</p>
            </motion.div>
            
             <motion.div variants={itemVariants}>
                <Card className="bg-card/50 backdrop-blur-sm border-border/20">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Search Past Records</CardTitle>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <PlusCircle className="mr-2" /> Add New Record
                            </Button>
                        </div>
                        <CardDescription>
                            Search for a user by name or phone number, or view all records below.
                        </CardDescription>
                         <div className="relative pt-4">
                            <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Start typing a name or phone number to search..." 
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
                                        <motion.div key={user.publicId} layout variants={itemVariants}>
                                            <button
                                                onClick={() => handleUserSelect(user)}
                                                className="w-full text-left p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar>
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || user.name}`} />
                                                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{user.name}</p>
                                                            <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                                                            <p className="text-sm text-muted-foreground">{user.phone}</p>
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
                                    <p>{searchQuery ? 'No users found matching your search.' : 'No records found.'}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
        <AnimatePresence>
            {isModalOpen && (
                <PastUserFormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </AnimatePresence>

        </>
    );
}

