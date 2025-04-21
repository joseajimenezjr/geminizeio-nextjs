import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Favicon-dark-TCRh0L4cFUo5bEkp6OVorSUlogaWFf.png"
              alt="Geminize IO"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Geminize IO</h1>
          <p className="text-xl mb-8">The future of off-road accessory management is coming soon.</p>
          <div className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Beta User Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Geminize IO. All rights reserved.
      </footer>
    </div>
  )
}
