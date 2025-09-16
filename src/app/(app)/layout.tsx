
"use client";

import { useEffect, useState } from "react";
import AppLayoutClient from "@/components/app-layout-client";
import { useRouter } from "next/navigation";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ApiDataProvider } from '@/hooks/use-api-data';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();


  useEffect(() => {
    // In a real app, you'd have a more robust auth check (e.g., checking a token in localStorage or a cookie)
    const session = localStorage.getItem("wavesflow-auth");
    if (!session) {
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
      // Check if the confetti flag is set
      const shouldShowConfetti = localStorage.getItem("wavesflow-show-confetti");
      if (shouldShowConfetti === 'true') {
        setShowConfetti(true);
        // Immediately remove the flag to prevent re-triggering
        localStorage.removeItem("wavesflow-show-confetti");
      }
    }
  }, [router]);


  if (isAuthenticated === null) {
    // You can render a loading spinner here
    return (
        <div className="flex items-center justify-center min-h-screen">
            Loading...
        </div>
    );
  }

  return (
    <ApiDataProvider>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} onConfettiComplete={() => setShowConfetti(false)} />}
      <AppLayoutClient>{children}</AppLayoutClient>
    </ApiDataProvider>
  );
}
