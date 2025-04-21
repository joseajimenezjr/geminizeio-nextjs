"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type Device, updateDeviceStatus, updateDeviceFavorite, updateDeviceName } from "@/app/actions/user-data"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
// Import the utility functions
import { isBluetoothConnected, sendBluetoothCommand } from "@/utils/bluetooth-commands"

interface DeviceContextType {
  accessories: Device[]
  updateAccessories: (newAccessories: Device[]) => void
  toggleAccessoryStatus: (id: string, status: boolean) => Promise<boolean>
  toggleAccessoryFavorite: (id: string, isFavorite: boolean) => Promise<boolean>
  updateAccessoryNameInContext: (id: string, name: string, relayPosition?: string) => Promise<boolean>
  isLoading: Record<string, boolean>
  refreshAccessories: () => Promise<void>
  deleteAccessoryFromContext: (id: string) => Promise<{ success: boolean; error?: string }>
  handleVoiceCommand: (target: string, action: string, relayPosition: number | null) => boolean
  updateAccessoryAttribute: (accessoryId: string, attributeName: string, value: any) => Promise<void>
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

export function DeviceProvider({
  children,
  initialAccessories,
}: { children: ReactNode; initialAccessories: Device[] }) {
  const [accessories, setAccessories] = useState<Device[]>(initialAccessories)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const { fetchWithAuth } = useApi()
  const [togglingAccessory, setTogglingAccessory] = useState<string | null>(null)
  const isToggling = (id: string) => togglingAccessory === id

  // Update accessories when initialAccessories changes (e.g., after server refetch)
  useEffect(() => {
    if (initialAccessories && initialAccessories.length > 0) {
      setAccessories(initialAccessories)
    }
  }, [initialAccessories])

  const updateAccessories = useCallback((newAccessories: Device[]) => {
    setAccessories(newAccessories)
  }, [])

  // Add a function to refresh accessories from the server
  const refreshAccessories = useCallback(async () => {
    try {
      setIsLoading((prev) => ({ ...prev, refresh: true }))

      // Fetch the latest accessory data using our auth-aware fetch
      const response = await fetchWithAuth("/api/accessories/refresh")

      if (response && response.accessories) {
        setAccessories(response.accessories)
      } else {
        console.warn("Received response without accessories:", response)
      }
    } catch (error) {
      console.error("Error refreshing accessories:", error)
      toast({
        title: "Error",
        description: "Failed to refresh accessories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, refresh: false }))
    }
  }, [toast, fetchWithAuth])

  // Update the toggleDeviceStatus function:
  const toggleAccessoryStatus = useCallback(
    async (id: string, status: boolean): Promise<boolean> => {
      // Prevent multiple simultaneous toggles for the same accessory
      if (togglingAccessory === id) {
        console.log(`🔄 DeviceContext: Already toggling accessory ${id}, skipping this request.`)
        return false
      }
      setTogglingAccessory(id)

      // Set loading state for this specific accessory
      const loadingKey = `status-${id}`
      setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

      try {
        console.log(`🔄 DeviceContext: Toggling accessory ${id} to ${status ? "On" : "Off"}`)

        // Find the accessory to determine which property it's using
        const accessory = accessories.find((a) => a.accessoryID === id)

        if (!accessory) {
          console.error(`Accessory with ID ${id} not found in context`)
          console.log(
            "Available accessories:",
            accessories.map((a) => ({ id: a.accessoryID })),
          )
          return false
        }

        console.log(`🔍 DeviceContext: Found accessory:`, accessory)

        // Get the relay position
        const relayPosition = accessory.relayPosition ? Number.parseInt(accessory.relayPosition) : 1
        console.log(`🔢 DeviceContext: Using relay position: ${relayPosition}`)

        // Try to send Bluetooth command if available
        if (isBluetoothConnected()) {
          // Send command: 0 for ON, 1 for OFF
          // const commandValue = status ? 0 : 1;
          const commandValue = status ? 1 : 0
          console.log(
            `🔌 DeviceContext: Sending Bluetooth command: ${commandValue} (${status ? "ON" : "OFF"}) to relay ${relayPosition}`,
          )

          const commandSent = await sendBluetoothCommand(commandValue, relayPosition)

          if (!commandSent) {
            console.warn(`Bluetooth command failed for accessory ${id}, but continuing with database update`)
          } else {
            console.log(`Bluetooth command sent successfully for accessory ${id}`)
          }

          console.log(`📡 DeviceContext: Bluetooth command result:`, commandSent ? "success" : "failed")
        }

        // Call the server action to update the status
        const result = await updateDeviceStatus(id, status)

        console.log(`🔄 DeviceContext: Server action result:`, result)

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to update accessory status",
            variant: "destructive",
          })
          return false
        }

        setAccessories((prevAccessories) => {
          return prevAccessories.map((acc) => {
            if (acc.accessoryID === id) {
              return {
                ...acc,
                accessoryConnectionStatus: status,
              }
            }
            return acc
          })
        })

        return true
      } catch (error) {
        console.error("Error toggling accessory status:", error)

        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        // Add a small delay before removing loading state for better UX
        setTimeout(() => {
          setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
          setTogglingAccessory(null) // Clear toggling state
        }, 500)
      }
    },
    [accessories, toast, setTogglingAccessory],
  )

