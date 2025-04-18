"use client"
import { WeatherWidget } from "./widgets/weather-widget"
import type React from "react"

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
