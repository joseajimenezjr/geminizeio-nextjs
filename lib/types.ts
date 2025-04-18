// Widget types
export type WidgetType = "weather" | "timer" | "speed-display" | "rpm-display" | "battery"

// Widget data structure
export interface Widget {
  id: string
  type: WidgetType
  position: {
    x: number
    y: number
  }
  size: {
    w: number
    h: number
  }
}

// Add this new interface for top times
export interface TopTimeEntry {
  time: number
  date: string
  description: string
}
