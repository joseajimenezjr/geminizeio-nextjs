"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import { Button } from "@/components/ui/button"
import { Plus, Save, Undo, Settings, Trash } from "lucide-react"
import { WidgetLibrary } from "./widget-library"
import { UtilityLibrary } from "./utility-library"
import { OBDIILibrary } from "./obdii-library" // Import the new OBD2 library
import { ToggleWidget } from "./widgets/toggle-widget"
import { GaugeWidget } from "./widgets/gauge-widget"
import { SpeedometerWidget } from "./widgets/speedometer-widget"
import { UtilityWidget } from "./widgets/utility-widget"
import { useAccessories } from "@/contexts/device-context"
import saveWidgetLayout from "@/app/actions/widget-layout"
import { useToast } from "@/components/ui/use-toast"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { StandaloneWinchWidget } from "./widgets/standalone-winch-widget"
import { WeatherWidget } from "./widgets/weather-widget"
import { SpeedDisplayWidget } from "./widgets/speed-display-widget"
import { RPMDisplayWidget } from "./widgets/rpm-display-widget"
import { ChaseLightWidget } from "./widgets/chase-light-widget"
import { RGBLightWidget } from "./widgets/rgb-light-widget"
import { BatteryWidget } from "./widgets/battery-widget"
import { TemperatureWidget } from "./widgets/temperature-widget"
import { TimerWidget } from "./widgets/timer-widget"

