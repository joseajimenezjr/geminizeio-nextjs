"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { updateDeviceStatus } from "@/app/actions/user-data"
import { sendBluetoothCommand, isBluetoothConnected } from "@/utils/bluetooth-commands"
import { bluetoothService } from "@/services/bluetooth-service"
import { useToast } from "@/hooks/use-toast"

interface DashboardToggleProps {
  accessoryID?: string
  id?: string // For backward compatibility
  isOn?: boolean
  active?: boolean // For backward compatibility
  relayPosition?: string | null
  onToggle?: (isActive: boolean) => void // For backward compatibility
}

export function DashboardToggle({ accessoryID, id, isOn, active, relayPosition, onToggle }: DashboardToggleProps) {
  // Handle backward compatibility
  const deviceId = accessoryID || id || ""
  const initialState = isOn !== undefined ? isOn : active || false

  const [isToggling, setIsToggling] = useState(false)
  const [isActive, setIsActive] = useState(initialState)
  const { toast } = useToast()

  // Update isActive if the isOn or active prop changes
  useEffect(() => {
    const newState = isOn !== undefined ? isOn : active || false
    setIsActive(newState)
  }, [isOn, active])

  // Helper function to extract relay number from accessory ID or relay position
  const getRelayNumber = (): number => {
    // First try to use the relayPosition if available
    if (relayPosition) {
      console.log(`Using relayPosition: ${relayPosition} for accessory ${deviceId}`)
      const relayNum = Number.parseInt(relayPosition, 10)
      if (!isNaN(relayNum)) {
        return relayNum
      }
    }

    // Fall back to extracting from accessory ID (e.g., "D001" -> 1)
    if (deviceId && deviceId.length >= 4) {
      const numPart = deviceId.substring(1)
      const relayNum = Number.parseInt(numPart, 10)
      if (!isNaN(relayNum)) {
        return relayNum
      }
    }

    // Default to relay 1 if we can't determine
    return 1
  }

  const handleToggle = async () => {
    if (isToggling) return

    setIsToggling(true)
    const newState = !isActive

    console.log(`Toggling accessory ${deviceId} to ${newState ? "On" : "Off"}`)
    console.log(`Relay position: ${relayPosition} (${typeof relayPosition})`)

    // Try to send Bluetooth command if connected
    let bluetoothSuccess = false

    try {
      const relayNumber = getRelayNumber()
      console.log(`Using relay number: ${relayNumber} for accessory ${deviceId}`)

      // Check if Bluetooth is connected
      if (isBluetoothConnected()) {
        console.log(`Bluetooth is connected, sending command`)

        // Try using bluetoothService first
        if (bluetoothService.isConnected()) {
          try {
            console.log(`Using bluetoothService to set relay ${relayNumber} to ${newState ? "on" : "off"}`)
            await bluetoothService.setRelayState(relayNumber, newState ? "on" : "off")
            bluetoothSuccess = true
            console.log(`Bluetooth command sent successfully via bluetoothService`)
          } catch (serviceError) {
            console.error(`Error using bluetoothService:`, serviceError)
            console.log(`Falling back to legacy sendBluetoothCommand`)

            // Fall back to the legacy approach
            try {
              console.log(`Using legacy sendBluetoothCommand with value ${newState ? 1 : 0}`)
              bluetoothSuccess = await sendBluetoothCommand(newState ? 1 : 0)
              if (bluetoothSuccess) {
                console.log(`Legacy bluetooth command sent successfully`)
              }
            } catch (legacyError) {
              console.error(`Error using legacy bluetooth command:`, legacyError)
            }
          }
        } else {
          // Fall back to the legacy approach
          console.log(
            `bluetoothService not connected, using legacy sendBluetoothCommand with value ${newState ? 1 : 0}`,
          )
          try {
            bluetoothSuccess = await sendBluetoothCommand(newState ? 1 : 0)
            if (bluetoothSuccess) {
              console.log(`Legacy bluetooth command sent successfully`)
            }
          } catch (legacyError) {
            console.error(`Error using legacy bluetooth command:`, legacyError)
          }
        }

        if (bluetoothSuccess) {
          console.log(`Bluetooth command sent successfully`)
        } else {
          console.warn(`Bluetooth command failed for accessory ${deviceId}, but continuing with database update`)
        }
      } else {
        console.log(`Bluetooth is not connected, skipping Bluetooth command`)
      }
    } catch (error) {
      console.error(`Error toggling accessory:`, error)
    }

    // Always update the database, regardless of Bluetooth success
    try {
      // Call the onToggle callback if provided (for backward compatibility)
      if (onToggle) {
        onToggle(newState)
      }

      const result = await updateDeviceStatus(deviceId, newState)

      console.log(`Server response:`, result)

      if (result.success) {
        setIsActive(newState)

        // Only show toast if Bluetooth failed but database succeeded
        if (!bluetoothSuccess) {
          toast({
            title: "Status Updated",
            description: `${deviceId} is now ${newState ? "on" : "off"} (database only)`,
          })
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to update ${deviceId} status: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error updating device status:`, error)
      toast({
        title: "Error",
        description: "Failed to update device status",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Switch checked={isActive} onCheckedChange={handleToggle} disabled={isToggling} aria-label={`Toggle ${deviceId}`} />
  )
}
