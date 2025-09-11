
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { DollarSign, Users, CalendarCheck, PhoneCall, Package, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getRevenueStats, getCallbackStats, getRecentCallbacks } from '@/lib/admin/callbackApi';
import { getAppointmentStats, getRecentAppointments } from '@/lib/admin/appointmentApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomTooltip } from '@/components/ui/CustomTooltip';
const PIE_COLORS = ['#3B49DF', '#A663CC', '#00ff88', '#00e67a', '#00cc6d', '#00b35f'];

const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = useState([]);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentCallbacks, setRecentCallbacks] = useState([]);
  const [appointmentDistribution, setAppointmentDistribution] = useState([]);


  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        setIsLoadingRevenue(true);
        const response = await getRevenueStats(selectedYear);
        const transformedData = response.data.revenues.map(item => ({
          month: item.month.split('-')[1].substring(0, 3),
          revenue: item.totalRevenue
        }));
        setRevenueData(transformedData);
        
        const totalRevenueForYear = response.data.revenues.reduce((acc, item) => acc + item.totalRevenue, 0);
        setStats(prev => ({ ...prev, totalRevenue: totalRevenueForYear }));

      } catch (error) {
        console.error("Failed to fetch revenue stats:", error);
         setRevenueData([]);
      } finally {
        setIsLoadingRevenue(false);
      }
    }
    fetchRevenue();
  }, [selectedYear]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoadingStats(true);
        const [
          callbackStatsRes, 
          appointmentStatsRes,
          recentAppointmentsRes,
          recentCallbacksRes
        ] = await Promise.all([
          getCallbackStats(),
          getAppointmentStats(),
          getRecentAppointments(),
          getRecentCallbacks()
        ]);

        setStats(prev => ({
          ...prev,
          totalAppointments: appointmentStatsRes.data.totalAppointments,
          totalCallbacks: callbackStatsRes.data.total
        }));

        // Integrate distribution for pie chart
        const distribution = Array.isArray(appointmentStatsRes.data)
  ? appointmentStatsRes.data.map(r => ({
      name: r.reason.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: r.count
    }))
  : [];
        setAppointmentDistribution(distribution);

        setRecentAppointments(
          Array.isArray(recentAppointmentsRes.data)
            ? recentAppointmentsRes.data
            : []
        );

        setRecentCallbacks(
          Array.isArray(recentCallbacksRes.data)
            ? recentCallbacksRes.data
            : []
        );
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchDashboardData();
  }, []);

  const overviewCards = [
    { title: "Total Revenue", value: stats?.totalRevenue ? `₹${stats.totalRevenue.toFixed(2)}` : '₹0.00', icon: <DollarSign />, details: `For ${selectedYear}` },
    { title: "Total Appointments", value: stats?.totalAppointments ?? "0", icon: <CalendarCheck />, details: "All time" },
    { title: "Callback Requests", value: stats?.totalCallbacks ?? "0", icon: <PhoneCall />, details: "All time" },
];


  return (
    <motion.div
      className="flex-1 space-y-8 p-4 md:p-8 pt-6"
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
    >
      <motion.div className="flex items-center justify-between space-y-2" variants={FADE_IN_VARIANTS}>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {overviewCards.map((card, index) => (
          <motion.div key={index} variants={FADE_IN_VARIANTS}>
            <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className="text-primary">{card.icon}</div>
              </CardHeader>
              <CardContent>
                {isLoadingStats || (card.title === 'Total Revenue' && isLoadingRevenue) ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{card.value}</div>}
                <p className="text-xs text-muted-foreground">{card.details}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7" variants={FADE_IN_VARIANTS}>
        <Card className="lg:col-span-4 bg-card/50 border-border/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
             <Select value={selectedYear.toString()} onValueChange={(year) => setSelectedYear(parseInt(year))}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingRevenue ? (
              <div className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    No revenue data available for {selectedYear}.
                </div>
             )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-card/50 border-border/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Appointments by Reason</CardTitle>
            <CardDescription>Distribution of primary eye problems.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoadingStats ? (
                <div className="flex items-center justify-center h-[350px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             ) : appointmentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>

<PieChart>
  <Pie
    data={appointmentDistribution}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={120}
  >
    {appointmentDistribution.map((entry, idx) => (
      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
    ))}
  </Pie>
  <Tooltip content={<CustomTooltip />} />
</PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    No appointment data available.
                </div>
             )}
          </CardContent>
        </Card>
      </motion.div>

       <motion.div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2" variants={FADE_IN_VARIANTS}>
            <Card className="bg-card/50 border-border/20 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarCheck className="text-primary"/>Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingStats ? (
                        <Skeleton className="h-48 w-full"/>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentAppointments.slice(0, 3).map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>{app.name}</TableCell>
                                    <TableCell>{app.eyeProblems.join(', ')}</TableCell>
                                    <TableCell>{app.preferredDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={app.status === 'Confirmed' ? 'default' : app.status === 'Completed' ? 'secondary' : 'destructive'}
                                          className={`${app.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : app.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-primary' }`}
                                        >{app.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/20 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PhoneCall className="text-primary"/>Recent Callback Requests</CardTitle>
                </CardHeader>
                <CardContent>
                     {isLoadingStats ? (
                        <Skeleton className="h-48 w-full"/>
                     ) : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentCallbacks.slice(0, 3).map(cb => (
                                <TableRow key={cb.id}>
                                    <TableCell>{cb.name}</TableCell>
                                    <TableCell>{cb.phone}</TableCell>
                                    <TableCell>{cb.address}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline"
                                            className={`${!cb.completed ? 'border-amber-400 text-amber-400' : 'border-green-400 text-green-400'}`}
                                        >{cb.completed ? 'Completed' : 'Pending'}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    </motion.div>
  );
}

    