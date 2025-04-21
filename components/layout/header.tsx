"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { BluetoothNavButton } from "./bluetooth-nav-button"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const isControlCenter = pathname?.includes("/control-center")

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/geminize-logo.png" alt="Geminize Logo" width={32} height={32} className="rounded-sm" />
            <span className="font-bold">Geminize</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {!isControlCenter && <BluetoothNavButton />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
