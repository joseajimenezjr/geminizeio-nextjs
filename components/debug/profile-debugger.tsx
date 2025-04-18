"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDebugMode } from "@/hooks/use-debug-mode"
import { fetchWithAuth } from "@/utils/api-utils"

export function ProfileDebugger() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const isDebugMode = useDebugMode()

  if (!isDebugMode) return null

  const checkProfiles = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth("/api/debug/check-profiles")
      setData(response)
    } catch (error: any) {
      console.error("Error checking profiles:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Profiles Table Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkProfiles} disabled={loading} size="sm" className="mb-4">
          {loading ? "Checking..." : "Check Profiles Table"}
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-medium mb-1">User Info:</h3>
              <div className="bg-muted p-2 rounded-md">
                <p>User ID: {data.userId}</p>
                <p>Email: {data.userEmail}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-1">Available Tables:</h3>
              <div className="bg-muted p-2 rounded-md overflow-auto max-h-20">
                {data.tables?.length > 0 ? (
                  <ul>
                    {data.tables.map((table: string, index: number) => (
                      <li key={index}>{table}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No tables found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-1">Profiles Table Structure:</h3>
              <div className="bg-muted p-2 rounded-md overflow-auto max-h-40">
                {data.columns?.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Column</th>
                        <th className="text-left">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.columns.map((col: any, index: number) => (
                        <tr key={index}>
                          <td>{col.column_name}</td>
                          <td>{col.data_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No columns found</p>
                )}
              </div>
            </div>

            {data.profile ? (
              <div>
                <h3 className="font-medium mb-1">Profile Data:</h3>
                <div className="bg-muted p-2 rounded-md overflow-auto max-h-60">
                  <pre>{JSON.stringify(data.profile, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-1">Sample Profiles:</h3>
                <div className="bg-muted p-2 rounded-md overflow-auto max-h-40">
                  {data.sampleProfiles?.length > 0 ? (
                    <ul>
                      {data.sampleProfiles.map((profile: any, index: number) => (
                        <li key={index}>
                          ID: {profile.id}, Email: {profile.email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No sample profiles found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
