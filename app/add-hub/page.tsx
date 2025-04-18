import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddHubPage() {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Add Hub</h1>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Hub Setup</CardTitle>
            <CardDescription>Connect your central hub to manage all your accessories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is a placeholder for the hub setup flow. In a real implementation, this would guide the user through
              connecting their hub device.
            </p>
            <Button className="w-full">Start Setup</Button>
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  )
}
