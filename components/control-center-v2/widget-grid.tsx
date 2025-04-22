"use client"

import type React from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { WeatherWidget } from "./widgets/weather-widget"
import { SpeedDisplayWidget } from "./widgets/speed-display-widget"
import { RPMDisplayWidget } from "./widgets/rpm-display-widget"
import { BatteryWidget } from "./widgets/battery-widget"
import { TemperatureWidget } from "./widgets/temperature-widget"
import { TimerWidget } from "./widgets/timer-widget"
import { SpotLightsWidget } from "./widgets/spot-lights-widget"

// Add a style tag for the long-press visual indicator
const pulseAnimationStyle = `
 @keyframes pulse-animation {
   0% {
     box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.3);
   }
   70% {
     box-shadow: 0 0 0 10px rgba(22, 163, 74, 0);
   }
   100% {
     box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
   }
 }

 .widget-pulse {
   animation: pulse-animation 1.5s ease-out;
 }

 @keyframes continuous-flash {
   0%, 100% {
     opacity: 1;
   }
   50% {
     opacity: 0.7;
   }
 }

 .continuous-flash {
   animation: continuous-flash 1s infinite;
 }
`

// Enable responsiveness with the WidthProvider
const ResponsiveGridLayout = WidthProvider(Responsive)

// Define fixed widget sizes based on type
export const WIDGET_SIZES = {
  light: { w: 1, h: 1 },
  utility: { w: 1, h: 2 },
  gauge: { w: 1, h: 1 },
  speedometer: { w: 2, h: 2 },
  status: { w: 1, h: 1 },
  winch: { w: 1, h: 2 }, // Changed from w: 3, h: 1 to w: 1, h: 2
  weather: { w: 1, h: 1 },
  timer: { w: 1, h: 1 },
  "speed-display": { w: 1, h: 1 },
  "rpm-display": { w: 1, h: 1 },
  chaseLight: { w: 1, h: 1 },
  rgbLight: { w: 1, h: 1 }, // Add size for RGB Light widget
  battery: { w: 1, h: 1 }, // Add size for Battery widget
  temperature: { w: 1, h: 1 }, // Add size for Temperature widget
  spotLights: { w: 1, h: 1 },
}

// Grid configuration - 4 columns, infinite rows
const GRID_CONFIG = {
  cols: 4,
  rowHeight: 150,
  verticalCompact: true,
}

interface WidgetGridProps {
  widgets: any[]
  updateWidgetPositions?: (widgets: any[]) => void
  removeWidget?: (widgetId: string) => void
  isEditMode?: boolean
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent, widgetId: string) => void
  onMouseUp?: (widgetId: string) => void
  onMouseLeave?: (widgetId: string) => void
  onTouchStart?: (e: React.TouchEvent, widgetId: string) => void
  onTouchEnd?: (widgetId: string) => void
  onTouchCancel?: (widgetId: string) => void
}

export function WidgetGrid({
  widgets,
  updateWidgetPositions,
  removeWidget,
  isEditMode,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: WidgetGridProps) {
  // Render a specific widget based on its type
  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case "weather":
        return <WeatherWidget />
      case "timer":
        return <TimerWidget />
      case "speed-display":
        return (
          <SpeedDisplayWidget
            isEditing={isEditMode}
            onMouseDown={(e) => onMouseDown?.(e, widget.id)}
            onMouseUp={() => onMouseUp?.(widget.id)}
            onMouseLeave={() => onMouseLeave?.(widget.id)}
            onTouchStart={(e) => onTouchStart?.(e, widget.id)}
            onTouchEnd={() => onTouchEnd?.(widget.id)}
            onTouchCancel={() => onTouchCancel?.(widget.id)}
          />
        )
      case "rpm-display":
        return (
          <RPMDisplayWidget
            isEditing={isEditMode}
            onMouseDown={(e) => onMouseDown?.(e, widget.id)}
            onMouseUp={() => onMouseUp?.(widget.id)}
            onMouseLeave={() => onMouseLeave?.(widget.id)}
            onTouchStart={(e) => onTouchStart?.(e, widget.id)}
            onTouchEnd={() => onTouchEnd?.(widget.id)}
            onTouchCancel={() => onTouchCancel?.(widget.id)}
          />
        )
      case "battery":
        return (
          <BatteryWidget
            isEditing={isEditMode}
            onMouseDown={(e) => onMouseDown?.(e, widget.id)}
            onMouseUp={() => onMouseUp?.(widget.id)}
            onMouseLeave={() => onMouseLeave?.(widget.id)}
            onTouchStart={(e) => onTouchStart?.(e, widget.id)}
            onTouchEnd={() => onTouchEnd?.(widget.id)}
            onTouchCancel={() => onTouchCancel?.(widget.id)}
          />
        )
      case "temperature":
        return (
          <TemperatureWidget
            isEditing={isEditMode}
            onMouseDown={(e) => onMouseDown?.(e, widget.id)}
            onMouseUp={() => onMouseUp?.(widget.id)}
            onMouseLeave={() => onMouseLeave?.(widget.id)}
            onTouchStart={(e) => onTouchStart?.(e, widget.id)}
            onTouchEnd={() => onTouchEnd?.(widget.id)}
            onTouchCancel={() => onTouchCancel?.(widget.id)}
          />
        )
      case "spotLights":
        return (
          <SpotLightsWidget
            id={widget.id}
            name="Spot Lights" // Hardcoded for now, can be from data
            isEditing={isEditMode}
            onMouseDown={(e) => onMouseDown?.(e, widget.id)}
            onMouseUp={() => onMouseUp?.(widget.id)}
            onMouseLeave={() => onMouseLeave?.(widget.id)}
            onTouchStart={(e) => onTouchStart?.(e, widget.id)}
            onTouchEnd={() => onTouchEnd?.(widget.id)}
            onTouchCancel={() => onTouchCancel?.(widget.id)}
          />
        )
      default:
        return <div>Unknown widget type: {widget.type}</div>
    }
  }

  return (
    <div className="widget-grid grid grid-cols-2 gap-4">
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className="widget-container bg-card rounded-lg border shadow-sm overflow-hidden"
          style={{
            gridColumn: `span ${widget.size?.w || 1}`,
            gridRow: `span ${widget.size?.h || 1}`,
          }}
        >
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  )
}
