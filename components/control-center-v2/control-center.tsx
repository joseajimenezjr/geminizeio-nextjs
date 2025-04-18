"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import type React from "react"

import { useState, useRef } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import { SpeedometerWidget } from "./widgets/speedometer-widget"
import { useAccessories } from "@/contexts/device-context"
import saveWidgetLayout from "@/app/actions/widget-layout"
import { useToast } from "@/components/ui/use-toast"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { StandaloneWinchWidget } from "./widgets/standalone-winch-widget"
import { WeatherWidget } from "./widgets/weather-widget"
import { TimerWidget } from "./widgets/timer-widget"
import { SpeedDisplayWidget } from "./widgets/speed-display-widget"
import { RPMDisplayWidget } from "./widgets/rpm-display-widget"
import { BatteryWidget } from "./widgets/battery-widget"
import { TemperatureWidget } from "./widgets/temperature-widget"

// Add a style tag for the long-press visual indicator
const longPressStyle = `
\
  .long-press-active
{
  opacity: 0.7
  transform: scale(0.98)
  transition: all
  0.2s ease
}
;`

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
}

// Grid configuration - 4 columns, infinite rows
const GRID_CONFIG = {
  cols: 4,
  rowHeight: 150,
  verticalCompact: true,
}

interface ControlCenterV2Props {
  vehicleName: string
  vehicleType: string
  userData: any
}

