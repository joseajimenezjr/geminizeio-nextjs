"use client"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  Wrench,
  Gauge,
  GaugeIcon as Speedometer,
  CloudLightningIcon as ChaseLightIcon,
  Palette,
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
                {accessory.accessoryType === "light" && <Lightbulb className="h-8 w-8 mb-2" />}
                {accessory.accessoryType === "utility" && <Wrench className="h-8 w-8 mb-2" />}
                {accessory.accessoryType === "gauge" && <Gauge className="h-8 w-8 mb-2" />}
                {accessory.accessoryType === "obd2" && <Speedometer className="h-8 w-8 mb-2" />}
                {accessory.accessoryType === "chaseLight" && <ChaseLightIcon className="h-8 w-8 mb-2" />}
                {accessory.accessoryType === "rgbLight" && <Palette className="h-8 w-8 mb-2" />}
                <div className="font-medium">{accessory.accessoryName}</div>
                <div className="text-xs text-muted-foreground">
                  {accessory.accessoryType === "light" && "Toggle Light"}
                  {accessory.accessoryType === "utility" && "Utility"}
                  {accessory.accessoryType === "gauge" && "Gauge"}
                  {accessory.accessoryType === "obd2" && "OBDII"}
                  {accessory.accessoryType === "chaseLight" && "Multi Toggle Light"}
                  {accessory.accessoryType === "rgbLight" && "RGB Lights with Toggle"}
                  {accessory.accessoryType === "turnSignal" && "Turn Signal Lights"}
                  {accessory.accessoryType === "temp_reader" && "Temperature Reader"}
                  {accessory.accessoryType === "winch" && "Winch"}
                  {![
                    "light",
                    "utility",
                    "gauge",
                    "obd2",
                    "chaseLight",
                    "rgbLight",
                    "turnSignal",
                    "temp_reader",
                    "winch",
                  ].includes(accessory.accessoryType) && accessory.accessoryType}
                </div>
                {hasWidget && <div className="text-xs text-amber-500 mt-1">Already added</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
