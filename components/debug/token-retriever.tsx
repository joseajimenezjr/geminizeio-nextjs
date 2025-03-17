"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, Check, RefreshCw, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TokenRetriever() {
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [manualToken, setManualToken] = useState("")

  // For direct retrieval from Supabase client
  const supabase = createClientComponentClient()

  const getTokenFromLocalStorage = () => {
    console.log("Checking localStorage for token...")

    // Find the Supabase token in localStorage
    let supabaseKey: string | null = null
    const allKeys: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        allKeys.push(key)
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          supabaseKey = key
          break
        }
      }
    }

    console.log("All localStorage keys:", allKeys)

    if (!supabaseKey) {
      console.log("No Supabase key found in localStorage")

      // Try a different approach - look for any key containing Supabase data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value && value.includes('"access_token"')) {
            supabaseKey = key
            console.log("Found potential Supabase data in key:", key)
            break
          }
        }
      }

      if (!supabaseKey) {
        return null
      }
    }

    // Get the token data
    const tokenData = localStorage.getItem(supabaseKey)
    console.log("Found token data for key:", supabaseKey)

    if (!tokenData) {
      return null
    }

    // Parse the JSON data
    try {
      const parsed = JSON.parse(tokenData)
      console.log("Parsed token data:", parsed)

      const accessToken = parsed.access_token

      if (!accessToken) {
        return null
      }

      return accessToken
    } catch (error) {
      console.error("Error parsing token data:", error)
      return null
    }
  }

  const getCookieValue = (name: string) => {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      // Check if this cookie starts with the name we're looking for
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1)
      }
    }
    return null
  }

  const getTokenFromCookies = () => {
    console.log("Checking cookies for token...")

    // Try to find supabase cookie
    const supabaseCookie = getCookieValue("supabase-auth-token")

    if (supabaseCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(supabaseCookie))
        console.log("Parsed cookie data:", parsed)

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0] // The access token is usually the first item
        }
      } catch (error) {
        console.error("Error parsing cookie data:", error)
      }
    }

    return null
  }

  const getTokenDirectly = async () => {
    console.log("Trying to get token directly from Supabase client...")

    try {
      const { data } = await supabase.auth.getSession()
      console.log("Session data:", data)

      if (data && data.session) {
        return data.session.access_token
      }
    } catch (error) {
      console.error("Error getting session:", error)
    }

    return null
  }

  const getToken = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log("Getting token...")

      // Try localStorage first
      let accessToken = getTokenFromLocalStorage()

      // Then try cookies
      if (!accessToken) {
        accessToken = getTokenFromCookies()
      }

      // Then try direct Supabase client
      if (!accessToken) {
        accessToken = await getTokenDirectly()
      }

      if (accessToken) {
        console.log("Found token:", accessToken)
        setToken(accessToken)
        setIsDialogOpen(true)
      } else {
        setErrorMessage("Could not find a Supabase access token. Try manually retrieving your token.")
        setIsDialogOpen(true)
      }
    } catch (error: any) {
      console.error("Error retrieving token:", error)
      setErrorMessage(error.message || "An unexpected error occurred")
      setIsDialogOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!token) return

    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)

      toast({
        title: "Copied to clipboard",
        description: "Your access token has been copied to clipboard",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error: any) {
      console.error("Failed to copy:", error)
      toast({
        title: "Failed to copy",
        description: error.message || "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const useManualToken = () => {
    if (manualToken.trim()) {
      setToken(manualToken.trim())
      setManualToken("")
      toast({
        title: "Token set",
        description: "Your manually entered token has been set",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Get Access Token</CardTitle>
          <CardDescription>Retrieve your current Supabase access token for use in preview mode</CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                Your Access Token:
              </label>
              <div className="flex">
                <Input id="token" value={token} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This token will expire, typically after 1 hour. You'll need to get a new one after it expires.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click the button below to retrieve your current access token. You must be logged in to use this feature.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={getToken} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrieving...
              </>
            ) : token ? (
              "Get New Token"
            ) : (
              "Get My Access Token"
            )}
          </Button>

          {!token && (
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Paste token manually..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="font-mono text-xs"
              />
              <Button variant="outline" size="sm" onClick={useManualToken} disabled={!manualToken.trim()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{token ? "Token Retrieved" : "Token Not Found"}</DialogTitle>
            <DialogDescription>
              {token
                ? "Your Supabase access token has been successfully retrieved."
                : "We couldn't automatically find your Supabase access token."}
            </DialogDescription>
          </DialogHeader>

          {token ? (
            <div className="space-y-2">
              <p className="text-sm">You can now use this token for preview mode:</p>
              <div className="flex items-center space-x-2">
                <Input value={token} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <Alert>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <p className="text-sm">You can try these alternatives:</p>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">From Login</TabsTrigger>
                  <TabsTrigger value="console">From Console</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <p className="text-sm">To get your token after logging in:</p>
                  <ol className="text-sm list-decimal pl-5 space-y-2">
                    <li>Log out and log in again</li>
                    <li>Immediately after login, click "Get My Access Token"</li>
                    <li>The token should be available immediately after authentication</li>
                  </ol>
                </TabsContent>
                <TabsContent value="console" className="space-y-4">
                  <p className="text-sm">To get your token from the browser console:</p>
                  <ol className="text-sm list-decimal pl-5 space-y-2">
                    <li>Press F12 to open browser Developer Tools</li>
                    <li>Go to the "Application" tab</li>
                    <li>In the left sidebar, expand "Local Storage"</li>
                    <li>Click on your site's domain</li>
                    <li>Look for a key starting with "sb-"</li>
                    <li>Copy the value and find the "access_token" field</li>
                  </ol>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            {token && <Button onClick={copyToClipboard}>{copied ? "Copied!" : "Copy to Clipboard"}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

