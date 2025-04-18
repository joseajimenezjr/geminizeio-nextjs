"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SessionTokenGetter() {
  const supabase = createClientComponentClient()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const getSessionToken = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      if (!data.session) {
        setError("No active session found. Please log in first.")
        return
      }

      // Extract and format the token info
      const tokenInfo = {
        accessToken: data.session.access_token,
        expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString(),
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
        },
      }

      setTokenInfo(tokenInfo)

      // Copy to clipboard
      await navigator.clipboard.writeText(tokenInfo.accessToken)

      toast({
        title: "Token retrieved and copied",
        description: "Your session token has been copied to clipboard",
      })
    } catch (err: any) {
      console.error("Error getting session:", err)
      setError(err.message || "An unexpected error occurred")

      toast({
        title: "Error retrieving token",
        description: err.message || "Failed to get session token",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Current Session Token</CardTitle>
        <CardDescription>Get your token directly from the current active session</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : tokenInfo ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Access Token:</p>
              <p className="bg-muted p-2 rounded text-xs font-mono break-all">{tokenInfo.accessToken}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">User ID:</p>
                <p className="text-sm">{tokenInfo.user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email:</p>
                <p className="text-sm">{tokenInfo.user.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Expires At:</p>
              <p className="text-sm">{tokenInfo.expiresAt}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click the button below to retrieve your current session token. This token can be used for preview mode.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getSessionToken} disabled={loading} className="w-full">
          {loading ? "Getting Token..." : tokenInfo ? "Refresh Token" : "Get Session Token"}
        </Button>
      </CardFooter>
    </Card>
  )
}
