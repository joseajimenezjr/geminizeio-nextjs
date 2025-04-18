import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>There was a problem with the authentication process.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This could be due to an expired or invalid link, or a problem with the authentication service.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
