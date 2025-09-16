"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate an API call
    setTimeout(() => {
      if (username === 'waves' && password === 'waves@0904') {
        // In a real app, you would get a token from your backend
        localStorage.setItem('wavesflow-auth', JSON.stringify({ user: 'waves', role: 'Manager' }));
        localStorage.setItem('wavesflow-show-confetti', 'true');
        router.replace('/'); 
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password.",
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-4">
          <CardHeader className="text-center">
              <div className="flex justify-center items-center mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-2 border-primary/20 bg-white">
                      <img 
                        src="/images/Waves.jpg"
                        alt="Zen 🪷 Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to original icon if image doesn't load
                          const container = (e.target as HTMLImageElement).parentElement!;
                          container.innerHTML = `<div class="w-full h-full bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                              <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                              <path d="M12 17a5 5 0 0 0-5-5"/>
                              <path d="M17 12a5 5 0 0 0-5-5"/>
                              <path d="M12 7a5 5 0 0 0 5 5"/>
                              <path d="M7 12a5 5 0 0 0 5 5"/>
                            </svg>
                          </div>`;
                        }}
                      />
                  </div>
              </div>
            <CardTitle className="text-2xl font-bold mb-2">Zen 🪷</CardTitle>
            <CardDescription>
              Enter your credentials
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="waves"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
          </CardContent>
      </Card>
    </div>
  );
}
