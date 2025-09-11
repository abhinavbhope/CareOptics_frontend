
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getPastUserById, deletePastUser, getEyeTestsForPastUser, deleteEyeTestForPastUser } from '@/lib/admin/pastUserApi';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { EyeTestRecord } from '@/components/admin/past-users/EyeTestRecord';
import { PastUserFormModal } from '@/components/admin/past-users/PastUserFormModal';
import { EyeTestFormModal } from '@/components/admin/past-users/EyeTestFormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
    }),
};

export default function UserEyeTestPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const publicId = useMemo(() => decodeURIComponent(params.publicId), [params.publicId]);

    const [user, setUser] = useState(null);
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    
    const fetchUserData = useCallback(async () => {
        if (!publicId) return;
        setIsLoading(true);
        try {
            const [userRes, testRes] = await Promise.all([
                getPastUserById(publicId),
                getEyeTestsForPastUser(publicId)
            ]);
            setUser(userRes.data);
            const sortedTests = testRes.data.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
            setTests(sortedTests);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: 'Could not retrieve user or test data.' });
        } finally {
            setIsLoading(false);
        }
    }, [publicId, toast]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleUserUpdateSuccess = (updatedUser) => {
        setUser(updatedUser);
        setIsUserModalOpen(false);
    };
    
    const handleTestAddSuccess = (newTest) => {
        setTests(prev => [newTest, ...prev].sort((a, b) => new Date(b.testDate) - new Date(a.testDate)));
        setIsTestModalOpen(false);
    };

    const handleTestEditSuccess = (updatedTest) => {
        setTests(prev => prev.map(t => t.id === updatedTest.id ? updatedTest : t).sort((a, b) => new Date(b.testDate) - new Date(a.testDate)));
        setEditingTest(null);
        setIsTestModalOpen(false);
    };

    const handleDeleteUser = async () => {
        try {
            await deletePastUser(publicId);
            toast({ title: "User Deleted", description: "The user record has been removed." });
            router.push('/admin/past-users');
        } catch (error) {
             toast({ variant: 'destructive', title: 'Deletion Failed', description: error.response?.data?.message || 'Could not delete user.' });
        }
    };
    
    const handleDeleteTest = async (testId) => {
  try {
    await deleteEyeTestForPastUser(testId);
    setTests(prev => {
      const next = prev.filter(t => t.testId !== testId); // ✅ correct field

      return next;
    });
    toast({ title: "Test Deleted", description: "The eye test record has been removed." });
  } catch (error) {
    toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the test record.' });
  }
};

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">User not found.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <>
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            {/* User Card */}
            <motion.div variants={FADE_IN_VARIANTS}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
                                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <CardDescription>{user.email || 'No Email'} - {user.phone}</CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsUserModalOpen(true)}><Edit className="mr-2 h-4 w-4"/> Edit User</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete User</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this user and all associated eye tests.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Test History */}
            <motion.div variants={FADE_IN_VARIANTS}>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Test History ({tests.length})</CardTitle>
                            <Button onClick={() => { setEditingTest(null); setIsTestModalOpen(true); }}>
                                <PlusCircle className="mr-2" /> Add New Test
                            </Button>
                        </div>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        {tests.length > 0 ? (
                            tests.map(test => (
                                <EyeTestRecord 
                                    key={test.testId} 
                                    test={test}
                                    onEdit={() => { setEditingTest(test); setIsTestModalOpen(true); }}
                                    onDelete={() => handleDeleteTest(test.testId)}
                                />
                            ))
                        ) : (
                             <div className="text-center py-12 text-muted-foreground">
                                <p>No tests found for this user.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>

        <AnimatePresence>
            {isUserModalOpen && (
                <PastUserFormModal 
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    onSuccess={handleUserUpdateSuccess}
                    existingUser={user}
                />
            )}
            {isTestModalOpen && (
                 <EyeTestFormModal 
                    isOpen={isTestModalOpen}
                    onClose={() => setIsTestModalOpen(false)}
                    onAddSuccess={handleTestAddSuccess}
                    onEditSuccess={handleTestEditSuccess}
                    existingTest={editingTest}
                    publicId={publicId}
                />
            )}
        </AnimatePresence>
        </>
    );
}
