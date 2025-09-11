"use client";
import { AuthForm } from "@/components/opticare/AuthForm";
import { Features } from "@/components/opticare/Features";
import { Footer } from "@/components/opticare/Footer";
import { Header } from "@/components/opticare/Header";
import { Hero } from "@/components/opticare/Hero";
import { HowItWorks } from "@/components/opticare/HowItWorks";
import { WhyOptiCare } from "@/components/opticare/WhyOptiCare";
import { useState, useEffect } from "react";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  // We add a key to the header to force a re-render when the user logs in
  const [headerKey, setHeaderKey] = useState(0);

  const handleLoginSuccess = () => {
    setShowAuth(false);
    setHeaderKey(prevKey => prevKey + 1); // Change key to force re-render
  };

  useEffect(() => {
    // This effect listens for the `storage` event, which fires when another tab changes localStorage.
    // This helps keep the login state consistent across tabs.
    const syncLogout = (event) => {
      if (event.key === 'authToken' && !event.newValue) {
         setHeaderKey(prevKey => prevKey + 1);
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, []);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <Header key={headerKey} onOpenAuth={() => setShowAuth(true)} />

      {showAuth && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAuth(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AuthForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      <main className="flex-1">
        <Hero onOpenAuth={() => setShowAuth(true)} />
        <Features />
        <HowItWorks />
        <WhyOptiCare />
      </main>
      <Footer />
    </div>
  );
}
