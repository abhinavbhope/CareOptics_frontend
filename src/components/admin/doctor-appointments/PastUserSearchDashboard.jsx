
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { getAllPastUsers } from '@/lib/admin/doctorPastUserApi'; 
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserSearch, ChevronRight, PlusCircle, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PastUserFormModal } from './PastUserFormModal';


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

export function PastUserSearchDashboard() {
    const { toast } = useToast();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPastUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllPastUsers();
            setUsers(response.data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching patients', description: 'Could not retrieve patient records.' });
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPastUsers();
    }, [fetchPastUsers]);

    const filteredUsers = useMemo(() => {
        if (!debouncedSearchQuery) return users;
        return users.filter(user =>
            user.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            user.phone?.includes(debouncedSearchQuery)
        );
    }, [debouncedSearchQuery, users]);

    const handleUserSelect = (user) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedPastUserForDoctorAppointment', JSON.stringify(user));
            router.push('/admin/doctor-appointments/past/details');
        }
    };
    
    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchPastUsers();
    };


    return (
        <>
            {isModalOpen && <PastUserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />}
            <Card className="bg-card/50 backdrop-blur-sm border-border/20">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Search Patients</CardTitle>
                            <CardDescription>Find a patient or create a new record.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Patient
                        </Button>
                    </div>
                     <div className="relative mt-4">
                        <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or phone..." 
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
                                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{user.name}</p>
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
                            <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                                <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                                <p>No patients found.</p>
                                <Button variant="link" onClick={() => setIsModalOpen(true)}>Create a new patient record</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
