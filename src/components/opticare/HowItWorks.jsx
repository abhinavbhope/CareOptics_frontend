"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

const steps = [
  {
    step: 1,
    title: 'Book an Appointment',
    description: 'Easily find and book an appointment with a verified optometrist near you. Our platform simplifies the process, saving you time and hassle.',
    image: '/images/appointment.jpeg',
    aiHint: 'online appointment booking'
  },
  {
    step: 2,
    title: 'Get Your Prescription',
    description: 'Have a comprehensive eye exam and get your updated prescription. Your details are securely stored on your OptiCare profile for easy access.',
    image: '/images/pres.jpeg',
    aiHint: 'virtual eye exam'
  },
  {
    step: 3,
    title: 'Choose Your Eyewear',
    description: 'Browse our vast collection of frames and lenses. Use our virtual try-on feature to see how they look on you before you buy.',
    image: '/images/var.jpg',
    aiHint: 'choosing glasses online'
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Getting Started is Simple</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Follow these three easy steps to revolutionize your eye care experience.
          </p>
        </motion.div>

        <div className="mt-20 space-y-24">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-row-dense' : ''}`}
            >
              <div className={`relative ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={500}
                  height={500}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint={item.aiHint}
                />
              </div>
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-primary/10 text-primary">Step {item.step}</span>
                <h3 className="text-2xl font-bold font-headline">{item.title}</h3>
                <p className="text-muted-foreground text-lg">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
