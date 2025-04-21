"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
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
  setUserData: React.Dispatch<React.SetStateAction<any>>
}

export function ControlCenterV2({ vehicleName, vehicleType, userData, setUserData }: ControlCenterV2Props) {
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

  // Create a local state to track accessory statuses for immediate UI updates
  const [localAccessoryStatuses, setLocalAccessoryStatuses] = useState<Record<string, boolean>>({})

  // Add a state to track if the user has a temperature reader
  const [hasTemperatureReader, setHasTemperatureReader] = useState(false)

  const TEMPERATURE_SERVICE_UUID = "869c10ef-71d9-4f55-92d6-859350c3b8f6"

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
    if (userData?.controlCenter?.widgets?.length > 0) {
      initializeFromUserData()
    } else {
      initializeDefaultLayout()
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

  // Function to determine the widget type based on the accessory type
  const getWidgetTypeForAccessory = (accessoryType: string) => {
    switch (accessoryType) {
      case "light":
        return "light"
      case "utility":
        return "utility"
      case "temp_reader":
        return "temperature" // Use the temperature widget for temperature readers
      case "battery_reader":
        return "battery" // Use the battery widget for battery readers
      default:
        return "status" // Default to a status widget if type is unknown
    }
  }

  const onLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts)
  }

  const handleAddWidget = (widgetType: string) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      position: { x: 0, y: 0 },
      size: WIDGET_SIZES[widgetType],
    }

    setWidgets([...widgets, newWidget])

    // Update the layout for the new widget
    setLayouts((prevLayouts: any) => {
      const newLayout = {
        i: newWidget.id,
        x: 0,
        y: 0,
        w: newWidget.size.w,
        h: newWidget.size.h,
        isResizable: false,
      }

      return {
        lg: [...(prevLayouts.lg || []), newLayout],
        md: [...(prevLayouts.md || []), newLayout],
        sm: [...(prevLayouts.sm || []), newLayout],
        xs: [...(prevLayouts.xs || []), newLayout],
        xxs: [...(prevLayouts.xxs || []), newLayout],
      }
    })
  }

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prevWidgets) => prevWidgets.filter((widget) => widget.id !== widgetId))
    setLayouts((prevLayouts: any) => {
      const updatedLayouts = { ...prevLayouts }
      for (const key in updatedLayouts) {
        if (updatedLayouts.hasOwnProperty(key)) {
          updatedLayouts[key] = updatedLayouts[key].filter((layout: any) => layout.i !== widgetId)
        }
      }
      return updatedLayouts
    })
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      // Save current layouts as original layouts when entering edit mode
      setOriginalLayouts(layouts)
      setOriginalWidgets(widgets)
    } else {
      // Revert to original layouts when exiting edit mode
      setLayouts(originalLayouts)
      setWidgets(originalWidgets)
    }
  }

  const handleSaveLayout = async () => {
    try {
      const widgetData = widgets.map((widget) => {
        const layout = layouts.lg.find((l: any) => l.i === widget.id)
        return {
          id: widget.id,
          type: widget.type,
          position: { x: layout.x, y: layout.y },
          size: { w: layout.w, h: layout.h },
        }
      })

      const result = await saveWidgetLayout({
        vehicleName: vehicleName,
        widgetData: widgetData,
      })

      if (result?.success) {
        toast({
          title: "Layout Saved",
          description: "Your control center layout has been saved.",
        })
      } else {
        toast({
          title: "Error Saving Layout",
          description: result?.error || "Failed to save the control center layout.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error Saving Layout",
        description: error.message || "Failed to save the control center layout.",
        variant: "destructive",
      })
    }
  }

  const handleResetLayout = () => {
    initializeDefaultLayout()
    toast({
      title: "Layout Reset",
      description: "Your control center layout has been reset to the default.",
    })
  }

  const handleContextMenu = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      widgetId: widgetId,
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleAccessoryToggle = async (accessoryId: string, initialStatus: boolean) => {
    // Optimistically update the local state immediately
    setLocalAccessoryStatuses((prevStatuses) => ({
      ...prevStatuses,
      [accessoryId]: !initialStatus,
    }))

    // Update local user data
    handleLocalUserDataUpdate(accessoryId, !initialStatus)

    try {
      // Call the toggleAccessoryStatus function from the context
      await toggleAccessoryStatus(accessoryId, !initialStatus)

      // If the API call is successful, the local state remains updated
      toast({
        title: "Accessory Status Updated",
        description: `Accessory ${accessoryId} is now ${!initialStatus ? "on" : "off"}.`,
      })
    } catch (error: any) {
      // If there's an error, revert the local state
      setLocalAccessoryStatuses((prevStatuses) => ({
        ...prevStatuses,
        [accessoryId]: initialStatus,
      }))

      // Revert local user data
      handleLocalUserDataUpdate(accessoryId, initialStatus)

      toast({
        title: "Error Updating Accessory Status",
        description: error.message || "Failed to update accessory status.",
        variant: "destructive",
      })
    }
  }

  const renderWidget = (widget: any) => {
    const accessory = accessories?.find((acc) => acc.accessoryID === widget.accessoryId)
    const accessoryStatus = localAccessoryStatuses[widget.accessoryId]

    switch (widget.type) {
      case "light":
        return (
          <ToggleWidget
            accessoryName={accessory?.accessoryName || "Light"}
            accessoryId={widget.accessoryId}
            initialStatus={accessoryStatus}
            onToggle={handleAccessoryToggle}
          />
        )
      case "utility":
        return (
          <UtilityWidget
            accessoryName={accessory?.accessoryName || "Utility"}
            accessoryId={widget.accessoryId}
            initialStatus={accessoryStatus}
            onToggle={handleAccessoryToggle}
          />
        )
      case "gauge":
        return <GaugeWidget />
      case "speedometer":
        return <SpeedometerWidget />
      case "status":
        return (
          <div>
            Status Widget - {accessory?.accessoryName || "Unknown Accessory"} (ID: {widget.accessoryId})
          </div>
        )
      case "winch":
        return <StandaloneWinchWidget />
      case "weather":
        return <WeatherWidget />
      case "speed-display":
        return <SpeedDisplayWidget />
      case "rpm-display":
        return <RPMDisplayWidget />
      case "chaseLight":
        return <ChaseLightWidget />
      case "rgbLight":
        return <RGBLightWidget accessoryId={widget.accessoryId} /> // Render RGB Light widget
      case "battery":
        return <BatteryWidget accessoryId={widget.accessoryId} /> // Render Battery widget
      case "temperature":
        return <TemperatureWidget accessoryId={widget.accessoryId} /> // Render Temperature widget
      case "timer":
        return <TimerWidget />
      default:
        return <div>Unknown Widget</div>
    }
  }

  return (
    <div className="relative h-full">
      <style>{longPressStyle}</style>
      <div className="flex justify-between items-center p-4">
        <h2 className="text-2xl font-bold">{vehicleName} Control Center</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowOBDIILibrary(true)} disabled={!hasOBD2Accessory}>
            <Settings className="w-4 h-4 mr-2" /> OBD2 Settings
          </Button>
          <Button variant="outline" onClick={() => setShowUtilityLibrary(true)}>
            <Settings className="w-4 h-4 mr-2" /> Utility Settings
          </Button>
          <Button variant="outline" onClick={() => setShowLibrary(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Widget
          </Button>
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleSaveLayout}>
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button variant="destructive" onClick={handleResetLayout}>
                <Undo className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button onClick={handleToggleEdit}>Exit Edit Mode</Button>
            </>
          ) : (
            <Button onClick={handleToggleEdit}>Edit Layout</Button>
          )}
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 4, sm: 2, xs: 2, xxs: 1 }}
        rowHeight={GRID_CONFIG.rowHeight}
        isDraggable={isEditing}
        isResizable={false}
        onLayoutChange={onLayoutChange}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="widget"
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              textAlign: "center",
            }}
            onContextMenu={(e) => handleContextMenu(e, widget.id)}
          >
            {renderWidget(widget)}
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1"
                onClick={() => handleRemoveWidget(widget.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>

      {contextMenu.visible && (
        <div
          className="absolute z-50 bg-white border rounded shadow-md"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={handleCloseContextMenu}
          onMouseLeave={handleCloseContextMenu}
        >
          <ul>
            <li className="px-4 py-2 hover:bg-gray-100">
              <button onClick={() => handleRemoveWidget(contextMenu.widgetId!)}>Remove Widget</button>
            </li>
          </ul>
        </div>
      )}

      <WidgetLibrary show={showLibrary} onClose={() => setShowLibrary(false)} onAddWidget={handleAddWidget} />
      <UtilityLibrary show={showUtilityLibrary} onClose={() => setShowUtilityLibrary(false)} />
      <OBDIILibrary show={showOBDIILibrary} onClose={() => setShowOBDIILibrary(false)} />
    </div>
  )
}
