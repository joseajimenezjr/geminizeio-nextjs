"use client"
import { WeatherWidget } from "./widgets/weather-widget"
import type React from "react"
import { useEffectEvent } from "@/hooks/use-effect-event" // Import from our custom hook

import { TimerWidget } from "./widgets/timer-widget"
import { SpeedDisplayWidget } from "./widgets/speed-display-widget"
import { RPMDisplayWidget } from "./widgets/rpm-display-widget"
import { BatteryWidget } from "./widgets/battery-widget"
import { TemperatureWidget } from "./widgets/temperature-widget"

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
  // Use our custom useEffectEvent for handling widget interactions
  const handleWidgetInteraction = useEffectEvent((widgetId: string, action: string) => {
    console.log(`Widget ${widgetId} ${action}`)
    // Additional interaction handling logic would go here
  })

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
            onMouseDown={(e) => {
              onMouseDown?.(e, widget.id)
              handleWidgetInteraction(widget.id, "mousedown")
            }}
            onMouseUp={() => {
              onMouseUp?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseup")
            }}
            onMouseLeave={() => {
              onMouseLeave?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseleave")
            }}
            onTouchStart={(e) => {
              onTouchStart?.(e, widget.id)
              handleWidgetInteraction(widget.id, "touchstart")
            }}
            onTouchEnd={() => {
              onTouchEnd?.(widget.id)
              handleWidgetInteraction(widget.id, "touchend")
            }}
            onTouchCancel={() => {
              onTouchCancel?.(widget.id)
              handleWidgetInteraction(widget.id, "touchcancel")
            }}
          />
        )
      case "rpm-display":
        return (
          <RPMDisplayWidget
            isEditing={isEditMode}
            onMouseDown={(e) => {
              onMouseDown?.(e, widget.id)
              handleWidgetInteraction(widget.id, "mousedown")
            }}
            onMouseUp={() => {
              onMouseUp?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseup")
            }}
            onMouseLeave={() => {
              onMouseLeave?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseleave")
            }}
            onTouchStart={(e) => {
              onTouchStart?.(e, widget.id)
              handleWidgetInteraction(widget.id, "touchstart")
            }}
            onTouchEnd={() => {
              onTouchEnd?.(widget.id)
              handleWidgetInteraction(widget.id, "touchend")
            }}
            onTouchCancel={() => {
              onTouchCancel?.(widget.id)
              handleWidgetInteraction(widget.id, "touchcancel")
            }}
          />
        )
      case "battery":
        return (
          <BatteryWidget
            isEditing={isEditMode}
            onMouseDown={(e) => {
              onMouseDown?.(e, widget.id)
              handleWidgetInteraction(widget.id, "mousedown")
            }}
            onMouseUp={() => {
              onMouseUp?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseup")
            }}
            onMouseLeave={() => {
              onMouseLeave?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseleave")
            }}
            onTouchStart={(e) => {
              onTouchStart?.(e, widget.id)
              handleWidgetInteraction(widget.id, "touchstart")
            }}
            onTouchEnd={() => {
              onTouchEnd?.(widget.id)
              handleWidgetInteraction(widget.id, "touchend")
            }}
            onTouchCancel={() => {
              onTouchCancel?.(widget.id)
              handleWidgetInteraction(widget.id, "touchcancel")
            }}
          />
        )
      case "temperature":
        return (
          <TemperatureWidget
            isEditing={isEditMode}
            onMouseDown={(e) => {
              onMouseDown?.(e, widget.id)
              handleWidgetInteraction(widget.id, "mousedown")
            }}
            onMouseUp={() => {
              onMouseUp?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseup")
            }}
            onMouseLeave={() => {
              onMouseLeave?.(widget.id)
              handleWidgetInteraction(widget.id, "mouseleave")
            }}
            onTouchStart={(e) => {
              onTouchStart?.(e, widget.id)
              handleWidgetInteraction(widget.id, "touchstart")
            }}
            onTouchEnd={() => {
              onTouchEnd?.(widget.id)
              handleWidgetInteraction(widget.id, "touchend")
            }}
            onTouchCancel={() => {
              onTouchCancel?.(widget.id)
              handleWidgetInteraction(widget.id, "touchcancel")
            }}
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
