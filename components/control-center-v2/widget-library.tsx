"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SpeedometerWidget } from "./widgets/speedometer-widget"
import { GaugeWidget } from "./widgets/gauge-widget"
import { StatusWidget } from "./widgets/status-widget"
import { WinchWidget } from "./widgets/winch-widget"
import { SpotLightsWidget } from "./widgets/spot-lights-widget"
import { LightbarWidget } from "./widgets/lightbar-widget"
import { SpeedDisplayWidget } from "./widgets/speed-display-widget"
import { RpmDisplayWidget } from "./widgets/rpm-display-widget"
import { StandaloneWinchWidget } from "./widgets/standalone-winch-widget"
import { SimpleWinchWidget } from "./widgets/simple-winch-widget"
import { UtilityWidget } from "./widgets/utility-widget"
import { WeatherWidget } from "./widgets/weather-widget"
import { ToggleWidget } from "./widgets/toggle-widget"
import { ChaseLightWidget } from "./widgets/chase-light-widget"
import { BatteryWidget } from "./widgets/battery-widget"
import { RGBLightWidget } from "./widgets/rgb-light-widget"
import { TimerWidget } from "./widgets/timer-widget"
import { TemperatureWidget } from "./widgets/temperature-widget"

interface WidgetLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectWidget: (widgetType: string) => void
}

export function WidgetLibrary({ open, onOpenChange, onSelectWidget }: WidgetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const widgetCategories = [
    { id: "all", name: "All" },
    { id: "gauges", name: "Gauges" },
    { id: "lights", name: "Lights" },
    { id: "winch", name: "Winch" },
    { id: "utility", name: "Utility" },
  ]

  const widgets = [
    {
      id: "speedometer",
      name: "Speedometer",
      category: "gauges",
      component: <SpeedometerWidget />,
    },
    {
      id: "gauge",
      name: "Gauge",
      category: "gauges",
      component: <GaugeWidget title="Gauge" value={50} />,
    },
    {
      id: "status",
      name: "Status",
      category: "utility",
      component: <StatusWidget title="Status" value="OK" />,
    },
    {
      id: "winch",
      name: "Winch",
      category: "winch",
      component: <WinchWidget />,
    },
    {
      id: "spotlights",
      name: "Spot Lights",
      category: "lights",
      component: <SpotLightsWidget />,
    },
    {
      id: "lightbar",
      name: "Light Bar",
      category: "lights",
      component: <LightbarWidget />,
    },
    {
      id: "speed-display",
      name: "Speed Display",
      category: "gauges",
      component: <SpeedDisplayWidget />,
    },
    {
      id: "rpm-display",
      name: "RPM Display",
      category: "gauges",
      component: <RpmDisplayWidget />,
    },
    {
      id: "standalone-winch",
      name: "Standalone Winch",
      category: "winch",
      component: <StandaloneWinchWidget />,
    },
    {
      id: "simple-winch",
      name: "Simple Winch",
      category: "winch",
      component: <SimpleWinchWidget />,
    },
    {
      id: "utility",
      name: "Utility",
      category: "utility",
      component: <UtilityWidget title="Utility" />,
    },
    {
      id: "weather",
      name: "Weather",
      category: "utility",
      component: <WeatherWidget />,
    },
    {
      id: "toggle",
      name: "Toggle",
      category: "utility",
      component: <ToggleWidget title="Toggle" />,
    },
    {
      id: "chase-light",
      name: "Chase Light",
      category: "lights",
      component: <ChaseLightWidget />,
    },
    {
      id: "battery",
      name: "Battery",
      category: "utility",
      component: <BatteryWidget title="Battery" percentage={75} />,
    },
    {
      id: "rgb-light",
      name: "RGB Light",
      category: "lights",
      component: <RGBLightWidget />,
    },
    {
      id: "timer",
      name: "Timer",
      category: "utility",
      component: <TimerWidget title="Timer" />,
    },
    {
      id: "temperature",
      name: "Temperature",
      category: "utility",
      component: <TemperatureWidget title="Temperature" />,
    },
  ]

  const filteredWidgets =
    selectedCategory === "all" ? widgets : widgets.filter((widget) => widget.category === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Widget Library</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 mb-4">
          {widgetCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredWidgets.map((widget) => (
            <div
              key={widget.id}
              className="border rounded-lg p-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                onSelectWidget(widget.id)
                onOpenChange(false)
              }}
            >
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2 overflow-hidden">
                {widget.component}
              </div>
              <div className="text-center font-medium">{widget.name}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
