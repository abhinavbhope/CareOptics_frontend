
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getAllReviews, deleteReview, updateReview as apiUpdateReview } from '@/lib/admin/reviewApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const StaticStarRating = ({ rating, size = "sm" }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
      ))}
    </div>
);

const reviewUpdateSchema = z.object({
  rating: z.number().min(1, "Rating is required.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters long."),
});

function EditReviewModal({ review, isOpen, onClose, onReviewUpdate }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(reviewUpdateSchema),
        defaultValues: {
            rating: review?.rating || 0,
            comment: review?.comment || "",
        },
    });

    useEffect(() => {
        if (review) {
            form.reset({
                rating: review.rating,
                comment: review.comment,
            });
        }
    }, [review, form]);
    
    const StarRatingInput = ({ value, onChange, disabled }) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
                key={i} 
                className={`h-6 w-6 cursor-pointer transition-colors ${i < value ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground hover:fill-amber-300'}`}
                onClick={() => !disabled && onChange(i + 1)}
            />
          ))}
        </div>
    );

    async function onSubmit(values) {
        if (!review) return;
        setIsSubmitting(true);
        try {
            const updatedReview = await apiUpdateReview(review.id, values);
            onReviewUpdate(updatedReview.data);
            toast({ title: "Review Updated!", description: "The review has been successfully updated." });
            onClose();
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: error.response?.data?.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Review</DialogTitle>
                    <DialogDescription>Update the rating and comment for the review on &quot;{review?.productName}&quot;.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="rating" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                    <StarRatingInput value={field.value} onChange={field.onChange} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="comment" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                    <Textarea {...field} disabled={isSubmitting} rows={5}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default function ReviewManagementPage() {
    const { toast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllReviews();
            setReviews(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to load reviews',
                description: 'Could not fetch review data. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const filteredReviews = useMemo(() => {
        return reviews
            .filter(review => {
                const searchLower = debouncedSearchTerm.toLowerCase();
                return (review.productName && review.productName.toLowerCase().includes(searchLower)) || 
                       (review.username && review.username.toLowerCase().includes(searchLower)) ||
                       (review.comment && review.comment.toLowerCase().includes(searchLower));
            });
    }, [reviews, debouncedSearchTerm]);

    const handleUpdateClick = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };
    
    const handleReviewUpdate = (updatedReview) => {
        setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
            toast({
                title: 'Review Deleted',
                description: 'The review has been successfully deleted.',
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete the review. Please try again.',
            });
        }
    };

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_IN_VARIANTS} className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Star className="h-8 w-8" />
                    User Reviews Management
                </h2>
            </motion.div>

            <motion.div variants={FADE_IN_VARIANTS}>
                <div className="flex items-center justify-end">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by product, user, or comment..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div variants={FADE_IN_VARIANTS} className="rounded-lg border bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                             <TableHead>Date</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredReviews.length > 0 ? (
                            filteredReviews.map(review => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${review.username}`} />
                                                <AvatarFallback>{review.username ? review.username.charAt(0) : 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{review.username}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{review.productName}</TableCell>
                                    <TableCell>
                                        <StaticStarRating rating={review.rating} />
                                    </TableCell>
                                    <TableCell>
                                        <p className="max-w-xs truncate">{review.comment}</p>
                                    </TableCell>
                                     <TableCell className="text-muted-foreground text-xs">
                                        {format(new Date(review.createdAt), 'PPP')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="icon" onClick={() => handleUpdateClick(review)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this review.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteReview(review.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </motion.div>
            <AnimatePresence>
                {isModalOpen && selectedReview && (
                    <EditReviewModal
                        review={selectedReview}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onReviewUpdate={handleReviewUpdate}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