export function ControlCenterV2({ vehicleName, vehicleType, userData }: ControlCenterV2Props) {
  const { accessories, toggleAccessoryStatus, isLoading, updateAccessoryAttribute } = useAccessories()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [layouts, setLayouts] = useState<any>({
    lg: [],
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  })
  const [originalLayouts, setOriginalLayouts] = useState<any>(null)
  const [widgets, setWidgets] = useState<any[]>([])
  const [originalWidgets, setOriginalWidgets] = useState<any[]>([])
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    widgetId: string | null
    x: number
    y: number
  }>({
    visible: false,
    widgetId: null,
    x: 0,
    y: 0,
  })
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const longPressThreshold = 500 // ms
  const [showUtilityLibrary, setShowUtilityLibrary] = useState(false)
  const [showOBDIILibrary, setShowOBDIILibrary] = useState(false)
  const [hasOBD2Accessory, setHasOBD2Accessory] = useState(false)

  // Check if user has OBD2 accessory
  useEffect(() => {
    if (userData?.accessories) {
      const hasOBD2 = userData.accessories.some((accessory: any) => accessory.accessoryType === "obd2")
      setHasOBD2Accessory(hasOBD2)
    }
  }, [userData])

  // Initialize layouts from user data or defaults
  useEffect(() => {
    if (userData?.controlCenter?.widgets?.length > 0) {
      initializeFromUserData()
    } else {
      initializeDefaultLayout()
    }
  }, [userData])

  // Initialize from user's saved control center data
  const initializeFromUserData = () => {
    const userWidgets = userData.controlCenter.widgets

    // Update any existing winch widgets to the new size
    const updatedWidgets = userWidgets.map((widget) => {
      if (widget.type === "winch") {
        return {
          ...widget,
          size: WIDGET_SIZES.winch,
        }
      }
      return widget
    })

    setWidgets(updatedWidgets)

    // Create layout objects for react-grid-layout
    const userLayouts = {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: [],
    }

    // Create layouts for each breakpoint
    updatedWidgets.forEach((widget: any) => {
      const baseLayout = {
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.size.w,
        h: widget.size.h,
        isResizable: false,
      }

      // Add to each breakpoint with appropriate adjustments
      userLayouts.lg.push({ ...baseLayout })
      userLayouts.md.push({ ...baseLayout })

      // For smaller screens, adjust the layout
      userLayouts.sm.push({
        ...baseLayout,
        w: Math.min(baseLayout.w, 2), // Max 2 columns on small screens
      })

      userLayouts.xs.push({
        ...baseLayout,
        ...baseLayout,
        x: 0,
        w: Math.min(baseLayout.w, 2), // Full width on extra small screens
      })

      userLayouts.xxs.push({
        ...baseLayout,
        x: 0,
        w: 1, // Full width on tiny screens
      })
    })

    setLayouts(userLayouts)
  }

  // Create default layout based on accessories
  const initializeDefaultLayout = () => {
    const defaultWidgets = []
    let row = 0
    let col = 0

    // Add a speedometer widget by default
    defaultWidgets.push({
      id: `
widget-speedometer-
default`,
      type: "speedometer",
      position: {
        x: 0,
        y: 0,
      },
      size: {
        w: 2,
        h: 2,
      },
    })

    // Add a winch widget by default - now 1 column, 2 rows
    defaultWidgets.push({
      id: `widget-winch-default`,
      type: "winch",
      position: {
        x: 2,
        y: 0,
      }, // Position it next to the speedometer
      size: {
        w: 1,
        h: 3,
      },
    })

    // Update position for next widget
    col = 3

    // Add widgets for accessories
    const accessoryWidgets = (userData?.accessories || []).slice(0, 6).map((accessory: any, index: number) => {
      const widgetType = getWidgetTypeForAccessory(accessory.accessoryType)
      const size = WIDGET_SIZES[widgetType]

      // Check if we need to move to next row
      if (col + size.w > GRID_CONFIG.cols) {
        col = 0
        row++
      }

      const position = { x: col, y: row }

      // Update column for next widget
      col += size.w

      // If we've reached the end of the row, move to next row
      if (col >= GRID_CONFIG.cols) {
        col = 0
        row++
      }

      return {
        id: `widget-${accessory.accessoryID}`,
        accessoryId: accessory.accessoryID,
        type: widgetType,
        position: position,
        size: size,
      }
    })

    setWidgets([...defaultWidgets, ...accessoryWidgets])

    // Create layout objects for react-grid-layout
    const defaultLayouts = {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: [],
    }

    // Create layouts for each breakpoint
    ;[...defaultWidgets, ...accessoryWidgets].forEach((widget: any) => {
      const baseLayout = {
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.size.w,
        h: widget.size.h,
        isResizable: false,
      }

      // Add to each breakpoint with appropriate adjustments
      defaultLayouts.lg.push({ ...baseLayout })
      defaultLayouts.md.push({ ...baseLayout })

      // For smaller screens, adjust the layout
      defaultLayouts.sm.push({
        ...baseLayout,
        w: Math.min(baseLayout.w, 2), // Max 2 columns on small screens
      })

      defaultLayouts.xs.push({
        ...baseLayout,
        ...baseLayout,
        x: 0,
        w: Math.min(baseLayout.w, 2), // Full width on extra small screens
      })

      defaultLayouts.xxs.push({
        ...baseLayout,
        x: 0,
        w: 1, // Full width on tiny screens
      })
    })

    setLayouts(defaultLayouts)
  }

  // Helper functions to determine widget type and size
  function getWidgetTypeForAccessory(accessoryType: string) {
    switch (accessoryType) {
      case "light":
        return "light"
      case "utility":
        return "utility"
      case "gauge":
        return "gauge"
      case "sensor":
        return "temperature"
      case "winch":
        return "winch"
      case "chaseLight":
        return "chaseLight"
      case "rgbLight":
        return "rgbLight"
      case "battery":
        return "battery"
      default:
        return "light"
    }
  }

  // Find a suitable position for a new widget
  const findSuitablePosition = (widgetSize: { w: number; h: number }) => {
    // Create a grid representation - we'll use a large number of rows since we support infinite scrolling
    const maxRows = 20 // This is just for calculation, not a limit
    const grid = Array(maxRows)
      .fill(0)
      .map(() => Array(GRID_CONFIG.cols).fill(false))

    // Mark occupied cells
    widgets.forEach((widget) => {
      for (let y = widget.position.y; y < widget.position.y + widget.size.h; y++) {
        for (let x = widget.position.x; x < widget.position.x + widget.size.w; x++) {
          if (y < maxRows && x < GRID_CONFIG.cols) {
            grid[y][x] = true
          }
        }
      }
    })

    // Find first available position
    for (let y = 0; y < maxRows; y++) {
      for (let x = 0; y < GRID_CONFIG.cols; x++) {
        // Check if this position can fit the widget
        let canFit = true

        // Check each cell the widget would occupy
        for (let dy = 0; dy < widgetSize.h; dy++) {
          for (let dx = 0; dx < widgetSize.w; dx++) {
            const checkY = y + dy
            const checkX = x + dx

            // If out of bounds or occupied, can't fit
            if (checkY >= maxRows || checkX >= GRID_CONFIG.cols || grid[checkY][checkX]) {
              canFit = false
              break
            }
          }
          if (!canFit) break
        }

        if (canFit) {
          return { x, y }
        }
      }
    }

    // If no suitable position found in our grid, just add to the bottom
    const maxY = widgets.reduce((max, widget) => Math.max(max, widget.position.y + widget.size.h), 0)
    return { x: 0, y: maxY }
  }

  // Handle layout changes
  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    // Only update layouts when in edit mode
    if (isEditing) {
      setLayouts(allLayouts)

      // Update widget positions based on layout
      const updatedWidgets = widgets.map((widget) => {
        const layoutItem = currentLayout.find((item: any) => item.i === widget.id)
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
            },
          }
        }
        return widget
      })

      setWidgets(updatedWidgets)
    }
  }

  // Start editing mode
  const handleStartEditing = () => {
    setOriginalLayouts(JSON.parse(JSON.stringify(layouts)))
    setOriginalWidgets(JSON.parse(JSON.stringify(widgets)))
    setIsEditing(true)
  }

  // Cancel editing
  const handleCancelEditing = () => {
    if (originalLayouts && originalWidgets) {
      setLayouts(originalLayouts)
      setWidgets(originalWidgets)
    }
    setIsEditing(false)
    setShowLibrary(false)
    setShowUtilityLibrary(false)
    setShowOBDIILibrary(false)
  }

  // Save layout
  const handleSaveLayout = async () => {
    try {
      // Prepare the control center config for saving
      const controlCenterConfig = {
        version: 1,
        layout: "grid",
        widgets: widgets,
      }

      // Save to the user's profile
      await saveWidgetLayout(controlCenterConfig)

      toast({
        title: "Layout saved",
        description: "Your control center layout has been saved.",
      })

      setIsEditing(false)
      setShowLibrary(false)
      setShowUtilityLibrary(false)
      setShowOBDIILibrary(false)
    } catch (error) {
      toast({
        title: "Error saving layout",
        description: "There was an error saving your layout. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add a new widget
  const handleAddWidget = (widgetType: string, accessoryId: string) => {
    const accessory = userData.accessories.find((a: any) => a.accessoryID === accessoryId)
    if (!accessory) return

    // Check if this accessory already has a widget
    const existingWidget = widgets.find((w) => w.accessoryId === accessoryId)
    if (existingWidget) {
      toast({
        title: "Widget already exists",
        description: `${accessory.accessoryName} is already in your control center.`,
      })
      return
    }

    // Determine size based on accessory type
    const accessoryWidgetType = getWidgetTypeForAccessory(accessory.accessoryType)
    const size = WIDGET_SIZES[accessoryWidgetType]

    // Find a suitable position
    const position = findSuitablePosition(size)

    const newWidget = {
      id: `widget-${Date.now()}`,
      accessoryId: accessoryId,
      type: widgetType,
      position: position,
      size: size,
    }

    setWidgets([...widgets, newWidget])

    // Add to layouts
    const newLayouts = { ...layouts }
    Object.keys(newLayouts).forEach((breakpoint) => {
      let layoutW = size.w
      let layoutX = position.x

      // Adjust for smaller screens
      if (breakpoint === "sm") {
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xs") {
        layoutX = 0
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xxs") {
        layoutX = 0
        layoutW = 1
      }

      newLayouts[breakpoint] = [
        ...newLayouts[breakpoint],
        {
          i: newWidget.id,
          x: layoutX,
          y: position.y,
          w: layoutW,
          h: size.h,
          isResizable: false,
        },
      ]
    })

    setLayouts(newLayouts)
  }

  // Add a speedometer widget
  const handleAddSpeedometer = () => {
    // Check if a speedometer already exists
    const existingSpeedometer = widgets.find((w) => w.type === "speedometer")
    if (existingSpeedometer) {
      toast({
        title: "Speedometer already exists",
        description: "You already have a speedometer widget in your control center.",
      })
      return
    }

    const size = WIDGET_SIZES.speedometer
    const position = findSuitablePosition(size)

    const newWidget = {
      id: `widget-speedometer-${Date.now()}`,
      type: "speedometer",
      position: position,
      size: size,
    }

    setWidgets([...widgets, newWidget])

    // Add to layouts
    const newLayouts = { ...layouts }
    Object.keys(newLayouts).forEach((breakpoint) => {
      let layoutW = size.w
      let layoutX = position.x

      // Adjust for smaller screens
      if (breakpoint === "sm") {
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xs") {
        layoutX = 0
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xxs") {
        layoutX = 0
        layoutW = 1
      }

      newLayouts[breakpoint] = [
        ...newLayouts[breakpoint],
        {
          i: newWidget.id,
          x: layoutX,
          y: position.y,
          w: layoutW,
          h: size.h,
          isResizable: false,
        },
      ]
    })

    setLayouts(newLayouts)
  }

  // Add a utility widget
  const handleAddUtilityWidget = (utilityType: string) => {
    // Check if this utility already exists (for unique utilities like weather)
    if (utilityType === "weather") {
      const existingWeather = widgets.find((w) => w.type === "weather")
      if (existingWeather) {
        toast({
          title: "Weather widget already exists",
          description: "You already have a weather widget in your control center.",
        })
        return
      }
    }

    // Check if this utility already exists (for unique utilities like battery)
    if (utilityType === "battery") {
      const existingBattery = widgets.find((w) => w.type === "battery")
      if (existingBattery) {
        toast({
          title: "Battery widget already exists",
          description: "You already have a battery widget in your control center.",
        })
        return
      }
    }

    // Check if this utility already exists (for unique utilities like temperature)
    if (utilityType === "temperature") {
      const existingTemperature = widgets.find((w) => w.type === "temperature")
      if (existingTemperature) {
        toast({
          title: "Temperature widget already exists",
          description: "You already have a temperature widget in your control center.",
        })
        return
      }
    }

    const size = WIDGET_SIZES[utilityType as keyof typeof WIDGET_SIZES] || WIDGET_SIZES.status
    const position = findSuitablePosition(size)

    const newWidget = {
      id: `widget-${utilityType}-${Date.now()}`,
      type: utilityType,
      position: position,
      size: size,
    }

    setWidgets([...widgets, newWidget])

    // Add to layouts
    const newLayouts = { ...layouts }
    Object.keys(newLayouts).forEach((breakpoint) => {
      let layoutW = size.w
      let layoutX = position.x

      // Adjust for smaller screens
      if (breakpoint === "sm") {
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xs") {
        layoutX = 0
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xxs") {
        layoutX = 0
        layoutW = 1
      }

      newLayouts[breakpoint] = [
        ...newLayouts[breakpoint],
        {
          i: newWidget.id,
          x: layoutX,
          y: position.y,
          w: layoutW,
          h: size.h,
          isResizable: false,
        },
      ]
    })

    setLayouts(newLayouts)
  }

  // Add an OBD2 widget
  const handleAddOBDIIWidget = (obdiiType: string) => {
    // Check if this OBD2 widget already exists
    const existingOBDII = widgets.find((w) => w.type === obdiiType)
    if (existingOBDII) {
      toast({
        title: "Widget already exists",
        description: `You already have this OBD2 widget in your control center.`,
      })
      return
    }

    const size = WIDGET_SIZES[obdiiType as keyof typeof WIDGET_SIZES] || WIDGET_SIZES.status
    const position = findSuitablePosition(size)

    const newWidget = {
      id: `widget-${obdiiType}-${Date.now()}`,
      type: obdiiType,
      position: position,
      size: size,
    }

    setWidgets([...widgets, newWidget])

    // Add to layouts
    const newLayouts = { ...layouts }
    Object.keys(newLayouts).forEach((breakpoint) => {
      let layoutW = size.w
      let layoutX = position.x

      // Adjust for smaller screens
      if (breakpoint === "sm") {
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xs") {
        layoutX = 0
        layoutW = Math.min(size.w, 2)
      } else if (breakpoint === "xxs") {
        layoutX = 0
        layoutW = 1
      }

      newLayouts[breakpoint] = [
        ...newLayouts[breakpoint],
        {
          i: newWidget.id,
          x: layoutX,
          y: position.y,
          w: layoutW,
          h: size.h,
          isResizable: false,
        },
      ]
    })

    setLayouts(newLayouts)
  }

  // Remove a widget
  const handleRemoveWidget = (widgetId: string) => {
    console.log("Removing widget:", widgetId)

    // Remove the widget
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId)
    console.log("Updated widgets:", updatedWidgets.length)
    setWidgets(updatedWidgets)

    // Remove from layouts
    const updatedLayouts = { ...layouts }
    Object.keys(updatedLayouts).forEach((breakpoint) => {
      updatedLayouts[breakpoint] = updatedLayouts[breakpoint].filter((item: any) => item.i !== widgetId)
    })

    setLayouts(updatedLayouts)
    setContextMenu({ visible: false, widgetId: null, x: 0, y: 0 })

    // Add a toast notification for feedback
    toast({
      title: "Widget removed",
      description: "The widget has been removed from your control center.",
    })
  }

  // Handle long press start
  const handleWidgetMouseDown = (e: React.MouseEvent | React.TouchEvent, widgetId: string) => {
    console.log("Widget mouse down:", widgetId)

    // Only enable long press in editing mode
    if (!isEditing) {
      return // Exit early if not in editing mode
    }

    e.preventDefault()
    e.stopPropagation()

    // Clear any existing timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    // Set a visual indicator that long press is happening
    const widgetElement = document.getElementById(widgetId)
    if (widgetElement) {
      widgetElement.classList.add("long-press-active")
    }

    longPressTimerRef.current = setTimeout(() => {
      console.log("Long press detected for widget:", widgetId)

      // Remove the visual indicator
      if (widgetElement) {
        widgetElement.classList.remove("long-press-active")
      }

      // Get the widget element to position the menu relative to it
      if (widgetElement) {
        const rect = widgetElement.getBoundingClientRect()
        console.log("Widget position:", rect)

        setContextMenu({
          visible: true,
          widgetId,
          // Position in the center of the widget
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      } else {
        // Fallback to mouse/touch position if element not found
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

        setContextMenu({
          visible: true,
          widgetId,
          x: clientX,
          y: clientY,
        })
      }
    }, longPressThreshold)
  }

  // Handle mouse up to cancel long press
  const handleWidgetMouseUp = (widgetId: string) => {
    console.log("Widget mouse up:", widgetId)

    // Remove the visual indicator
    const widgetElement = document.getElementById(widgetId)
    if (widgetElement) {
      widgetElement.classList.remove("long-press-active")
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Handle mouse leave to cancel long press
  const handleWidgetMouseLeave = (widgetId: string) => {
    // Remove the visual indicator
    const widgetElement = document.getElementById(widgetId)
    if (widgetElement) {
      widgetElement.classList.remove("long-press-active")
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Handle direct edit click for widgets in edit mode
  const handleWidgetEditClick = (widgetId: string) => {
    if (isEditing) {
      console.log("Edit click for widget:", widgetId)

      // Get the widget element to position the menu relative to it
      const widgetElement = document.getElementById(widgetId)
      if (widgetElement) {
        const rect = widgetElement.getBoundingClientRect()
        setContextMenu({
          visible: true,
          widgetId,
          // Position in the center of the widget
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      }
    }
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible) {
        const menuElement = document.getElementById("widget-context-menu")
        if (menuElement && !menuElement.contains(e.target as Node)) {
          setContextMenu({ visible: false, widgetId: null, x: 0, y: 0 })
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [contextMenu.visible])

  // Simulate left/right button press for utility widgets
  const handleUtilityLeftPress = (accessoryId: string) => {
    console.log("Left button pressed for:", accessoryId)
    // In a real implementation, this would send a command to the accessory
  }

  const handleUtilityRightPress = (accessoryId: string) => {
    console.log("Right button pressed for:", accessoryId)
    // In a real implementation, this would send a command to the accessory
  }

  // Handle RGB color change
  const handleRGBColorChange = async (accessoryId: string, color: string) => {
    console.log(`RGB color changed for ${accessoryId} to ${color}`)
    try {
      await updateAccessoryAttribute(accessoryId, "lastRGBColor", color)
      toast({
        title: "Color updated",
        description: `The RGB color has been updated to ${color}`,
      })
    } catch (error) {
      console.error("Error updating RGB color:", error)
      toast({
        title: "Error updating color",
        description: "There was an error updating the RGB color. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render the appropriate widget component based on type
  const renderWidget = (widget: any) => {
    // For OBD2 widgets
    if (widget.type === "speed-display") {
      return <SpeedDisplayWidget />
    }

    if (widget.type === "rpm-display") {
      return <RPMDisplayWidget />
    }

    // For battery widget
    if (widget.type === "battery") {
      return (
        <BatteryWidget
          title="Battery"
          initialLevel={75}
          isEditing={isEditing}
          onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
          onMouseUp={() => handleWidgetMouseUp(widget.id)}
          onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
          onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
          onTouchEnd={() => handleWidgetMouseUp(widget.id)}
          onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
        />
      )
    }

    // For temperature widget
    if (widget.type === "temperature") {
      return (
        <TemperatureWidget
          title="Temperature"
          isEditing={isEditing}
          onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
          onMouseUp={() => handleWidgetMouseUp(widget.id)}
          onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
          onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
          onTouchEnd={() => handleWidgetMouseUp(widget.id)}
          onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
        />
      )
    }

    // For speedometer widget (doesn't need an accessory)
    if (widget.type === "speedometer") {
      return (
        <SpeedometerWidget
          title="Vehicle Speed"
          value={45}
          maxValue={120}
          unit="mph"
          isEditing={isEditing}
          onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
          onMouseUp={() => handleWidgetMouseUp(widget.id)}
          onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
          onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
          onTouchEnd={() => handleWidgetMouseUp(widget.id)}
          onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
        />
      )
    }

    // For winch widget (special case)
    if (widget.type === "winch") {
      return (
        <div className="h-full w-full">
          <StandaloneWinchWidget title="Winch" />
        </div>
      )
    }

    // For weather widget
    if (widget.type === "weather") {
      return (
        <WeatherWidget
          title="Weather"
          isEditing={isEditing}
          onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
          onMouseUp={() => handleWidgetMouseUp(widget.id)}
          onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
          onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
          onTouchEnd={() => handleWidgetMouseUp(widget.id)}
          onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
        />
      )
    }

    // For timer widget
    if (widget.type === "timer") {
      return (
        <TimerWidget
          title="Timer"
          bestTime={userData.bestTime}
          isEditing={isEditing}
          onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
          onMouseUp={() => handleWidgetMouseUp(widget.id)}
          onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
          onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
          onTouchEnd={() => handleWidgetMouseUp(widget.id)}
          onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
        />
      )
    }

    return <div>Unknown widget type: {widget.type}</div>
  }

  return (
    <div className="relative">
      <div className="widget-grid grid grid-cols-2 gap-4">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            id={widget.id}
            className="widget-container bg-card rounded-lg border shadow-sm overflow-hidden"
            style={{
              gridColumn: `span ${widget.size?.w || 1}`,
              gridRow: `span ${widget.size?.h || 1}`,
            }}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
            onClick={() => handleWidgetEditClick(widget.id)}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          id="widget-context-menu"
          className="absolute z-50 bg-popover border border-border rounded-md shadow-lg p-2"
          style={{ left: contextMenu.x - 75, top: contextMenu.y - 50 }}
        >
          <Button variant="ghost" size="sm" onClick={() => handleRemoveWidget(contextMenu.widgetId)}>
            Remove Widget
          </Button>
        </div>
      )}
    </div>
  )
}
