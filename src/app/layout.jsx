import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: 'CareOtpics - Modern Eyewear & Eye Care',
  description: 'Discover the future of eye care with OptiCare. Find the perfect eyewear and get comprehensive eye exams, all in one place.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
