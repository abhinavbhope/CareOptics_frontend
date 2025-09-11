"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getTestsForUserByEmail, deleteTestForUser } from '@/lib/eyetestApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeTestRecord } from './EyeTestRecord';
import { ExternalUserEyeTestForm } from './ExternalUserEyeTestForm';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Loader2 } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function UserTestRecord({ user }) {
  const { toast } = useToast();
  const [testHistory, setTestHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTest, setIsAddingTest] = useState(false);

  const fetchUserTests = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const response = await getTestsForUserByEmail(user.email);
      setTestHistory(response.data || []);
    } catch (error) {
      setTestHistory([]);
      if (error.response?.status !== 404) {
        toast({
          variant: 'destructive',
          title: 'Error fetching tests',
          description: error.response?.data?.message || `Could not retrieve test history for ${user.email}.`
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user.email, toast]);

  useEffect(() => {
    fetchUserTests();
  }, [fetchUserTests]);

  const handleTestUpdate = (updatedTest) => {
    setTestHistory(prev => prev.map(test => test.testId === updatedTest.testId ? updatedTest : test));
  };

  const handleTestDelete = async (deletedTestId) => {
    try {
      await deleteTestForUser(user.email, deletedTestId);
      setTestHistory(prev => prev.filter(test => test.testId !== deletedTestId));
      toast({
        title: "Deleted",
        description: `Eye test record removed for ${user.email}.`,
      });
    } catch (error) {
      console.error("Delete failed", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.response?.data?.message || "Could not delete eye test.",
      });
    }
  };

  const handleAddTestSuccess = (response) => {
    setTestHistory(prev => [response.data, ...prev]);
    setIsAddingTest(false);
  };

  return (
    <motion.div layout variants={itemVariants} initial="hidden" animate="visible" exit="exit">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} />
              <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {isAddingTest ? (
              <Button variant="secondary" onClick={() => setIsAddingTest(false)}>Cancel</Button>
            ) : (
              <Button onClick={() => setIsAddingTest(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Test
              </Button>
            )}
          </AnimatePresence>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isAddingTest && (
              <motion.div
                key="add-test-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Card className="bg-secondary/50 p-4 mt-4">
                  <h3 className="font-bold mb-4">New Test for {user.name}</h3>
                  <ExternalUserEyeTestForm
                    existingUserEmail={user}
                    onSuccess={handleAddTestSuccess}
                    onCancel={() => setIsAddingTest(false)}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : testHistory.length > 0 ? (
              <AnimatePresence>
                {testHistory.map(test => (
                  <EyeTestRecord
                    key={test.testId}
                    test={{ ...test, user }} 
                    onTestUpdate={handleTestUpdate}
                    onTestDelete={handleTestDelete}
                  />
                ))}
              </AnimatePresence>
            ) : (
              !isAddingTest && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No eye test records found for this user.</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
