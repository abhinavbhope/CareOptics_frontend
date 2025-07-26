import { Header } from '@/components/opticare/Header';
import { Hero } from '@/components/opticare/Hero';
import { Features } from '@/components/opticare/Features';
import { HowItWorks } from '@/components/opticare/HowItWorks';
import { WhyOptiCare } from '@/components/opticare/WhyOptiCare';
import { Footer } from '@/components/opticare/Footer';

export default function Home() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <WhyOptiCare />
      </main>
      <Footer />
    </div>
  );
}
