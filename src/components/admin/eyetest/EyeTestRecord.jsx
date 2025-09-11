"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, FileText, ChevronDown, Framer, Layers } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const VisionDetail = ({ title, right, left }) => (
    <div>
        <h4 className="font-semibold text-sm text-primary/80 mb-1">{title}</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-background/40 p-2 rounded-md">
                <p className="font-bold">Right Eye</p>
                <p>SPH: {right?.sph ?? 'N/A'}, CYL: {right?.cyl ?? 'N/A'}, AXIS: {right?.axis ?? 'N/A'}, ADD: {right?.add ?? 'N/A'}, Vision: {right?.vision ?? 'N/A'}</p>
            </div>
            <div className="bg-background/40 p-2 rounded-md">
                <p className="font-bold">Left Eye</p>
                <p>SPH: {left?.sph ?? 'N/A'}, CYL: {left?.cyl ?? 'N/A'}, AXIS: {left?.axis ?? 'N/A'}, ADD: {left?.add ?? 'N/A'}, Vision: {left?.vision ?? 'N/A'}</p>
            </div>
        </div>
    </div>
);

export function EyeTestRecord({ test, onEdit, onDelete }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { toast } = useToast();

    const dates = [
        { label: 'Test Date', value: test.testDate },
        { label: 'Booking Date', value: test.bookingDate },
        { label: 'Delivery Date', value: test.deliveryDate }
    ];
    
    const handleDelete = () => {
        if (onDelete) onDelete(test.testId);
    };

    return (
        <motion.div layout variants={itemVariants}>
            <Card className="bg-secondary/30 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                    
                    {/* Personal Info */}
                    {test.user && (
                        <div className="mb-4 border-b border-border/20 pb-2 space-y-1 text-sm">
                            <p><strong>Full Name:</strong> {test.user.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {test.user.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {test.user.phone || 'N/A'}</p>
                            <p><strong>Age:</strong> {test.user.age ?? 'N/A'}</p>
                            <p><strong>Address:</strong> {test.user.address || 'N/A'}</p>
                        </div>
                    )}

                    {/* Test Summary */}
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <div>
                            <p className="font-bold flex items-center gap-2">
                                <Calendar className="text-primary/80" />
                                Test Date: {test.testDate ? format(new Date(test.testDate), 'PPP') : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground ml-7">Frame: {test.frame || "N/A"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChevronDown className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-border/20 space-y-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    {dates.map((dateItem) => (
                                        <div key={dateItem.label}>
                                            <p className="font-semibold text-muted-foreground">{dateItem.label}:</p>
                                            <p>{dateItem.value ? format(new Date(dateItem.value), 'PPP') : 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><Framer size={14}/> Frame:</p>
                                        <p className="text-xs p-2 bg-background/40 rounded-md mt-1">{test.frame || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><Layers size={14}/> Lens:</p>
                                        <p className="text-xs p-2 bg-background/40 rounded-md mt-1">{test.lens || "Not specified"}</p>
                                    </div>
                                </div>

                                <VisionDetail title="Distance Vision (DV)" right={test.dvRightEye} left={test.dvLeftEye} />
                                <VisionDetail title="Near Vision (NV)" right={test.nvRightEye} left={test.nvLeftEye} />
                                <VisionDetail title="Intermediate Vision (IM)" right={test.imRightEye} left={test.imLeftEye} />
                                
                                {test.notes && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-primary/80 mb-1 flex items-center gap-1"><FileText size={14}/> Notes</h4>
                                        <p className="text-xs text-muted-foreground p-2 bg-background/40 rounded-md">{test.notes}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {onEdit && (
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onEdit(test)}>
                                <Edit size={16} className="mr-1" /> Edit
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm"><Trash2 size={16} className="mr-1" /> Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete this eye test record. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
