import Link from 'next/link';
import { Eye, Twitter, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Eye className="h-7 w-7 text-primary" />
              <span className="font-headline">CareOptics</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Revolutionizing eye care for the digital age.
            </p>
          </div>
          <div className="grid grid-cols-2 md:col-span-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-3 font-headline">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 font-headline">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 font-headline">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CareOptics. All rights reserved.</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="GitHub"><Github className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
