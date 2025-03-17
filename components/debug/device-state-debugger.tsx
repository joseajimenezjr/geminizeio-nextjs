"use client"

import { useEffect } from "react"
import { useAccessories } from "@/contexts/device-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDebugMode } from "@/hooks/use-debug-mode"

export function DeviceStateDebugger() {
  const { accessories, isLoading } = useAccessories()
  const isDebugMode = useDebugMode()

  // Log when accessories change
  useEffect(() => {
    if (isDebugMode) {
      console.log("Accessory state updated:", accessories)
    }
  }, [accessories, isDebugMode])

  if (!isDebugMode) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Accessory State Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs space-y-2">
          <div>
            <strong>Loading States:</strong>
            <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto max-h-20">
              {JSON.stringify(isLoading, null, 2)}
            </pre>
          </div>
          <div>
            <strong>Accessories ({accessories.length}):</strong>
            <pre className="bg-muted p-2 rounded-md mt-1 overflow-auto max-h-60">
              {JSON.stringify(accessories, null, 2)}
            </pre>
          </div>
          <div className="mt-2">
            <strong>Last Update:</strong> {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

