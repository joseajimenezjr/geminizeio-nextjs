"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Package, Settings, LogOut } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PreviewAuthLink } from "@/components/preview-auth-link"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const routes = [
    {
      href: "/control-center",
      label: "Control Center",
      icon: Home,
      active: pathname === "/control-center",
    },
    {
      href: "/accessories",
      label: "Accessories",
      icon: Package,
      active: pathname === "/accessories" || pathname.startsWith("/accessories/"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Button key={route.href} variant={route.active ? "default" : "ghost"} asChild>
          <PreviewAuthLink
            href={route.href}
            className={cn(
              "flex items-center",
              route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
            )}
          >
            <route.icon className="mr-2 h-4 w-4" />
            <span>{route.label}</span>
          </PreviewAuthLink>
        </Button>
      ))}
      <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-primary">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </nav>
  )
}
