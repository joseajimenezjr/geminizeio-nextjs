"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DatabaseChecker() {
  const [profilesExist, setProfilesExist] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileCount, setProfileCount] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Try to query the Profiles table directly
        const { count, error: countError } = await supabase.from("Profiles").select("*", { count: "exact", head: true })

        if (countError) {
          setProfilesExist(false)
          setError(`Profiles table error: ${countError.message}`)
          setLoading(false)
          return
        }

        setProfilesExist(true)
        setProfileCount(count || 0)
        setError(null)
      } catch (error: any) {
        setError(error?.message || "Unexpected error")
        setProfilesExist(false)
      } finally {
        setLoading(false)
      }
    }

    checkDatabase()
  }, [supabase])

  const handleCreateProfile = async () => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        throw new Error("No active session")
      }

      const userId = sessionData.session.user.id
      const userEmail = sessionData.session.user.email

      // Default data
      const defaultDevices = [
        { id: 1, deviceName: "Light Bar", deviceType: "light", deviceSupportStatus: false },
        { id: 2, deviceName: "Spot Lights", deviceType: "light", deviceSupportStatus: false },
        { id: 3, deviceName: "Rock Lights", deviceType: "light", deviceSupportStatus: false },
        { id: 4, deviceName: "Winch", deviceType: "utility", deviceSupportStatus: false },
      ]

      const defaultGroups = [
        { id: "1", name: "Exterior Lights", active: false, devices: ["1", "2"] },
        { id: "2", name: "Interior Lights", active: false, devices: ["3"] },
        { id: "3", name: "Utility", active: false, devices: ["4"] },
      ]

      // Create profile
      const { error: insertError } = await supabase.from("Profiles").insert({
        id: userId,
        email: userEmail,
        vehicleName: "My Vehicle",
        devices: defaultDevices,
        groups: defaultGroups,
      })

      if (insertError) {
        throw insertError
      }

      setProfilesExist(true)
      setProfileCount((prev) => (prev || 0) + 1)
      setError(null)

      // Refresh the page to load the new profile data
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    } catch (error: any) {
      setError(error?.message || "Failed to create profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Checking database...</p>
        ) : (
          <div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Profiles Table:</h3>
              {profilesExist === true ? (
                <div>
                  <p className="text-xs text-green-500 mb-2">✅ Profiles table exists</p>
                  <p className="text-xs">Total profiles: {profileCount}</p>
                </div>
              ) : profilesExist === false ? (
                <>
                  <p className="text-xs text-red-500 mb-2">❌ Profiles table does not exist or cannot be accessed</p>
                  <Button size="sm" onClick={handleCreateProfile} disabled={loading}>
                    Create My Profile
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Unknown status</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

