"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWithAuth } from "@/utils/api-utils"
import { isPreviewMode } from "@/utils/preview-auth"
import { useToast } from "@/hooks/use-toast"

export function PreviewModeExample() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  // Example function to toggle an accessory
  const toggleAccessory = async (id: string, newStatus: boolean) => {
    setLoading(true)
    setResult(null)

    try {
      // This will automatically include auth headers if in preview mode
      const response = await fetchWithAuth(`/api/accessories/${id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: newStatus }),
      })

      setResult(response)
      toast({
        title: "Success",
        description: `Accessory ${id} toggled to ${newStatus ? "on" : "off"}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle accessory",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isPreviewMode()) {
    return null // Only show in preview mode
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Preview Mode API Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">This example demonstrates how to make API calls in preview mode.</p>

        <div className="flex space-x-2">
          <Button onClick={() => toggleAccessory("D001", true)} disabled={loading}>
            Turn On Light Bar
          </Button>

          <Button onClick={() => toggleAccessory("D001", false)} disabled={loading} variant="outline">
            Turn Off Light Bar
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-2 bg-muted rounded-md">
            <p className="text-sm font-medium">API Response:</p>
            <pre className="text-xs overflow-auto mt-2">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
