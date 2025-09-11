import { AuthForm } from '@/components/opticare/AuthForm';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-4 left-4">
         <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Eye className="h-7 w-7 text-primary" />
            <span className="font-headline">CareOptics</span>
        </Link>
       </div>
      <AuthForm />
    </div>
  );
}
