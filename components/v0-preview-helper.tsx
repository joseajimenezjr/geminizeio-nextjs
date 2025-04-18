"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { setPreviewMode } from "@/lib/preview-mode"
import { useRouter } from "next/navigation"

export function V0PreviewHelper() {
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isV0Environment, setIsV0Environment] = useState(false)

  useEffect(() => {
    // Check if we're in the V0 environment
    setIsV0Environment(
      typeof window !== "undefined" &&
        (window.location.hostname.includes("v0.dev") ||
          window.location.hostname.includes("vercel-v0") ||
          window.location.search.includes("v0preview=true")),
    )
  }, [])

  // Only show this component in V0 environment
  if (!isV0Environment) {
    return null
  }

  const handleActivatePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!token) {
        throw new Error("Token is required")
      }

      // Set preview mode
      setPreviewMode(token, email || undefined)

      // Redirect to dashboard with preview mode
      router.push("/dashboard?preview_mode=true")
    } catch (error: any) {
      setError(error.message || "Failed to activate preview mode")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>V0 Preview Mode Helper</CardTitle>
        <CardDescription>This tool is only visible in the V0 environment</CardDescription>
      </CardHeader>
      <form onSubmit={handleActivatePreview}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Access Token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Supabase access token"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Activating..." : "Activate Preview Mode"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
