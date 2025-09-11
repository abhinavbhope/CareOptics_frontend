"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function Hero({ onOpenAuth }) {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32 lg:py-40 bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/back.jpeg"
          alt="Dark glasses background"
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>

      {/* Overlay Effects */}
      <div className="absolute inset-0 -z-10 bg-background/80" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-background via-transparent to-primary/20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,73,223,0.15),rgba(255,255,255,0))]" />

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16 items-center">
          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start space-y-6"
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              See the World Clearly through,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CareOptics.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              CareOptics is your all-in-one platform for modern eye care. From virtual try-ons to prescription renewals, we bring vision services to your fingertips.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="group" onClick={onOpenAuth}>
                <Link href="#">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Image
              src="/images/men.jpeg"
              alt="OptiCare illustration"
              width={600}
              height={600}
              className="rounded-xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
