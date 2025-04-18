import Link from "next/link"
import { MainNav } from "./main-nav"
import { MobileNav } from "./mobile-nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BluetoothNavButton } from "./bluetooth-nav-button"
import { VoiceControl } from "@/components/voice-control/voice-control"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/control-center" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">Geminize IO</span>
        </Link>
        <div className="hidden md:flex md:flex-1">
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <VoiceControl />
          <BluetoothNavButton />
          <Button asChild size="sm">
            <Link href="/accessories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Accessory
            </Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
