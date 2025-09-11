
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingCart, Calendar, Star, LogOut, Loader2, KeyRound, FileText, Stethoscope } from 'lucide-react';
import { getCart } from '@/lib/cartApi';
import { getUserAppointments } from '@/lib/appointmentApi';
import { getMyReviews } from '@/lib/reviewApi';
import { getMyTestHistory } from '@/lib/eyetestApi';
import { getMyDoctorAppointments } from '@/lib/doctorAppointmentApi';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { UpdatePasswordForm } from '@/components/opticare/UpdatePasswordForm';
import { EyeTestRecord } from '@/components/opticare/EyeTestRecord';


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const StaticStarRating = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground'}`} />
      ))}
    </div>
);

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState({ name: '', email: '' }); 
    const [cart, setCart] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [testHistory, setTestHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/auth');
            return;
        }

        const userName = localStorage.getItem('userName') || 'User';
        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
        setUser({ name: userName, email: userEmail });

        async function fetchData() {
            try {
                setIsLoading(true);
                const [cartRes, appointmentsRes, reviewsRes, testHistoryRes, doctorAppointmentsRes] = await Promise.all([
                    getCart(),
                    getUserAppointments(),
                    getMyReviews(),
                    getMyTestHistory(),
                    getMyDoctorAppointments(),
                ]);
                setCart(cartRes.data);
                setAppointments(appointmentsRes.data);
                setReviews(reviewsRes.data);
                setTestHistory(testHistoryRes.data);
                setDoctorAppointments(doctorAppointmentsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/');
    };

    if (isLoading) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading Your Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
             <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Eye className="h-7 w-7 text-primary" />
                        <span className="font-headline">OptiCare</span>
                    </Link>
                    <div className="flex items-center gap-4">
                         <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 py-12 md:py-20">
                 <div className="container mx-auto max-w-7xl px-4">
                     {/* User Profile Header */}
                    <motion.div 
                        className="flex flex-col items-center text-center mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Avatar className="h-28 w-28 mb-4 border-4 border-primary/50">
                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} alt={user.name} />
                            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-3xl md:text-4xl font-bold font-headline">{user.name}</h1>
                        <p className="text-muted-foreground mt-1">{user.email}</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8">
                         {/* My Cart Section */}
                        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                            <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-2xl font-headline"><ShoppingCart className="text-primary"/> My Cart</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {cart && cart.items.length > 0 ? (
                                        <div className="space-y-4">
                                            {cart.items.map(item => (
                                                 <div key={item.productId} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                                                    <Image src={item.imageUrl} alt={item.productName} width={64} height={64} className="rounded-md object-cover" />
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{item.productName}</p>
                                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                                        <p className="text-sm text-muted-foreground font-semibold">Price: <span className="font-bold text-accent">₹{item.price.toFixed(2)}</span></p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-4 border-t border-border/20 mt-4">
                                                <Button asChild><Link href="/cart">View Full Cart & Checkout</Link></Button>
                                                <p className="text-xl font-bold">Total: <span className="text-accent">₹{cart.totalPrice.toFixed(2)}</span></p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* My Optician Appointments Section */}
                        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                             <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-3 text-2xl font-headline"><Calendar className="text-primary"/> Optician Appointments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {appointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {appointments.map(app => (
                                                <div key={app.id} className="grid grid-cols-2 md:grid-cols-4 items-start gap-4 p-3 rounded-lg bg-secondary/30">
                                                    <div className="md:col-span-2">
                                                        <p className="font-semibold text-muted-foreground text-sm">Reason:</p>
                                                        <p className="font-semibold">{app.eyeProblems.join(', ')}{app.customProblem ? ` - ${app.customProblem}` : ''}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-muted-foreground text-sm">Date:</p>
                                                        <p className="font-semibold">{format(new Date(app.preferredDate), "PPP")} at {app.preferredTime}</p>
                                                    </div>
                                                    <div>
                                                         <p className="font-semibold text-muted-foreground text-sm">Status:</p>
                                                         <Badge variant={app.status === 'Confirmed' ? 'default' : 'secondary'}>{app.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                             <div className="flex justify-end pt-4 border-t border-border/20 mt-4">
                                                <Button asChild><Link href="/appointment">Book New Optician Appointment</Link></Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-4">You have no upcoming optician appointments.</p>
                                            <Button asChild><Link href="/appointment">Book an Appointment</Link></Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                         {/* My Doctor Appointments Section */}
                        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                             <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                                <CardHeader>
                                     <CardTitle className="flex items-center gap-3 text-2xl font-headline"><Stethoscope className="text-primary"/> Doctor's Appointments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {doctorAppointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {doctorAppointments.map(app => (
                                                <div key={app.id} className="grid grid-cols-2 md:grid-cols-4 items-start gap-4 p-3 rounded-lg bg-secondary/30">
                                                    <div>
                                                        <p className="font-semibold text-muted-foreground text-sm">Patient:</p>
                                                        <p className="font-semibold">{app.patientName}</p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <p className="font-semibold text-muted-foreground text-sm">Reason for Visit:</p>
                                                        <p>{app.reasonForVisit}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-muted-foreground text-sm">Date:</p>
                                                        <p className="font-semibold">{format(new Date(app.appointmentDate), "PPPp")}</p>
                                                    </div>
                                                </div>
                                            ))}
                                             <div className="flex justify-end pt-4 border-t border-border/20 mt-4">
                                                <Button asChild><Link href="/doctor-appointment">Book New Doctor's Appointment</Link></Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground mb-4">You have no upcoming doctor's appointments.</p>
                                            <Button asChild><Link href="/doctor-appointment">Book a Doctor's Appointment</Link></Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                         {/* Eye Test History Section */}
                        <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
                            <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-2xl font-headline"><FileText className="text-primary"/> My Eye Test History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {testHistory.length > 0 ? (
                                        <div className="space-y-4">
                                            {testHistory.map(test => (
                                                <EyeTestRecord key={test.testId} test={test} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">You have no eye test records yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                        {/* My Reviews Section */}
                        <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants}>
                            <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-2xl font-headline"><Star className="text-primary"/> My Reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {reviews.map(review => (
                                                 <div key={review.id} className="p-3 rounded-lg bg-secondary/30">
                                                     <div className="flex items-center justify-between mb-2">
                                                        <p className="font-semibold">{review.productName || 'Product'}</p>
                                                        <StaticStarRating rating={review.rating} />
                                                     </div>
                                                    <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">You haven't written any reviews yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                         {/* Security Section */}
                        <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants}>
                            <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-2xl font-headline"><KeyRound className="text-primary"/> Security</CardTitle>
                                    <CardDescription>Update your password below. It's a good practice to use a strong password that you're not using elsewhere.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <UpdatePasswordForm />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
