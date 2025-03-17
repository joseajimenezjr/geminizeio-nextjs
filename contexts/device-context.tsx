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
      const response = await fetchWithAuth("/api/accessories/refresh", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

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
  }, [fetchWithAuth, toast])

  // Update the toggleDeviceStatus function:
  const toggleAccessoryStatus = useCallback(
    async (id: string, status: boolean): Promise<boolean> => {
      // Set loading state for this specific accessory
      const loadingKey = `status-${id}`
      setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

      try {
        console.log(`Toggling accessory ${id} to ${status ? "On" : "Off"}`)

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

        // Update the accessories state immediately with the new status for better UX
        setAccessories((prevAccessories) =>
          prevAccessories.map((accessory) => {
            if (accessory.accessoryID === id) {
              return {
                ...accessory,
                accessoryConnectionStatus: status,
              }
            }
            return accessory
          }),
        )

        // Try to send Bluetooth command if available
        if (isBluetoothConnected()) {
          // Send command: 1 for ON, 2 for OFF
          const commandValue = status ? "1" : "2"
          const commandSent = await sendBluetoothCommand(commandValue)

          if (!commandSent) {
            console.warn(`Bluetooth command failed for accessory ${id}, but continuing with database update`)
          } else {
            console.log(`Bluetooth command sent successfully for accessory ${id}`)
          }
        }

        // Call the server action to update the status
        const result = await updateDeviceStatus(id, status)

        console.log("Server response:", result)

        if (!result.success) {
          // Revert the state if the server update failed
          setAccessories((prevAccessories) =>
            prevAccessories.map((accessory) => {
              if (accessory.accessoryID === id) {
                return {
                  ...accessory,
                  accessoryConnectionStatus: !status,
                }
              }
              return accessory
            }),
          )

          toast({
            title: "Error",
            description: result.error || "Failed to update accessory status",
            variant: "destructive",
          })
          return false
        }

        // Update with the server response to ensure consistency
        if (result.updatedAccessories) {
          setAccessories(result.updatedAccessories)
        }

        return true
      } catch (error) {
        console.error("Error toggling accessory status:", error)

        // Revert the state if there was an error
        setAccessories((prevAccessories) =>
          prevAccessories.map((accessory) => {
            if (accessory.accessoryID === id) {
              return {
                ...accessory,
                accessoryConnectionStatus: !status,
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
        // Add a small delay before removing loading state for better UX
        setTimeout(() => {
          setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
        }, 500)
      }
    },
    [accessories, toast],
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

  const contextValue = {
    accessories,
    updateAccessories,
    toggleAccessoryStatus,
    toggleAccessoryFavorite,
    updateAccessoryNameInContext,
    isLoading,
    refreshAccessories,
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

