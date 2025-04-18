"use client"

import { Button } from "@/components/ui/button"
import { X, Gauge } from "lucide-react"

interface OBDIILibraryProps {
  existingWidgets: any[]
  onAddOBDII: (obdiiType: string) => void
  onClose: () => void
}

export function OBDIILibrary({ existingWidgets, onAddOBDII, onClose }: OBDIILibraryProps) {
  // Check if speed display widget already exists
  const hasSpeedWidget = existingWidgets.some((widget) => widget.type === "speed-display")

  // Check if RPM display widget already exists
  const hasRPMWidget = existingWidgets.some((widget) => widget.type === "rpm-display")

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Add OBD2 Widget</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={`flex flex-col items-center justify-center p-4 border rounded-md ${
              hasSpeedWidget ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/10 cursor-pointer"
            }`}
            onClick={() => {
              if (!hasSpeedWidget) {
                onAddOBDII("speed-display")
                onClose()
              }
            }}
          >
            <Gauge className="h-8 w-8 mb-2" />
            <div className="font-medium">Speed</div>
            <div className="text-xs text-muted-foreground">Current vehicle speed</div>
            {hasSpeedWidget && <div className="text-xs text-amber-500 mt-1">Already added</div>}
          </div>

          <div
            className={`flex flex-col items-center justify-center p-4 border rounded-md ${
              hasRPMWidget ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/10 cursor-pointer"
            }`}
            onClick={() => {
              if (!hasRPMWidget) {
                onAddOBDII("rpm-display")
                onClose()
              }
            }}
          >
            <Gauge className="h-8 w-8 mb-2" />
            <div className="font-medium">RPM</div>
            <div className="text-xs text-muted-foreground">Engine RPM</div>
            {hasRPMWidget && <div className="text-xs text-amber-500 mt-1">Already added</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