// Add a style tag for the long-press visual indicator
const longPressStyle = `
  .long-press-active {
    opacity: 0.7;
    transform: scale(0.98);
    transition: all 0.2s ease;
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

  // Add a state to track if the user has a temperature reader
  const [hasTemperatureReader, setHasTemperatureReader] = useState(false)

  const TEMPERATURE_SERVICE_UUID = "869c10ef-71d9-4f55-92d6-859350c3b8f6"

  // Check if user has OBD2 accessory and temperature reader
  useEffect(() => {
    if (userData?.accessories) {
      // Check for OBD2 accessory
      const hasOBD2 = userData.accessories.some((accessory: any) => accessory.accessoryType === "obd2")
      setHasOBD2Accessory(hasOBD2)

      // Check for temperature reader accessory
      const hasTempReader = userData.accessories.some((accessory: any) => accessory.accessoryType === "temp_reader")
      setHasTemperatureReader(hasTempReader)
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
      id: `widget-speedometer-default`,
      type: "speedometer",
      position: { x: 0, y: 0 },
      size: { w: 2, h: 2 },
    })

    // Add a winch widget by default - now 1 column, 2 rows
    defaultWidgets.push({
      id: `widget-winch-default`,
      type: "winch",
      position: { x: 2, y: 0 }, // Position it next to the speedometer
      size: { w: 1, h: 3 },
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
      case "temp_reader":
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
      for (let x = 0; x < GRID_CONFIG.cols; x++) {
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
          temperatureServiceUUID={TEMPERATURE_SERVICE_UUID}
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

    // For accessory-based widgets
    const accessory = userData.accessories.find((a: any) => a.accessoryID === widget.accessoryId)
    if (!accessory) {
      console.log(`No accessory found for widget ${widget.id}, accessoryId: ${widget.accessoryId}`)
      console.log(
        "Available accessories:",
        userData.accessories.map((a) => a.accessoryID),
      )
      return null
    }

    const isConnected = true // In a real implementation, check if the accessory is connected
    const isOn = accessory.accessoryConnectionStatus || false

    switch (widget.type) {
      case "light":
        return (
          <ToggleWidget
            title={accessory.accessoryName}
            accessoryType={accessory.accessoryType}
            relayPosition={accessory.relayPosition}
            isConnected={isConnected}
            isOn={isOn}
            isEditing={isEditing}
            onToggle={() => toggleAccessoryStatus(widget.accessoryId, !isOn)}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      case "utility":
        return (
          <UtilityWidget
            title={accessory.accessoryName}
            isConnected={isConnected}
            isOn={isOn}
            isEditing={isEditing}
            onToggle={() => toggleAccessoryStatus(widget.accessoryId, !isOn)}
            onLeftPress={() => handleUtilityLeftPress(widget.accessoryId)}
            onRightPress={() => handleUtilityRightPress(widget.accessoryId)}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      case "gauge":
        return (
          <GaugeWidget
            title={accessory.accessoryName}
            value={75} // Example value
            min={0}
            max={100}
            unit="%"
            isEditing={isEditing}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      case "chaseLight":
        return (
          <ChaseLightWidget
            title={accessory.accessoryName}
            accessoryId={widget.accessoryId}
            isConnected={isConnected}
            isOn={isOn}
            relayPosition={accessory.relayPosition}
            isEditing={isEditing}
            onToggle={() => toggleAccessoryStatus(widget.accessoryId, !isOn)}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      case "rgbLight":
        return (
          <RGBLightWidget
            title={accessory.accessoryName}
            accessoryId={widget.accessoryId}
            isConnected={isConnected}
            isOn={isOn}
            relayPosition={accessory.relayPosition}
            lastRGBColor={accessory.lastRGBColor || "#FF0000"}
            isEditing={isEditing}
            onToggle={() => toggleAccessoryStatus(widget.accessoryId, !isOn)}
            onColorChange={(color) => handleRGBColorChange(widget.accessoryId, color)}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      case "temperature":
        return (
          <TemperatureWidget
            title={accessory.accessoryName}
            isConnected={isConnected}
            isOn={isOn}
            isEditing={isEditing}
            onToggle={() => toggleAccessoryStatus(widget.accessoryId, !isOn)}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      default:
        return (
          <div
            className="flex items-center justify-center h-full"
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          >
            <p>Unknown widget type</p>
          </div>
        )
    }
  }

  // Add the style tag to the component
  useEffect(() => {
    // Add the style tag to the head
    const styleTag = document.createElement("style")
    styleTag.innerHTML = longPressStyle
    document.head.appendChild(styleTag)

    return () => {
      // Remove the style tag when the component unmounts
      document.head.removeChild(styleTag)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-bold">Control Center</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancelEditing} className="flex items-center gap-1">
                <Undo className="h-4 w-4" />
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveLayout} className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                Save Layout
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleStartEditing} className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Edit Layout
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isEditing && (
          <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Drag widgets to rearrange them. Long-press any widget to remove it.
            </p>
            <div className="flex gap-2">
              <Button
                variant={showLibrary ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowLibrary(!showLibrary)
                  setShowUtilityLibrary(false)
                  setShowOBDIILibrary(false)
                }}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Accessory
              </Button>
              <Button
                variant={showUtilityLibrary ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowUtilityLibrary(!showUtilityLibrary)
                  setShowLibrary(false)
                  setShowOBDIILibrary(false)
                }}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Utility
              </Button>
              {hasOBD2Accessory && (
                <Button
                  variant={showOBDIILibrary ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setShowOBDIILibrary(!showOBDIILibrary)
                    setShowLibrary(false)
                    setShowUtilityLibrary(false)
                  }}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add OBD2
                </Button>
              )}
            </div>
          </div>
        )}

        {showLibrary && (
          <div className="mb-6">
            <WidgetLibrary
              accessories={userData.accessories}
              existingWidgets={widgets}
              onAddWidget={handleAddWidget}
              onClose={() => setShowLibrary(false)}
            />
          </div>
        )}

        {showUtilityLibrary && (
          <div className="mb-6">
            <UtilityLibrary
              existingWidgets={widgets}
              onAddUtility={handleAddUtilityWidget}
              onClose={() => setShowUtilityLibrary(false)}
              hasTemperatureSensor={hasTemperatureReader}
              temperatureServiceUUID={TEMPERATURE_SERVICE_UUID}
            />
          </div>
        )}

        {showOBDIILibrary && (
          <div className="mb-6">
            <OBDIILibrary
              existingWidgets={widgets}
              onAddOBDII={handleAddOBDIIWidget}
              onClose={() => setShowOBDIILibrary(false)}
            />
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: GRID_CONFIG.cols, md: GRID_CONFIG.cols, sm: GRID_CONFIG.cols, xs: 2, xxs: 1 }}
          rowHeight={GRID_CONFIG.rowHeight}
          isDraggable={isEditing}
          isResizable={false}
          preventCollision={false}
          onLayoutChange={onLayoutChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactType="vertical"
          autoSize={true}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              id={widget.id}
              className="widget-container bg-card rounded-lg shadow-sm overflow-hidden border h-full relative"
              onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
              onMouseUp={() => handleWidgetMouseUp(widget.id)}
              onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
              onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
              onTouchEnd={() => handleWidgetMouseUp(widget.id)}
              onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </ResponsiveGridLayout>

        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-muted-foreground mb-4">No widgets in your control center</p>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLibrary(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Accessory Widget
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddSpeedometer} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Speedometer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Context Menu for Widget Actions */}
        {contextMenu.visible && contextMenu.widgetId && (
          <div
            id="widget-context-menu"
            className="fixed bg-popover text-popover-foreground shadow-md rounded-md overflow-hidden z-50"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              transform: "translate(-50%, -50%)",
              minWidth: "200px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 flex flex-col">
              <div className="px-2 py-1 text-sm font-medium border-b mb-1">Widget Options</div>

              {/* Remove option */}
              <button
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2 mt-1"
                onClick={() => handleRemoveWidget(contextMenu.widgetId!)}
              >
                <Trash className="h-4 w-4" />
                Remove Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
