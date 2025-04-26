"use client"

import type React from "react"

import { useState } from "react"
import { Lightbulb } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAccessories } from "@/contexts/device-context"
import { cn } from "@/lib/utils"
import { useBluetoothContext } from "@/contexts/bluetooth-context"
import { useToast } from "@/hooks/use-toast"

// Predefined colors
const PRESET_COLORS = [
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#00FF00" },
  { name: "OrangeRed", hex: "#FF4500" },
  { name: "LimeGreen", hex: "#32CD32" },
  { name: "SteelBlue", hex: "#4682B4" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Purple", hex: "#800080" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Teal", hex: "#008080" },
  { name: "HotPink", hex: "#FF69B4" },
  { name: "Red", hex: "#FF0000" },
  { name: "White", hex: "#FFFFFF" },
]

interface RGBLightWidgetProps {
  title: string
  accessoryId: string
  isConnected: boolean
  isOn: boolean
  relayPosition?: string | number
  isEditing?: boolean
  lastRGBColor?: string
  onToggle: () => void
  onColorChange?: (color: string) => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function RGBLightWidget({
  title,
  accessoryId,
  isConnected,
  isOn,
  relayPosition,
  isEditing = false,
  lastRGBColor = "#FF0000", // Default to red if no color is provided
  onToggle,
  onColorChange,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: RGBLightWidgetProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [currentColor, setCurrentColor] = useState(lastRGBColor)
  const { updateAccessoryAttribute } = useAccessories()
  const { isConnected: isBtConnected, sendCommand } = useBluetoothContext()
  const { toast } = useToast()

  // Format relay position for display
  const formatRelayPosition = (position: string | number | undefined): string => {
    if (position === undefined || position === null || position === "") {
      return "No location set"
    }
    return `Relay ${position}`
  }

  const relayPositionDisplay = formatRelayPosition(relayPosition)

  // Handle color change
  const handleColorChange = async (color: string) => {
    setCurrentColor(color)

    // Send the hex code without the hashtag as a string to the Bluetooth device
    if (isBtConnected) {
      const hexCode = color.substring(1) // Remove the '#'
      const success = await sendCommand(hexCode)
      if (success) {
        console.log(`Sent color ${hexCode} to Bluetooth device`)
      } else {
        console.error("Failed to send color to Bluetooth device")
        toast({
          title: "Command Failed",
          description: "Failed to send color to Bluetooth device",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Bluetooth Error",
        description: "Not connected to a Bluetooth device",
        variant: "destructive",
      })
    }
  }

  // Save color and close dialog
  const handleSaveColor = async () => {
    if (onColorChange) {
      onColorChange(currentColor)
    }

    // Update the accessory attribute in the database
    try {
      await updateAccessoryAttribute(accessoryId, "lastRGBColor", currentColor)
      console.log(`Color ${currentColor} saved for accessory ${accessoryId}`)
    } catch (error) {
      console.error("Error saving RGB color:", error)
    }

    setColorPickerOpen(false)
  }

  return (
    <div className="flex flex-col h-full w-full bg-black rounded-xl text-white p-4 select-none">
      {/* Relay position indicator */}
      <div className="absolute top-2 right-2 text-xs text-muted-foreground px-1.5 py-0.5 rounded">{relayPositionDisplay}</div>
    <div className="container-jj">
      {/* Title with larger text and no background */}
      <div className="text-xl font-bold text-center mt-2">{title}</div>

      {/* Widget Content - Buttons with consistent size */}
      <div className="flex-1 flex items-center justify-center gap-6">
        {/* Light Toggle Button */}
        <button
          className={cn("w-20 h-20 rounded-full flex items-center justify-center bg-gray-900 border-2 border-gray-700")}
          onClick={onToggle}
          disabled={isEditing || !isConnected}
        >
          <Lightbulb className={cn("h-12 w-12", isOn ? "text-white" : "text-gray-500")} />
        </button>

        {/* Color Wheel Button */}
        <button
          className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden bg-gray-900 border-2 border-gray-700"
          onClick={() => setColorPickerOpen(true)}
          disabled={isEditing || !isConnected}
        >
          <div className="w-12 h-12 rounded-full" style={{ backgroundColor: currentColor }} />
        </button>
      </div>
    </div>
      {/* Color Picker Dialog */}
      <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose RGB Color for {title}</DialogTitle>
          </DialogHeader>

          {/* Preset Colors */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.hex}
                className={`w-12 h-12 rounded-full border-2 ${
                  currentColor === color.hex ? "border-white" : "border-gray-700"
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorChange(color.hex)}
                title={color.name}
              />
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setColorPickerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveColor}>Save Color</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
