"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, ShoppingCart, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    {
      href: "/dashboard",
      label: "Home",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/accessories",
      label: "Accessories",
      icon: Package,
      active: pathname === "/accessories" || pathname.startsWith("/accessories/"),
    },
    // Logo will be inserted in the middle
    {
      href: "/shop",
      label: "Shop",
      icon: ShoppingCart,
      active: pathname === "/shop",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  // Split the links array to insert the logo in the middle
  const firstHalf = links.slice(0, 2)
  const secondHalf = links.slice(2)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        {firstHalf.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
              link.active ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Logo in the middle - now not a link */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Favicon-dark-TCRh0L4cFUo5bEkp6OVorSUlogaWFf.png"
              alt="Geminize IO"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </div>
        </div>

        {secondHalf.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
              link.active ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

