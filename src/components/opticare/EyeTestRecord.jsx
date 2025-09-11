
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, ChevronDown, Framer, Layers } from 'lucide-react';

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

export function EyeTestRecord({ test }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const dates = [
        { label: 'Test Date', value: test.testDate },
        { label: 'Booking Date', value: test.bookingDate },
        { label: 'Delivery Date', value: test.deliveryDate }
    ];


    return (
        <motion.div layout>
            <Card className="bg-secondary/30 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <div>
                            <p className="font-bold flex items-center gap-2"><Calendar className="text-primary/80" />Test Date: {test.testDate ? format(new Date(test.testDate), 'PPP') : 'N/A'}</p>
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
                                     <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><Framer size={14}/>Frame:</p>
                                     <p className="text-xs p-2 bg-background/40 rounded-md mt-1">{test.frame || "Not specified"}</p>
                                   </div>
                                    <div>
                                     <p className="font-semibold text-muted-foreground flex items-center gap-1.5"><Layers size={14}/>Lens:</p>
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
                </CardContent>
            </Card>
        </motion.div>
    );
}
