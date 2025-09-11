"use client";

import { Header } from '@/components/opticare/Header';
import { Footer } from '@/components/opticare/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Eye, Store, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EyeTestPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <motion.div
          className="container mx-auto max-w-2xl px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-card/50 border-border/20 backdrop-blur-lg shadow-2xl shadow-primary/10 text-center">
            <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline text-primary">
                Comprehensive Eye Exams
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-2">
                Your vision is our priority.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {/* Visit Us In-Store */}
              <div className="p-6 rounded-lg bg-secondary/30 border border-border/10 text-left">
                <Store className="h-12 w-12 mx-auto text-accent mb-3" />
                <h3 className="text-xl font-semibold text-center">Visit Us In-Store</h3>
                <p className="text-muted-foreground mt-2">
                  For the most accurate and comprehensive eye examination, we invite you to visit one of our physical store locations. Our expert optometrists use state-of-the-art equipment to ensure your prescription is perfect.
                </p>

                {/* Highlighted Location */}
                <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="text-primary font-semibold flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Location
                  </h4>
                  <p className="mt-1 text-sm text-foreground leading-relaxed">
                    Pavan Kunj, Plot No.1, opposite Government Girls Junior College,<br />
                    Sarvasukhi Colony, West Marredpally,<br />
                    Secunderabad, Telangana 500026
                  </p>
                </div>
              </div>

              {/* Online Results */}
              <div className="p-6 rounded-lg bg-secondary/30 border border-border/10">
                <User className="h-12 w-12 mx-auto text-accent mb-3" />
                <h3 className="text-xl font-semibold">Access Results Online</h3>
                <p className="text-muted-foreground mt-2">
                  After your in-store test, your results and prescription details will be securely uploaded and available for you to view in your personal profile section on our website.
                </p>
              </div>

              {/* Button */}
              <Button asChild size="lg" className="w-full max-w-xs mx-auto">
                <Link href="/profile">
                  Go to My Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
