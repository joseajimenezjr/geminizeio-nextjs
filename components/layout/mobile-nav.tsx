"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Lightbulb, Settings, LogOut, Menu } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push("/")
    router.refresh()
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/lights",
      label: "Lights",
      icon: Lightbulb,
      active: pathname === "/lights",
    },
    {
      href: "/accessories",
      label: "Accessories",
      icon: Lightbulb,
      active: pathname === "/accessories",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col space-y-4 py-4">
          <Link href="/dashboard" className="flex items-center space-x-2 px-2" onClick={() => setOpen(false)}>
            <span className="font-bold">Geminize IO</span>
          </Link>
          <div className="flex flex-col space-y-2">
            {routes.map((route) => (
              <Button key={route.href} variant={route.active ? "default" : "ghost"} className="justify-start" asChild>
                <Link
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center",
                    route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  <span>{route.label}</span>
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="justify-start text-muted-foreground hover:text-primary"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

