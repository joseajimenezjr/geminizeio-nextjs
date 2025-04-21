"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Lightbulb, Settings, ShoppingBag } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-black border-t border-gray-800">
      <div className="grid h-full grid-cols-5 mx-auto">
        {/* Home */}
        <Link
          href="/control-center-v2"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            pathname === "/" || pathname === "/control-center" || pathname === "/control-center-v2"
              ? "text-primary"
              : "text-gray-300"
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </Link>

        {/* Accessories */}
        <Link
          href="/accessories"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            pathname === "/accessories" ? "text-primary" : "text-gray-300"
          }`}
        >
          <Lightbulb className="w-5 h-5 mb-1" />
          <span className="text-xs">Accessories</span>
        </Link>

        {/* Logo in the middle */}
        <Link href="/control-center-v2" className="inline-flex flex-col items-center justify-center relative">
          <div className="absolute -top-5 bg-black rounded-full p-2 border-2 border-gray-800">
            <Image src="/images/geminize-logo.png" alt="Geminize" width={40} height={40} className="rounded-full" />
          </div>
        </Link>

        {/* Shop */}
        <Link
          href="/shop"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            pathname === "/shop" ? "text-primary" : "text-gray-300"
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-1" />
          <span className="text-xs">Shop</span>
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className={`inline-flex flex-col items-center justify-center px-5 ${
            pathname === "/settings" ? "text-primary" : "text-gray-300"
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </Link>
      </div>
    </div>
  )
}
