
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, Menu, User, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const navLinks = [
  { href: '/products/allItems', label: 'Eyeframes' },
  { href: '/eyetest', label: 'Eye Test' },  
  { href: '/appointment', label: 'Book' },              // general appointment
  { href: '/doctor-appointment', label: "Doctor Appointment" },     // doctor-specific
];


export function Header({ onOpenAuth }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: '', email: '' });
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we are in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
        setUser({
          name: localStorage.getItem('userName') || 'User',
          email: localStorage.getItem('userEmail') || 'user@example.com'
        });
        setUserRole(localStorage.getItem('userRole'));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleProfileClick = () => {
      if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
  };
  
  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Eye className="h-6 w-6 text-primary" />
          <span className='font-headline'>CareOptics</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={handleCartClick}>
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Button>
          {isLoggedIn ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} alt={user.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onOpenAuth}>Get Started</Button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCartClick}>
                <ShoppingCart className="h-6 w-6" />
                <span className="sr-only">Cart</span>
            </Button>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setIsMenuOpen(false)}>
                  <Eye className="h-6 w-6 text-primary" />
                  CareOptics
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link key={link.label} href={link.href} className="text-base font-medium text-muted-foreground transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {isLoggedIn ? (
                  <>
                   <Button onClick={() => { handleProfileClick(); setIsMenuOpen(false); }} className="mt-4">Profile</Button>
                   <Button variant="outline" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="mt-2">Logout</Button>
                  </>
                ) : (
                  <Button onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} className="mt-4">Get Started</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
