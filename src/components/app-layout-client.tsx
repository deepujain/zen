"use client"

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/app-header'
import BottomNav from '@/components/bottom-nav'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ReceiptText, Users, Wallet, BrainCircuit, Info, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/sales', icon: ReceiptText, label: 'Sales' },
  { href: '/expenses', icon: Wallet, label: 'Expenses' },
  { href: '/staff', icon: Users, label: 'Staff' },
  { href: '/about', icon: Info, label: 'About' },
]

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('wavesflow-auth');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    });
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <AppHeader />
      <main className="flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6">
        {children}
      </main>
      <BottomNav items={[...navItems, { href: '#', icon: LogOut, label: 'Logout', onClick: handleLogout }]} />
    </div>
  )
}
