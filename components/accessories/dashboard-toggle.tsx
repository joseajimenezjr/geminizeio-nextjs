"use client"
import { useState, useEffect, useRef } from "react"
import { useAccessories } from "@/contexts/device-context"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { CustomSwitch } from "@/components/ui/custom-switch"

interface DashboardToggleProps {
  id: string
  active?: boolean
  onToggle?: (active: boolean) => void
}

export function DashboardToggle({ id, active: propActive, onToggle }: DashboardToggleProps) {
  const { accessories, toggleAccessoryStatus, isLoading } = useAccessories()
  const { isConnected, sendCommand } = useBluetooth()
  const initialRender = useRef(true)

  // If id is undefined, log an error and return null
  if (id === undefined) {
    console.error("DashboardToggle received undefined id")
    return null
  }

  // Find the accessory in the context
  const accessory = accessories.find((a) => a.accessoryID === id)

  // If no accessory is found, log an error and return null
  if (!accessory) {
    console.error(`DashboardToggle: No accessory found with id ${id}`)
    return null
  }

  // Determine the active state from the accessory
  const contextActive = accessory.accessoryConnectionStatus

  // Use prop value if provided, otherwise use context value
  const initialActiveState = propActive !== undefined ? propActive : contextActive
  const [isActive, setIsActive] = useState<boolean>(initialActiveState ?? false)

  // Update local state when accessory state changes in context
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    const accessoryState = accessory ? accessory.accessoryConnectionStatus : false
    const stateToUse = propActive !== undefined ? propActive : accessoryState
    setIsActive(stateToUse)
  }, [accessory, propActive])

  // Check if this specific toggle is loading
  const loading = isLoading[`status-${id}`] || false

  // When calling toggleAccessoryStatus, pass the accessoryID
  const handleToggle = async (checked: boolean) => {
    // Log for debugging
    console.log(`Toggle clicked for accessory ${id}:`, {
      newState: checked,
      currentState: isActive,
      loading,
      accessory,
    })

    // Don't do anything if already loading
    if (loading) return

    // If there's an onToggle prop, call it
    if (onToggle) {
      onToggle(checked)
    }

    // Get the relay position from the accessory
    const relayPosition = accessory.relayPosition ? Number.parseInt(accessory.relayPosition) : null

    // If we have a valid relay position and Bluetooth is connected, send the command
    if (relayPosition !== null && isConnected) {
      // Construct the command value:
      // For ON: relay position + "1" (e.g., relay 1 → 11)
      // For OFF: relay position + "0" (e.g., relay 2 → 20)
      const commandValue = relayPosition * 10 + (checked ? 1 : 0)

      console.log(`Sending Bluetooth command: ${commandValue} for relay ${relayPosition} (${checked ? "ON" : "OFF"})`)

      try {
        // Send the Bluetooth command
        await sendCommand(commandValue)
      } catch (error) {
        console.error(`Error sending Bluetooth command for accessory ${id}:`, error)
      }
    } else if (relayPosition === null) {
      console.warn(`Accessory ${id} does not have a relay position set, skipping Bluetooth command`)
    } else if (!isConnected) {
      console.warn(`Bluetooth is not connected, skipping Bluetooth command for accessory ${id}`)
    }

    // Call the context method to update global state and server
    try {
      console.log(`Calling toggleAccessoryStatus with ID: ${id}, status: ${checked}`)

      const success = await toggleAccessoryStatus(id, checked)

      if (!success) {
        console.error(`Failed to toggle accessory ${id}`)
      } else {
        console.log(`Successfully toggled accessory ${id} to ${checked ? "On" : "Off"}`)
      }
    } catch (error) {
      console.error(`Error toggling accessory ${id}:`, error)
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="relative">
      <CustomSwitch
        checked={isActive}
        disabled={loading}
        onCheckedChange={handleToggle}
        aria-label={isActive ? "Turn off" : "Turn on"}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

