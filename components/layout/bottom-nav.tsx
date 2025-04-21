"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Settings, Lightbulb, ShoppingBag, Gauge } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      name: "Accessories",
      href: "/accessories",
      icon: Lightbulb,
      active: pathname === "/accessories" || pathname?.startsWith("/accessories/"),
    },
    {
      name: "Control",
      href: "/control-center-v2",
      icon: Gauge,
      active: pathname === "/control-center-v2",
    },
    {
      name: "Shop",
      href: "/shop",
      icon: ShoppingBag,
      active: pathname === "/shop",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 z-10 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center",
              item.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
