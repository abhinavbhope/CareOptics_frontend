
"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Clock, User, Mail, Phone, MapPin, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAppointmentSummary, getAppointmentsByDate } from '@/lib/admin/appointmentApi';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ActivityGrid = ({ data, onDateSelect, selectedDate, currentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Monday as 0, Sunday as 6
  const getMondayFirstDay = (date) => (date.getDay() + 6) % 7;

  // Create date in YYYY-MM-DD format without timezone issues
  const formatDate = (year, month, day) => {
    const date = new Date(year, month, day);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  const firstDayOfMonth = getMondayFirstDay(new Date(year, month, 1));
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let calendarDays = [];

  // Empty cells before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = formatDate(year, month, day);
    calendarDays.push({
      date: dateString,
      dayOfMonth: day,
      count: data[dateString] || 0,
    });
  }

  // Fill remaining cells to complete the grid
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-muted/30';
    if (count < 3) return 'bg-primary/20';
    if (count < 6) return 'bg-primary/40';
    if (count < 9) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-1.5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) =>
          day ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <motion.div
                  className={`w-full aspect-square rounded-sm cursor-pointer border-2 ${
                    selectedDate === day.date
                      ? 'border-accent'
                      : 'border-transparent'
                  } ${getColor(day.count)}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                  onClick={() => onDateSelect(day.date)}
                >
                  <div className="flex items-center justify-center h-full text-xs font-bold text-primary-foreground/80">
                    {day.dayOfMonth}
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {day.count} appointments on{' '}
                  {new Date(day.date + 'T00:00:00').toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div key={`empty-${index}`} />
          )
        )}
      </div>
    </TooltipProvider>
  );
};


const AppointmentsList = ({ appointments, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
            </div>
        )
    }

    if (appointments.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 flex flex-col items-center justify-center h-full">
                <Calendar className="h-16 w-16 text-muted-foreground/50" />
                <p className="mt-4">No appointments for this date.</p>
                <p className="text-sm">Select a date from the grid to view appointments.</p>
            </div>
        )
    }

    return (
        <motion.div className="space-y-4" initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}}>
            {appointments.map((app, index) => (
                <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                >
                     <Card className="bg-secondary/30">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold flex items-center gap-2"><User className="text-primary"/>{app.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="text-primary/80"/>{app.email}</p>
                                </div>
                                <Badge className="flex items-center gap-1.5" variant="outline"><Clock className="h-3 w-3" /> {app.preferredTime}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-3 space-y-1">
                                 <p className="flex items-start gap-2"><Phone className="text-primary/80 mt-1"/>{app.phone}</p>
                                 <p className="flex items-start gap-2"><MapPin className="text-primary/80 mt-1"/>{app.address}</p>
                                 <p className="flex items-start gap-2"><Eye className="text-primary/80 mt-1"/>
                                 {Array.isArray(app.eyeProblems) ? app.eyeProblems.join(', ') : ''}
                                 {app.customProblem ? `${app.eyeProblems?.length > 0 ? ' - ' : ''}${app.customProblem}` : ''}
                                 </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}

export default function AppointmentsPage() {
    const { toast } = useToast();
    const [summary, setSummary] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    const [selectedDate, setSelectedDate] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await getAppointmentSummary();
                const dailyCounts = response.data.reduce((acc, item) => {
                    acc[item.date] = item.count;
                    return acc;
                }, {});
                setSummary(dailyCounts);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Failed to load summary',
                    description: 'Could not fetch appointment summary. Please try again.',
                });
            } finally {
                setIsLoadingSummary(false);
            }
        };
        fetchSummary();
    }, [toast]);
    
    const handleDateSelect = useCallback(async (date) => {
        setSelectedDate(date);
        setIsAppointmentsLoading(true);
        setAppointments([]); // Clear previous appointments immediately
        try {
            const response = await getAppointmentsByDate(date);
            setAppointments(response.data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: `Failed to load appointments for ${date}`,
                description: 'Could not fetch appointments. Please try again.',
            });
            setAppointments([]);
        } finally {
            setIsAppointmentsLoading(false);
        }
    }, [toast]);

    const handleMonthChange = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleYearChange = (year) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setFullYear(parseInt(year));
            return newDate;
        });
    };

    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={FADE_IN_VARIANTS} className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Appointments Activity
        </h2>
      </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Appointments for selected date */}
            <motion.div variants={FADE_IN_VARIANTS} className="lg:col-span-1">
                 <div className="bg-card/50 border-border/20 backdrop-blur-sm rounded-xl p-6 h-full shadow-lg shadow-background/20">
                    <h3 className="font-headline text-lg text-muted-foreground">
                        {selectedDate ? `Appointments for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString()}` : "Select a Date"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Click a date on the grid to see details</p>
                    <div className="h-[450px] overflow-y-auto pr-2">
                        <AnimatePresence mode="wait">
                            <AppointmentsList 
                                key={selectedDate} 
                                appointments={appointments} 
                                isLoading={isAppointmentsLoading}
                            />
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Right Panel: Activity Grid */}
            <motion.div variants={FADE_IN_VARIANTS} className="lg:col-span-2">
                <div className="bg-card/50 border-border/20 backdrop-blur-sm rounded-xl p-6 flex flex-col justify-between h-full hover:border-primary/50 transition-colors duration-300 shadow-lg shadow-background/20">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                           <div>
                             <h3 className="font-headline text-lg text-muted-foreground">Recent Activity</h3>
                             <p className="text-xs text-muted-foreground mt-1">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                           </div>
                            <div className="flex items-center gap-2">
                                <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={() => handleMonthChange(-1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleMonthChange(1)}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        {isLoadingSummary ? (
                            <Skeleton className="h-[200px] w-full" />
                        ) : (
                             <ActivityGrid 
                                data={summary || {}} 
                                onDateSelect={handleDateSelect} 
                                selectedDate={selectedDate} 
                                currentDate={currentDate}
                             />
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    </motion.div>
  );
}
