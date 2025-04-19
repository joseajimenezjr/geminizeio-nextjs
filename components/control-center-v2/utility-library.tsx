"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BatteryFull, Clock, CloudSun, Thermometer, X } from "lucide-react"

interface UtilityLibraryProps {
  existingWidgets: any[]
  onAddUtility: (utilityType: string) => void
  onClose: () => void
  // Add this new prop
  hasTemperatureSensor?: boolean
}

export function UtilityLibrary({ existingWidgets, onAddUtility, onClose, hasTemperatureSensor }: UtilityLibraryProps) {
  // Define available utility widgets
  const utilityWidgets = [
    {
      id: "weather",
      name: "Weather",
      description: "Display current weather conditions",
      icon: CloudSun,
    },
    {
      id: "timer",
      name: "Timer",
      description: "Stopwatch and lap timer",
      icon: Clock,
    },
    {
      id: "battery",
      name: "Battery",
      description: "Monitor battery levels",
      icon: BatteryFull,
    },
  ]

  // Check if a utility widget already exists
  const isWidgetAdded = (widgetId: string) => {
    return existingWidgets.some((widget) => widget.type === widgetId)
  }

  return (
    <Card className="border-gray-800 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Add Utility Widget</CardTitle>
          <CardDescription>Select a utility widget to add to your control center</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {utilityWidgets.map((widget) => {
            const isAdded = isWidgetAdded(widget.id)
            return (
              <Card
                key={widget.id}
                className={`cursor-pointer border-gray-800 transition-colors hover:bg-muted/50 ${
                  isAdded ? "opacity-50" : ""
                }`}
                onClick={() => {
                  if (!isAdded) {
                    onAddUtility(widget.id)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <widget.icon className="mb-2 h-8 w-8" />
                    <h3 className="font-medium">{widget.name}</h3>
                    <p className="text-xs text-muted-foreground">{widget.description}</p>
                    {isAdded && <p className="mt-2 text-xs text-amber-500">Already added</p>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {hasTemperatureSensor && (
            <Card
              className={`cursor-pointer border-gray-800 transition-colors hover:bg-muted/50 ${
                isWidgetAdded("temperature") ? "opacity-50" : ""
              }`}
              onClick={() => {
                if (!isWidgetAdded("temperature")) {
                  onAddUtility("temperature")
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Thermometer className="mb-2 h-8 w-8" />
                  <h3 className="font-medium">Temperature</h3>
                  <p className="text-xs text-muted-foreground">Monitor temperature readings</p>
                  {isWidgetAdded("temperature") && <p className="mt-2 text-xs text-amber-500">Already added</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-800 px-6 py-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  )
}
