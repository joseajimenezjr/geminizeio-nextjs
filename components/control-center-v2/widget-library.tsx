"use client"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  Wrench,
  Gauge,
  GaugeIcon as Speedometer,
  CloudLightningIcon as ChaseLightIcon,
  Navigation,
  AlertTriangle,
} from "lucide-react"
import { X } from "lucide-react"

interface WidgetLibraryProps {
  accessories: any[]
  existingWidgets: any[]
  onAddWidget: (widgetType: string, accessoryId: string) => void
  onClose: () => void
}

export function WidgetLibrary({ accessories, existingWidgets, onAddWidget, onClose }: WidgetLibraryProps) {
  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden max-w-2xl mx-auto">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Add Accessory Widget</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accessories.map((accessory) => {
            const hasWidget = existingWidgets.some((widget) => widget.accessoryId === accessory.accessoryID)
            const isTurnSignal = accessory.accessoryType === "turn-signal"
            const isHazardLight = accessory.accessoryType === "hazard-light"

            let icon = null
            switch (accessory.accessoryType) {
              case "light":
                icon = <Lightbulb className="h-8 w-8 mb-2" />
                break
              case "utility":
                icon = <Wrench className="h-8 w-8 mb-2" />
                break
              case "gauge":
                icon = <Gauge className="h-8 w-8 mb-2" />
                break
              case "obd2":
                icon = <Speedometer className="h-8 w-8 mb-2" />
                break
              case "chaseLight":
                icon = <ChaseLightIcon className="h-8 w-8 mb-2" />
                break
              case "turn-signal":
                icon = <Navigation className="h-8 w-8 mb-2" />
                break
              case "hazard-light":
                icon = <AlertTriangle className="h-8 w-8 mb-2" />
                break
              default:
                icon = <Lightbulb className="h-8 w-8 mb-2" />
                break
            }

            return (
              <div
                key={accessory.accessoryID}
                className={`flex flex-col items-center justify-center p-4 border rounded-md ${
                  hasWidget ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/10 cursor-pointer"
                }`}
                onClick={() => {
                  if (!hasWidget) {
                    onAddWidget(accessory.accessoryType, accessory.accessoryID)
                    onClose()
                  }
                }}
              >
                {icon}
                <div className="font-medium">{accessory.accessoryName}</div>
                <div className="text-xs text-muted-foreground">{accessory.accessoryType}</div>
                {hasWidget && <div className="text-xs text-amber-500 mt-1">Already added</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
