"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import { Button } from "@/components/ui/button"
import { Plus, Save, Undo, Settings, Trash } from "lucide-react"
import { WidgetLibrary } from "./widget-library"
import { UtilityLibrary } from "./utility-library"
import { OBDIILibrary } from "./obdii-library"
import { ToggleWidget } from "./widgets/toggle-widget"
import { GaugeWidget } from "./widgets/gauge-widget"
import { UtilityWidget } from "./widgets/utility-widget"
import { useAccessories } from "@/contexts/device-context"
import saveWidgetLayout from "@/app/actions/widget-layout"
import { useToast } from "@/components/ui/use-toast"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { WeatherWidget } from "./widgets/weather-widget"
import { SpeedDisplayWidget } from "./widgets/speed-display-widget"
import { RPMDisplayWidget } from "./widgets/rpm-display-widget"
import { ChaseLightWidget } from "./widgets/chase-light-widget"
import { RGBLightWidget } from "./widgets/rgb-light-widget"
import { BatteryWidget } from "./widgets/battery-widget"
import { TemperatureWidget } from "./widgets/temperature-widget"
import { TimerWidget } from "./widgets/timer-widget"
import { TurnSignalWidget } from "./widgets/turn-signal-widget" // Import the new TurnSignalWidget
import { TurnSignalSettingsDialog } from "./widgets/turn-signal-settings"
import type { TurnSignalSettings } from "./widgets/turn-signal-widget"

