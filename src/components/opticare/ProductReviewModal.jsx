"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Star, Send, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getReviewsByProductId,
  addReview,
  deleteReview,
} from "@/lib/reviewApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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

const reviewSchema = z.object({
  rating: z.number().min(1, { message: "Please select a rating." }),
  comment: z
    .string()
    .min(10, { message: "Comment must be at least 10 characters." })
    .max(1000),
});

const StarRatingInput = ({ value, onChange, disabled }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          i < value
            ? "fill-amber-400 text-amber-400"
            : "fill-muted text-muted-foreground hover:fill-amber-300"
        }`}
        onClick={() => !disabled && onChange(i + 1)}
      />
    ))}
  </div>
);

const StaticStarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-amber-400 text-amber-400"
            : "fill-muted text-muted-foreground"
        }`}
      />
    ))}
  </div>
);

export function ProductReviewModal({ product, onClose }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  /* auth check */
  useEffect(() => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setIsLoggedIn(true);
      setCurrentUserId(userId);
    }
  }
}, []);

/* fetch every review for this product */
const fetchReviews = async () => {
  if (!product) return;
  try {
    setIsLoading(true);
    const { data } = await getReviewsByProductId(product.id);

    // ✅ remove duplicates by id
    const unique = Array.from(
      new Map(data.map((r) => [r.id, r])).values()
    );
    setReviews(unique);
  } catch {
    toast({
      variant: "destructive",
      title: "Could not load reviews",
    });
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [product?.id]);

/* react-hook-form setup */
const form = useForm({
  resolver: zodResolver(reviewSchema),
  defaultValues: { rating: 0, comment: "" },
});

/* add review */
async function onSubmit(values) {
  if (!product) return;
  setIsSubmitting(true);
  try {
    const { data: newReview } = await addReview({ productId: product.id, ...values });

    // ✅ prepend the actual new review instead of refetching
    setReviews(prev => [newReview, ...prev]);
    toast({ title: "Review added!" });
    form.reset();
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Submission failed",
      description: err?.response?.data?.message || "review already submitted for this product.",
    });
  } finally {
    setIsSubmitting(false);
  }
}
/* delete own review */
const handleDeleteReview = async (reviewId) => {
  try {
    await deleteReview(reviewId);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    toast({ title: "Review deleted" });
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Deletion failed",
      description: err?.response?.data?.message || "Try again later.",
    });
  }
};

  const handleLoginForReview = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectUrl", "/products/allItems");
      router.push("/auth");
    }
  };

  if (!product) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative flex flex-col md:flex-row w-full max-w-4xl h-[90vh] max-h-[700px] bg-card/80 border border-border/30 rounded-2xl overflow-hidden"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        {/* left: product image */}
        <div className="w-full md:w-5/12 relative flex-shrink-0 aspect-square md:aspect-auto">
          <Image
            src={
              product.imageUrl?.startsWith("http")
                ? product.imageUrl
                : "https://placehold.co/600x600"
            }
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* right: details & reviews */}
        <div className="w-full md:w-7/12 flex flex-col p-6 md:p-8 overflow-hidden">
          <div className="flex-shrink-0">
            <h2 className="text-3xl font-bold font-headline text-primary">
              {product.name}
            </h2>
            <p className="text-2xl font-bold text-accent-neon mt-2">
              ₹{product.price}
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              {product.description}
            </p>
          </div>

          <div className="mt-6 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xl font-bold mb-4 flex-shrink-0">
              Reviews ({reviews.length})
            </h3>

            <div className="space-y-6 overflow-y-auto pr-2 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviews.length ? (
                reviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-4 group">
                    <Avatar>
      <AvatarFallback>
        {(review.username || "U").charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">
                          {review.username ||
                            `User_${review.userId?.slice(0, 6)}`}
                        </p>

                        <div className="flex items-center gap-3">
                          <StaticStarRating rating={review.rating} />

                          {isLoggedIn && currentUserId === review.userId && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete your review?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteReview(review.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Be the first to review this product!
                </div>
              )}
            </div>

            {/* write-review form or login prompt */}
            {isLoggedIn ? (
              <div className="mt-4 pt-4 border-t border-border/20 flex-shrink-0">
                <h4 className="text-lg font-bold mb-3">Write Your Review</h4>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <StarRatingInput
                      value={form.watch("rating")}
                      onChange={(v) =>
                        form.setValue("rating", v, { shouldValidate: true })
                      }
                      disabled={isSubmitting}
                    />
                    {form.formState.errors.rating && (
                      <p className="text-red-500 text-xs mt-1">
                        {form.formState.errors.rating.message}
                      </p>
                    )}
                  </div>

                  <Textarea
                    placeholder={`What did you think of ${product.name}?`}
                    rows={3}
                    {...form.register("comment")}
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.comment && (
                    <p className="text-red-500 text-xs">
                      {form.formState.errors.comment.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="self-end bg-accent-neon text-black hover:bg-accent-neon/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-border/20 flex-shrink-0 text-center">
                <Button variant="outline" onClick={handleLoginForReview}>
                  Login to write a review
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}