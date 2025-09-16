"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  onClick?: () => void
}

type BottomNavProps = {
  items: NavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur-sm">
      <div className="grid h-16 grid-cols-5 items-center justify-items-center px-2">
        {items.map((item) => {
          const isActive = (pathname === '/' && item.href === '/') || (item.href !== '/' && pathname.startsWith(item.href))
          
          if (item.onClick) {
            return (
              <button
                key={item.href}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors w-full",
                  "hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors w-full",
                isActive ? "text-primary bg-primary/10" : "hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}