// Add a style tag for the long-press visual indicator
const longPressStyle = `
  .long-press-active {
    opacity: 0.7;
    transform: scale(0.98);
    transition: all 0.2s ease;
  }
  
  /* Add this to ensure all widgets are draggable in edit mode */
  .react-grid-item.react-draggable {
    cursor: move;
  }
  
  /* Make sure pointer events work properly during drag */
  .react-grid-item.react-draggable-dragging {
    z-index: 3;
    pointer-events: auto !important;
  }
  
  /* Fix for widgets in edit mode */
  .edit-mode .widget-container {
    pointer-events: auto !important;
  }
  
  /* Ensure content inside widgets doesn't block drag events in edit mode */
  .edit-mode .widget-container > * {
    pointer-events: none;
  }
  
  /* But allow clicks on buttons and interactive elements */
  .edit-mode .widget-container button,
  .edit-mode .widget-container input,
  .edit-mode .widget-container select,
  .edit-mode .widget-container a {
    pointer-events: auto;
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
  rgbLight: { w: 1, h: 1 },
  battery: { w: 1, h: 1 },
  temperature: { w: 1, h: 1 },
  turnSignal: { w: 2, h: 1 },
  "hazard-light": { w: 1, h: 1 },
}

// Define supported accessory types that have widget implementations
const SUPPORTED_ACCESSORY_TYPES = [
  "light",
  "utility",
  "gauge",
  "chaseLight",
  "rgbLight",
  "battery",
  "temperature",
  "obd2",
  "turnSignal", // Add the new TURNSIGNAL accessory type
]

// Grid configuration - 4 columns, infinite rows
const GRID_CONFIG = {
  cols: 4,
  rowHeight: 225,
  verticalCompact: true,
}

interface ControlCenterV2Props {
  userData: any
  setUserData: React.Dispatch<React.SetStateAction<any>>
}

export function ControlCenterV2({ userData, setUserData }: ControlCenterV2Props) {
  const { accessories, toggleAccessoryStatus, isLoading, updateAccessoryAttribute } = useAccessories()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState<boolean>(false)

  useEffect(() => {
    console.log("ControlCenterV2 component rendered")
    return () => {
      console.log("ControlCenterV2 component unmounted")
    }
  }, [])

  useEffect(() => {
    console.log("isEditing state changed:", isEditing)
  }, [isEditing])

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
  const [isDragging, setIsDragging] = useState(false)

  // Create a local state to track accessory statuses for immediate UI updates
  const [localAccessoryStatuses, setLocalAccessoryStatuses] = useState<Record<string, boolean>>({})

  // Add a state to track if the user has a temperature reader
  const [hasTemperatureReader, setHasTemperatureReader] = useState(false)

  const TEMPERATURE_SERVICE_UUID = "869c10ef-71d9-4f55-92d6-859350c3b8f6"

  // New state variables
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidgetForSettings, setSelectedWidgetForSettings] = useState<string | null>(null)

  // Filter accessories to only include supported types
  const supportedAccessories = useMemo(() => {
    if (!userData?.accessories) return []

    return userData.accessories.filter((accessory: any) => SUPPORTED_ACCESSORY_TYPES.includes(accessory.accessoryType))
  }, [userData?.accessories])

  // Initialize localAccessoryStatuses from userData when it changes
  useEffect(() => {
    if (userData?.accessories) {
      const statusMap: Record<string, boolean> = {}
      userData.accessories.forEach((accessory: any) => {
        statusMap[accessory.accessoryID] = !!accessory.accessoryConnectionStatus
      })
      setLocalAccessoryStatuses(statusMap)
    }
  }, [userData])

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
    console.log("Initializing control center layout")
    console.log("User data:", userData)
    console.log("Control center data:", userData?.controlCenter)

    // Check if user has saved widgets
    const hasSavedWidgets =
      userData?.controlCenter?.widgets &&
      Array.isArray(userData.controlCenter.widgets) &&
      userData.controlCenter.widgets.length > 0

    console.log("Has saved widgets:", hasSavedWidgets)

    if (hasSavedWidgets) {
      console.log("Initializing from user data")
      initializeFromUserData()
    } else {
      console.log("Initializing empty layout")
      initializeEmptyLayout()
    }
  }, [userData])

  // Add a function to handle local userData updates
  const handleLocalUserDataUpdate = useCallback(
    (accessoryId: string, isOn: boolean) => {
      setUserData((prevUserData) => {
        if (!prevUserData) return prevUserData

        // Create a deep copy of userData to avoid mutation
        const updatedUserData = JSON.parse(JSON.stringify(prevUserData))

        // Update the specific accessory in the accessories array
        updatedUserData.accessories = updatedUserData.accessories.map((accessory: any) => {
          if (accessory.accessoryID === accessoryId) {
            return {
              ...accessory,
              accessoryConnectionStatus: isOn,
            }
          }
          return accessory
        })

        return updatedUserData
      })
    },
    [setUserData],
  )

  // Initialize from user's saved control center data
  const initializeFromUserData = () => {
    console.log("Loading user's saved widgets")

    // Only use widgets that were explicitly saved by the user
    // Make sure we're not creating widgets for accessories automatically
    const userWidgets = userData.controlCenter?.widgets || []
    console.log("User widgets:", userWidgets)

    // Only set widgets if they exist and are in the correct format
    if (Array.isArray(userWidgets) && userWidgets.length > 0) {
      // Filter out widgets for accessories that are no longer supported
      const validWidgets = userWidgets.filter((widget) => {
        // For accessory-based widgets, check if the accessory exists and is supported
        if (widget.accessoryId) {
          const accessory = userData.accessories.find((a: any) => a.accessoryID === widget.accessoryId)
          return accessory && SUPPORTED_ACCESSORY_TYPES.includes(accessory.accessoryType)
        }
        // For utility widgets, they're always valid
        return true
      })

      setWidgets(validWidgets)

      // Create layout objects for react-grid-layout
      const userLayouts = {
        lg: [],
        md: [],
        sm: [],
        xs: [],
        xxs: [],
      }

      // Create layouts for each breakpoint
      validWidgets.forEach((widget: any) => {
        // Skip any malformed widgets
        if (!widget.id || !widget.position || !widget.size) {
          console.warn("Skipping malformed widget:", widget)
          return
        }

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
    } else {
      // If no valid widgets, initialize with empty arrays
      console.log("No valid widgets found in user data, initializing empty layout")
      initializeEmptyLayout()
    }
  }

  // Initialize with an empty layout - no default widgets
  const initializeEmptyLayout = () => {
    console.log("Setting up empty layout - no default widgets")
    setWidgets([])

    // Create empty layout objects for react-grid-layout
    const emptyLayouts = {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: [],
    }

    setLayouts(emptyLayouts)
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
      case "chaseLight":
        return "chaseLight"
      case "rgbLight":
        return "rgbLight"
      case "battery":
        return "battery"
      case "turnSignal":
        return "turnSignal"
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

  // Handle drag start
  const onDragStart = () => {
    setIsDragging(true)
    // Cancel any long press timers when dragging starts
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Handle drag stop
  const onDragStop = () => {
    setIsDragging(false)
  }

  // Start editing mode
  const handleStartEditing = () => {
    console.log("Starting edit mode")
    // Store the current layouts and widgets before editing
    setOriginalLayouts(JSON.parse(JSON.stringify(layouts)))
    setOriginalWidgets(JSON.parse(JSON.stringify(widgets)))
    // Force the edit mode to be true
    setIsEditing(true)
    console.log("Edit mode should now be enabled")
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
    const accessory = supportedAccessories.find((a: any) => a.accessoryID === accessoryId)
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

  // New function to handle widget settings
  const handleWidgetSettings = (widgetId: string) => {
    setSelectedWidgetForSettings(widgetId)
    setShowWidgetSettings(true)
    setContextMenu({ visible: false, widgetId: null, x: 0, y: 0 })
  }

  // New function to handle saving turn signal settings
  const handleSaveTurnSignalSettings = (settings: TurnSignalSettings) => {
    if (selectedWidgetForSettings) {
      setWidgets((prevWidgets) =>
        prevWidgets.map((widget) => {
          if (widget.id === selectedWidgetForSettings) {
            return {
              ...widget,
              settings: {
                ...widget.settings,
                ...settings,
              },
            }
          }
          return widget
        }),
      )
    }
  }

  // Handle long press start - MODIFIED to check for dragging state
  const handleWidgetMouseDown = (e: React.MouseEvent | React.TouchEvent, widgetId: string) => {
    // Only enable long press in editing mode and when not dragging
    if (!isEditing || isDragging) {
      return // Exit early if not in editing mode or if dragging
    }

    // Don't prevent default or stop propagation here - this allows drag to work
    // e.preventDefault()
    // e.stopPropagation()

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

  // Handle toggle for accessory status
  const handleToggleAccessory = (accessoryId: string, newStatus: boolean) => {
    // Update local state immediately for responsive UI
    setLocalAccessoryStatuses((prev) => ({
      ...prev,
      [accessoryId]: newStatus,
    }))

    // Call the server action to update the database
    toggleAccessoryStatus(accessoryId, newStatus)

    // Update userData for consistency
    handleLocalUserDataUpdate(accessoryId, newStatus)
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
    if (!accessory) return null

    const isConnected = true // In a real implementation, check if the accessory is connected

    // Use the local state for the current status instead of the accessory object
    // This ensures we always have the most up-to-date status
    const isOn = localAccessoryStatuses[widget.accessoryId] ?? accessory.accessoryConnectionStatus ?? false

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
            onToggle={() => handleToggleAccessory(widget.accessoryId, !isOn)}
            accessoryId={accessory.accessoryID}
            onUpdateUserData={handleLocalUserDataUpdate}
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
            onToggle={() => handleToggleAccessory(widget.accessoryId, !isOn)}
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
            onToggle={() => handleToggleAccessory(widget.accessoryId, !isOn)}
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
            onToggle={() => handleToggleAccessory(widget.accessoryId, !isOn)}
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
            onToggle={() => handleToggleAccessory(widget.accessoryId, !isOn)}
            onMouseDown={(e) => handleWidgetMouseDown(e, widget.id)}
            onMouseUp={() => handleWidgetMouseUp(widget.id)}
            onMouseLeave={() => handleWidgetMouseLeave(widget.id)}
            onTouchStart={(e) => handleWidgetMouseDown(e, widget.id)}
            onTouchEnd={() => handleWidgetMouseUp(widget.id)}
            onTouchCancel={() => handleWidgetMouseLeave(widget.id)}
          />
        )
      case "turnSignal":
        return (
          <TurnSignalWidget
            title="Turn Signals"
            accessoryId={widget.accessoryId}
            onLeft={() => {}}
            onRight={() => {}}
            onHazard={() => {}}
            settings={widget.settings?.turnSignal}
            onSettingsChange={(settings) => {
              const updatedWidgets = widgets.map((w) => {
                if (w.id === widget.id) {
                  return {
                    ...w,
                    settings: {
                      ...w.settings,
                      turnSignal: settings,
                    },
                  }
                }
                return w
              })
              setWidgets(updatedWidgets)
            }}
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
    <div className={`flex h-screen flex-col bg-black text-white ${isEditing ? "edit-mode" : ""}`}>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("Edit Layout button clicked")
                handleStartEditing()
              }}
              className="flex items-center gap-1"
            >
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
              accessories={supportedAccessories}
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
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          compactType="vertical"
          autoSize={true}
          draggableHandle={isEditing ? ".widget-container" : undefined}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              id={widget.id}
              className="widget-container bg-card rounded-lg shadow-sm overflow-hidden border h-full relative"
              data-grid-item-id={widget.id}
            >
              {renderWidget(widget)}
              {isEditing && <div className="absolute inset-0 cursor-move bg-transparent" />}
            </div>
          ))}
        </ResponsiveGridLayout>

        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-center text-primary mb-4 px-4">
              Lets add some widgets to the control center! Click on edit layout button to see the widgets you are able
              to add based on your accessories added thus far!
            </p>
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
              <button
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                onClick={() => handleWidgetSettings(contextMenu.widgetId!)}
              >
                <Settings className="h-4 w-4" />
                Edit Settings
              </button>

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
        {showWidgetSettings && selectedWidgetForSettings && (
          <TurnSignalSettingsDialog
            open={showWidgetSettings}
            onOpenChange={setShowWidgetSettings}
            settings={
              widgets.find((w) => w.id === selectedWidgetForSettings)?.settings?.turnSignal || {
                countdownEnabled: true,
                countdownDuration: 30,
              }
            }
            onSave={handleSaveTurnSignalSettings}
          />
        )}
      </div>
    </div>
  )
}