  const toggleAccessoryFavorite = useCallback(
    async (id: string, isFavorite: boolean): Promise<boolean> => {
      // Set loading state for this specific accessory
      setIsLoading((prev) => ({ ...prev, [`favorite-${id}`]: true }))

      try {
        // Update local state immediately for better UX
        setAccessories((prevAccessories) =>
          prevAccessories.map((accessory) => (accessory.accessoryID === id ? { ...accessory, isFavorite } : accessory)),
        )

        // Update on the server
        const result = await updateDeviceFavorite(id, isFavorite)

        if (!result.success) {
          // Revert local state if server update failed
          setAccessories((prevAccessories) =>
            prevAccessories.map((accessory) =>
              accessory.accessoryID === id ? { ...accessory, isFavorite: !isFavorite } : accessory,
            ),
          )

          toast({
            title: "Error",
            description: result.error || "Failed to update favorite status",
            variant: "destructive",
          })
          return false
        }

        // Refresh accessories after a successful update
        await refreshAccessories()

        return true
      } catch (error) {
        console.error("Error toggling favorite status:", error)

        // Revert local state if there was an error
        setAccessories((prevAccessories) =>
          prevAccessories.map((accessory) =>
            accessory.accessoryID === id ? { ...accessory, isFavorite: !isFavorite } : accessory,
          ),
        )

        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading((prev) => ({ ...prev, [`favorite-${id}`]: false }))
      }
    },
    [toast, refreshAccessories],
  )

  const updateAccessoryNameInContext = useCallback(
    async (id: string, name: string, relayPosition?: string): Promise<boolean> => {
      // Set loading state for this specific accessory
      const loadingKey = `name-${id}`
      setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

      console.log(`DeviceContext: Updating accessory ${id} name to "${name}" and relay position to "${relayPosition}"`)

      try {
        // Find the accessory in our current state
        const accessoryToUpdate = accessories.find((accessory) => accessory.accessoryID === id)

        if (!accessoryToUpdate) {
          console.error(`Accessory with ID ${id} not found in current state`, accessories)
          toast({
            title: "Error",
            description: "Accessory not found",
            variant: "destructive",
          })
          return false
        }

        console.log(`Found accessory to update:`, accessoryToUpdate)

        // Update local state immediately for better UX
        setAccessories((prevAccessories) =>
          prevAccessories.map((accessory) => {
            if (accessory.accessoryID === id) {
              return {
                ...accessory,
                accessoryName: name,
                relayPosition: relayPosition !== undefined ? relayPosition : accessory.relayPosition,
              }
            }
            return accessory
          }),
        )

        // Update on the server
        const result = await updateDeviceName(id, name, relayPosition)

        console.log("Server action response:", result)

        if (!result.success) {
          // Get the original name and relay position
          const originalName = accessoryToUpdate.accessoryName || ""
          const originalRelayPosition = accessoryToUpdate.relayPosition || ""

          // Revert local state if server update failed
          setAccessories((prevAccessories) =>
            prevAccessories.map((accessory) => {
              if (accessory.accessoryID === id) {
                return {
                  ...accessory,
                  accessoryName: originalName,
                  relayPosition: originalRelayPosition,
                }
              }
              return accessory
            }),
          )

          toast({
            title: "Error",
            description: result.error || "Failed to update accessory",
            variant: "destructive",
          })
          return false
        }

        // If we have updated accessories from the server, use those
        if (result.updatedAccessories) {
          console.log("Updating accessories with server response:", result.updatedAccessories)
          setAccessories(result.updatedAccessories)
        } else {
          // Otherwise, refresh accessories to ensure we have the latest data
          await refreshAccessories()
        }

        return true
      } catch (error) {
        console.error("Error updating accessory:", error)

        // Find the accessory again to get the original values
        const accessoryToUpdate = accessories.find((accessory) => accessory.accessoryID === id)
        const originalName = accessoryToUpdate?.accessoryName || ""
        const originalRelayPosition = accessoryToUpdate?.relayPosition || ""

        // Revert local state if there was an error
        setAccessories((prevAccessories) =>
          prevAccessories.map((accessory) => {
            if (accessory.accessoryID === id) {
              return {
                ...accessory,
                accessoryName: originalName,
                relayPosition: originalRelayPosition,
              }
            }
            return accessory
          }),
        )

        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
      }
    },
    [accessories, toast, refreshAccessories],
  )

