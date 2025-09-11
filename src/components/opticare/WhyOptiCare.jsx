"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

const benefits = [
  'Access to a network of certified eye care professionals.',
  'A wide selection of high-quality, fashionable eyewear.',
  'Cutting-edge technology for accurate virtual try-ons.',
  'Competitive pricing and transparent costs.',
  'Seamless, user-friendly platform available 24/7.',
];

export function WhyOptiCare() {
  return (
    <section id="why-us" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/images/clear.jpg"
              alt="Friendly Optician"
              width={550}
              height={550}
              className="rounded-xl shadow-2xl"
              data-ai-hint="friendly optician"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              The Clear Choice for Your Eyes
            </h2>
            <p className="text-lg text-muted-foreground">
              We're committed to providing you with the best possible service and products. Here's why millions trust OptiCare for their vision needs.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
