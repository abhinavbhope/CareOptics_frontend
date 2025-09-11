
"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

const FADE_UP_ANIMATION = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
    }),
};

const actionCards = [
    {
        icon: <PlusCircle className="h-8 w-8 text-primary" />,
        title: "Create New Product",
        description: "Add a new item to your store's inventory.",
        href: "/admin/products/create",
        cta: "Create Product"
    },
    {
        icon: <Edit className="h-8 w-8 text-amber-400" />,
        title: "Manage Products",
        description: "Edit details, prices, stock, and remove items.",
        href: "/admin/products/update",
        cta: "Manage Products"
    }
];

export default function AdminProductsDashboard() {
    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={FADE_UP_ANIMATION} className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Package className="h-8 w-8" />
                    Product Management
                </h2>
            </motion.div>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
                 variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            >
                {actionCards.map((card, i) => (
                    <motion.div key={card.title} custom={i} variants={FADE_UP_ANIMATION}>
                         <Card className="h-full flex flex-col justify-between bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                            <CardHeader>
                                <div className="mb-4">{card.icon}</div>
                                <CardTitle>{card.title}</CardTitle>
                                <CardDescription>{card.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full group">
                                    <Link href={card.href}>
                                        {card.cta}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
