
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getTestsForUserByEmail, deleteTestForUser } from '@/lib/eyetestApi';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Loader2 } from 'lucide-react';
import { EyeTestRecord } from '@/components/admin/eyetest/EyeTestRecord';
import { ExternalUserEyeTestForm } from '@/components/admin/eyetest/ExternalUserEyeTestForm';


const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
    }),
};

export default function UserEyeTestDetailsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [user, setUser] = useState(null);
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingTest, setIsAddingTest] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    
    useEffect(() => {
        const storedUser = localStorage.getItem('selectedUserForEyeTest');
        if (!storedUser) {
            toast({ variant: 'destructive', title: 'No User Selected', description: 'Please select a user first.' });
            router.push('/admin/eyetest/registered');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router, toast]);


    const fetchUserData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const testRes = await getTestsForUserByEmail(user.email);
            const sortedTests = testRes.data.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
            setTests(sortedTests);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Error fetching data', description: 'Could not retrieve test data.' });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user, fetchUserData]);
    
    const handleAddSuccess = (newTestData) => {
        const newTest = newTestData.data;
        setTests(prev => [newTest, ...prev].sort((a, b) => new Date(b.testDate) - new Date(a.testDate)));
        setIsAddingTest(false);
        toast({ title: "Test Created", description: `New eye test added for ${user.email}.` });
    };

    const handleEditSuccess = (updatedTestData) => {
        const updatedTest = updatedTestData.data;
        setTests(prev => prev.map(t => t.testId === updatedTest.testId ? updatedTest : t).sort((a, b) => new Date(b.testDate) - new Date(a.testDate)));
        setEditingTest(null);
        toast({ title: "Test Updated", description: "The eye test record has been successfully updated." });
    };

    const handleDelete = async (testId) => {
        try {
            await deleteTestForUser(user.email, testId);
            setTests(prev => prev.filter(t => t.testId !== testId));
            toast({ title: "Test Deleted", description: "The eye test record has been removed." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Deletion Failed' });
        }
    };

    const openEditForm = (test) => {
        setEditingTest(test);
        setIsAddingTest(false); // Close add form if open
    };
    
    const closeForms = () => {
        setIsAddingTest(false);
        setEditingTest(null);
    };

    if (!user) {
         return (
            <div className="flex h-[50vh] w-full items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading user data...</p>
                </div>
            </div>
        );
    }

    const formToShow = isAddingTest ? 'add' : editingTest ? 'edit' : null;

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            {/* User Card */}
            <motion.div variants={FADE_IN_VARIANTS}>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
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
                             {!formToShow && (
                                <Button onClick={() => { setIsAddingTest(true); setEditingTest(null); }}>
                                    <PlusCircle className="mr-2" /> Add New Test
                                </Button>
                             )}
                        </div>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <AnimatePresence>
                        {formToShow && (
                            <motion.div
                                key={formToShow === 'edit' ? editingTest.testId : 'add-form'}
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -20, height: 0, transition: { duration: 0.2 } }}
                            >
                                <Card className="bg-secondary/40 p-4">
                                    <CardHeader>
                                        <CardTitle>{formToShow === 'edit' ? 'Edit Eye Test' : 'Create New Eye Test'}</CardTitle>
                                        <CardDescription>
                                            {formToShow === 'edit' 
                                                ? `Editing record for test dated ${format(new Date(editingTest.testDate), 'PPP')}` 
                                                : `For user: ${user.name}`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ExternalUserEyeTestForm 
                                            key={formToShow === 'edit' ? editingTest.testId : 'add'}
                                            existingUser={user}
                                            existingTest={formToShow === 'edit' ? editingTest : null}
                                            onSuccess={formToShow === 'edit' ? handleEditSuccess : handleAddSuccess}
                                            onCancel={closeForms}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                        </AnimatePresence>

                        {isLoading ? (
                             <div className="text-center py-12 text-muted-foreground">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                <p className="mt-2">Loading test history...</p>
                            </div>
                        ) : tests.length > 0 ? (
                            tests.map(test => (
                                <EyeTestRecord 
                                    key={test.testId} 
                                    test={test}
                                    onEdit={() => openEditForm(test)}
                                    onDelete={() => handleDelete(test.testId)}
                                />
                            ))
                        ) : !isAddingTest ? (
                             <div className="text-center py-12 text-muted-foreground">
                                <p>No tests found for this user.</p>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