  const deleteAccessoryFromContext = useCallback(
    async (id: string) => {
      try {
        setIsLoading((prev) => ({ ...prev, [`delete-${id}`]: true }))

        // Call the API to delete the accessory
        const response = await fetch(`/api/accessories/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error deleting accessory:", errorData)
          return { success: false, error: errorData.message || "Failed to delete accessory" }
        }

        // Update the local state by removing the accessory
        setAccessories((prev) => prev.filter((acc) => acc.accessoryID !== id))

        return { success: true }
      } catch (error) {
        console.error("Error deleting accessory:", error)
        return { success: false, error: "An unexpected error occurred" }
      } finally {
        setIsLoading((prev) => ({ ...prev, [`delete-${id}`]: false }))
      }
    },
    [setAccessories, setIsLoading],
  )

  // Enhanced handleVoiceCommand function to support relay position commands
  const handleVoiceCommand = useCallback(
    (target: string, action: string, relayPosition: number | null) => {
      console.log(
        `Attempting to process voice command: target=${target}, action=${action}, relayPosition=${relayPosition}`,
      )

      // First, try to find the accessory by relay position if provided
      if (relayPosition !== null) {
        console.log(`Looking for accessory with relay position ${relayPosition}`)

        const matchingAccessory = accessories.find((acc) => {
          // Convert relayPosition to string for comparison since it might be stored as string
          const accRelayPosition = acc.relayPosition ? String(acc.relayPosition) : null
          return accRelayPosition === String(relayPosition)
        })

        if (matchingAccessory) {
          console.log(`Found matching accessory by relay position ${relayPosition}:`, matchingAccessory)
          const desiredState = action === "on"

          // Show a toast to confirm the command was recognized
          toast({
            title: `${action === "on" ? "Turning on" : "Turning off"} ${matchingAccessory.accessoryName}`,
            description: `Controlling relay position ${relayPosition}`,
          })

          toggleAccessoryStatus(matchingAccessory.accessoryID, desiredState)
          return true
        } else {
          console.log(`No accessory found with relay position ${relayPosition}`)
          toast({
            title: "Command not recognized",
            description: `No accessory found at relay position ${relayPosition}`,
            variant: "destructive",
          })
        }
      }

      // If no relay position or no match, try to find by name
      const matchingAccessory = accessories.find(
        (acc) =>
          acc.accessoryName.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(acc.accessoryName.toLowerCase()),
      )

      if (matchingAccessory) {
        console.log("Found matching accessory by name:", matchingAccessory)
        const desiredState = action === "on"

        // Show a toast to confirm the command was recognized
        toast({
          title: `${action === "on" ? "Turning on" : "Turning off"} ${matchingAccessory.accessoryName}`,
          description: matchingAccessory.relayPosition
            ? `Controlling relay position ${matchingAccessory.relayPosition}`
            : undefined,
        })

        toggleAccessoryStatus(matchingAccessory.accessoryID, desiredState)
        return true
      }

      console.log("No matching accessory found for target:", target)
      console.log(
        "Available accessories:",
        accessories.map((a) => a.accessoryName),
      )

      toast({
        title: "Command not recognized",
        description: `Could not find "${target}"`,
        variant: "destructive",
      })

      return false
    },
    [accessories, toggleAccessoryStatus, toast],
  )

  const updateAccessoryAttribute = useCallback(
    async (accessoryId: string, attributeName: string, value: any) => {
      try {
        // Find the accessory in the current state
        const accessoryIndex = accessories.findIndex((a) => a.accessoryID === accessoryId)
        if (accessoryIndex === -1) {
          console.error(`Accessory with ID ${accessoryId} not found`)
          return
        }

        // Create a copy of the accessories array
        const updatedAccessories = [...accessories]

        // Update the attribute
        updatedAccessories[accessoryIndex] = {
          ...updatedAccessories[accessoryIndex],
          [attributeName]: value,
        }

        // Update state
        setAccessories(updatedAccessories)

        // Save to database (you'll need to implement this API endpoint)
        const response = await fetch(`/api/accessories/${accessoryId}/attribute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attributeName,
            value,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update accessory attribute: ${response.statusText}`)
        }

        console.log(`Successfully updated ${attributeName} for accessory ${accessoryId}`)
      } catch (error) {
        console.error("Error updating accessory attribute:", error)
        throw error
      }
    },
    [accessories, setAccessories],
  )

  // Add handleVoiceCommand to the context value
  const contextValue = {
    accessories,
    updateAccessories,
    toggleAccessoryStatus,
    toggleAccessoryFavorite,
    updateAccessoryNameInContext,
    isLoading,
    refreshAccessories,
    deleteAccessoryFromContext,
    handleVoiceCommand,
    updateAccessoryAttribute,
  }

  return <DeviceContext.Provider value={contextValue}>{children}</DeviceContext.Provider>
}

export function useAccessories() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error("useAccessories must be used within a DeviceProvider")
  }
  return context
}
