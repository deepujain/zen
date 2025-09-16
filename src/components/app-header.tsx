
"use client"

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { format } from 'date-fns'
import { Button } from './ui/button'
import { PanelLeft, LogOut, ReceiptText } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet'
import Link from 'next/link'
import { navItems } from './app-layout-client'
import { useToast } from '@/hooks/use-toast'

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);


  const getTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/sales')) return 'Sales'
    if (pathname.startsWith('/expenses')) return 'Expenses'
    if (pathname.startsWith('/staff/attendance')) return 'Daily Attendance'
    if (pathname.startsWith('/staff/')) return 'Staff Details'
    if (pathname.startsWith('/staff')) return 'Staff'
    if (pathname.startsWith('/about')) return 'About'
    return 'Dashboard'
  }

  const handleLogout = () => {
    localStorage.removeItem('zenflow-auth');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
    router.replace('/login');
  }

  const displayDate = new Date();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
       <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full overflow-hidden shadow-sm border-2 border-primary/20 bg-white md:text-base"
            >
              <img 
                src="/images/Waves.jpg" 
                alt="Zen 🪷 Logo" 
                className="w-full h-full object-cover transition-all group-hover:scale-110"
                onError={(e) => {
                  // Fallback to SVG if image doesn't load
                  const container = (e.target as HTMLImageElement).parentElement!;
                  container.innerHTML = `<div class="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-all group-hover:scale-110">
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
              <span className="sr-only">Zen 🪷</span>
            </Link>
            {navItems.map(item => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
             <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
                <LogOut className="h-5 w-5" />
                Logout
            </button>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full overflow-hidden shadow-sm border-2 border-primary/20 bg-white">
              <img 
                src="/images/Waves.jpg" 
                alt="Zen 🪷 Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to SVG if image doesn't load
                  const container = (e.target as HTMLImageElement).parentElement!;
                  container.innerHTML = `<div class="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <span className="text-xl font-bold">Zen 🪷</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-xl font-bold font-headline">{getTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{format(displayDate, "eeee, MMMM d, yyyy")}</span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
            </Button>
        </div>
      </div>
    </header>
  )
}
