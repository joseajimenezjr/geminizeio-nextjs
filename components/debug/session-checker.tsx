"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SessionChecker() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cookies, setCookies] = useState<string[]>([])
  const [storageData, setStorageData] = useState<any>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get all cookies for debugging
        if (typeof document !== "undefined") {
          const allCookies = document.cookie.split(";").map((cookie) => cookie.trim())
          setCookies(allCookies)
        }

        // Check localStorage for any Supabase data
        if (typeof window !== "undefined") {
          const localStorageItems: Record<string, any> = {}

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key) {
              try {
                const value = localStorage.getItem(key)
                // Check if it's a JSON object
                try {
                  localStorageItems[key] = JSON.parse(value || "")
                } catch {
                  localStorageItems[key] = value
                }
              } catch (e) {
                localStorageItems[key] = "[Error reading value]"
              }
            }
          }

          setStorageData(localStorageItems)
        }

        // Get the session from Supabase
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setError(error.message)
          setSessionInfo(null)
        } else {
          setSessionInfo(data)
          setError(null)
        }
      } catch (error: any) {
        setError(error?.message || "Unexpected error")
        setSessionInfo(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Add event listener for session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSessionInfo({ session })
        setError(null)
      } else if (event === "SIGNED_OUT") {
        setSessionInfo(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)

    try {
      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        setError("No active session to refresh")
        setSessionInfo(null)
        setLoading(false)
        return
      }

      // If we have a session, try to refresh it
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        setError(error.message)
        setSessionInfo(null)
      } else {
        setSessionInfo({ session: data.session })
        setError(null)
      }
    } catch (error: any) {
      setError(error?.message || "Unexpected error")
      setSessionInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setSessionInfo(null)
      setError(null)
      window.location.href = "/"
    } catch (error: any) {
      setError(error?.message || "Error signing out")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Session Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Checking session...</p>
        ) : (
          <div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {sessionInfo?.session ? (
              <>
                <div className="mb-2">
                  <strong>Status:</strong> <span className="text-green-500">Authenticated</span>
                </div>
                <div className="mb-2">
                  <strong>User ID:</strong> {sessionInfo.session.user?.id}
                </div>
                <div className="mb-2">
                  <strong>Email:</strong> {sessionInfo.session.user?.email}
                </div>
                <div className="mb-2">
                  <strong>Expires:</strong> {new Date(sessionInfo.session.expires_at * 1000).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="mb-4">
                <strong>Status:</strong> <span className="text-red-500">Not authenticated</span>
              </div>
            )}

            <div className="space-x-2 mb-4">
              <Button onClick={handleRefresh} disabled={!sessionInfo?.session || loading}>
                Refresh Session
              </Button>

              {sessionInfo?.session && (
                <Button onClick={handleSignOut} variant="outline" disabled={loading}>
                  Sign Out
                </Button>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Cookies:</h3>
              {cookies.length > 0 ? (
                <ul className="text-xs bg-muted p-2 rounded-md">
                  {cookies.map((cookie, index) => (
                    <li key={index}>{cookie}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No cookies found</p>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Local Storage:</h3>
              {Object.keys(storageData).length > 0 ? (
                <details>
                  <summary className="cursor-pointer text-xs">View localStorage data</summary>
                  <pre className="text-xs bg-muted p-2 rounded-md mt-2 overflow-auto max-h-60">
                    {JSON.stringify(storageData, null, 2)}
                  </pre>
                </details>
              ) : (
                <p className="text-xs text-muted-foreground">No localStorage data found</p>
              )}
            </div>

            {sessionInfo && (
              <div className="mt-4">
                <details>
                  <summary className="cursor-pointer text-sm text-muted-foreground">Show session details</summary>
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs mt-2">
                    {JSON.stringify(sessionInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
