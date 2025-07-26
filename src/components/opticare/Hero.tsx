"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32 lg:py-40">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="opacity-10"
          data-ai-hint="abstract geometric pattern"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,73,223,0.15),rgba(255,255,255,0))]"></div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start space-y-6"
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-headline">
              See the World,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Clearly.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              OptiCare is your all-in-one platform for modern eye care. From virtual try-ons to prescription renewals, we bring vision services to your fingertips.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="group">
                <Link href="#how-it-works">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Image
              src="https://placehold.co/600x600.png"
              alt="OptiCare illustration"
              width={600}
              height={600}
              className="rounded-xl shadow-2xl"
              data-ai-hint="optometry abstract illustration"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
