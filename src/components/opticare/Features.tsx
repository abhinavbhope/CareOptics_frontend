"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, CalendarDays, Glasses, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: 'Virtual Try-On',
    description: 'Use your camera to try on hundreds of frames from the comfort of your home.',
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    title: 'Easy Booking',
    description: 'Schedule appointments with top optometrists in your area in just a few clicks.',
  },
  {
    icon: <Glasses className="h-8 w-8 text-primary" />,
    title: 'Personalized Lenses',
    description: 'Get high-quality, custom lenses tailored to your prescription and lifestyle needs.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'AI Recommendations',
    description: 'Our smart AI suggests the best frames for your face shape and style.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Everything You Need for Perfect Vision</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explore the features that make OptiCare the best choice for your eye health.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
            >
              <Card className="h-full bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
