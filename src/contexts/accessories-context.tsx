"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Alert } from "react-native"
import { useSupabase } from "./supabase-context"
import { useBluetooth } from "./bluetooth-context"

// Define the Accessory type
export interface Accessory {
  accessoryID: string
  accessoryName: string
  accessoryType: string
  accessoryConnectionStatus: boolean
  isFavorite: boolean
  location?: string
  relayPosition?: string
}

type AccessoriesContextType = {
  accessories: Accessory[]
  isLoading: Record<string, boolean>
  refreshAccessories: () => Promise<void>
  toggleAccessoryStatus: (id: string, status: boolean) => Promise<boolean>
  toggleAccessoryFavorite: (id: string, isFavorite: boolean) => Promise<boolean>
  updateAccessoryName: (id: string, name: string, relayPosition?: string) => Promise<boolean>
  addAccessory: (accessory: Omit<Accessory, "accessoryID">) => Promise<Accessory | null>
}

const AccessoriesContext = createContext<AccessoriesContextType | undefined>(undefined)

export const AccessoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const { supabase, user } = useSupabase()
  const { isConnected, sendCommand } = useBluetooth()

  // Load accessories when user changes
  useEffect(() => {
    if (user) {
      refreshAccessories()
    }
  }, [user])

  // Refresh accessories from Supabase
  const refreshAccessories = async () => {
    if (!user) return

    setIsLoading((prev) => ({ ...prev, refresh: true }))

    try {
      const { data, error } = await supabase.from("Profiles").select("accessories").eq("id", user.id).single()

      if (error) {
        throw error
      }

      if (data && Array.isArray(data.accessories)) {
        setAccessories(data.accessories)
      }
    } catch (error) {
      console.error("Error fetching accessories:", error)
      Alert.alert("Error", "Failed to load accessories")
    } finally {
      setIsLoading((prev) => ({ ...prev, refresh: false }))
    }
  }

  // Toggle accessory status
  const toggleAccessoryStatus = async (id: string, status: boolean): Promise<boolean> => {
    const loadingKey = `status-${id}`
    setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      // Find the accessory
      const accessory = accessories.find((a) => a.accessoryID === id)
      if (!accessory) {
        throw new Error(`Accessory with ID ${id} not found`)
      }

      // Update local state immediately for better UX
      setAccessories((prev) =>
        prev.map((a) => (a.accessoryID === id ? { ...a, accessoryConnectionStatus: status } : a)),
      )

      // Send Bluetooth command if connected and relay position is set
      if (isConnected && accessory.relayPosition) {
        const relayPosition = Number.parseInt(accessory.relayPosition.replace("relay-", ""))
        if (!isNaN(relayPosition)) {
          const commandValue = relayPosition * 10 + (status ? 1 : 0)
          await sendCommand(commandValue)
        }
      }

      // Update in Supabase
      const { data, error } = await supabase.from("Profiles").select("accessories").eq("id", user?.id).single()

      if (error) {
        throw error
      }

      const updatedAccessories = data.accessories.map((a: Accessory) =>
        a.accessoryID === id ? { ...a, accessoryConnectionStatus: status } : a,
      )

      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ accessories: updatedAccessories })
        .eq("id", user?.id)

      if (updateError) {
        throw updateError
      }

      return true
    } catch (error) {
      console.error("Error toggling accessory status:", error)

      // Revert local state on error
      setAccessories((prev) =>
        prev.map((a) => (a.accessoryID === id ? { ...a, accessoryConnectionStatus: !status } : a)),
      )

      Alert.alert("Error", "Failed to update accessory status")
      return false
    } finally {
      setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  // Toggle accessory favorite status
  const toggleAccessoryFavorite = async (id: string, isFavorite: boolean): Promise<boolean> => {
    const loadingKey = `favorite-${id}`
    setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      // Update local state immediately
      setAccessories((prev) => prev.map((a) => (a.accessoryID === id ? { ...a, isFavorite } : a)))

      // Update in Supabase
      const { data, error } = await supabase.from("Profiles").select("accessories").eq("id", user?.id).single()

      if (error) {
        throw error
      }

      const updatedAccessories = data.accessories.map((a: Accessory) =>
        a.accessoryID === id ? { ...a, isFavorite } : a,
      )

      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ accessories: updatedAccessories })
        .eq("id", user?.id)

      if (updateError) {
        throw updateError
      }

      return true
    } catch (error) {
      console.error("Error toggling favorite status:", error)

      // Revert local state on error
      setAccessories((prev) => prev.map((a) => (a.accessoryID === id ? { ...a, isFavorite: !isFavorite } : a)))

      Alert.alert("Error", "Failed to update favorite status")
      return false
    } finally {
      setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  // Update accessory name and relay position
  const updateAccessoryName = async (id: string, name: string, relayPosition?: string): Promise<boolean> => {
    const loadingKey = `name-${id}`
    setIsLoading((prev) => ({ ...prev, [loadingKey]: true }))

    try {
      // Find the accessory
      const accessory = accessories.find((a) => a.accessoryID === id)
      if (!accessory) {
        throw new Error(`Accessory with ID ${id} not found`)
      }

      // Update local state immediately
      setAccessories((prev) =>
        prev.map((a) =>
          a.accessoryID === id
            ? {
                ...a,
                accessoryName: name,
                relayPosition: relayPosition !== undefined ? relayPosition : a.relayPosition,
              }
            : a,
        ),
      )

      // Update in Supabase
      const { data, error } = await supabase.from("Profiles").select("accessories").eq("id", user?.id).single()

      if (error) {
        throw error
      }

      const updatedAccessories = data.accessories.map((a: Accessory) =>
        a.accessoryID === id
          ? {
              ...a,
              accessoryName: name,
              relayPosition: relayPosition !== undefined ? relayPosition : a.relayPosition,
            }
          : a,
      )

      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ accessories: updatedAccessories })
        .eq("id", user?.id)

      if (updateError) {
        throw updateError
      }

      return true
    } catch (error) {
      console.error("Error updating accessory:", error)

      // Revert local state on error
      const originalAccessory = accessories.find((a) => a.accessoryID === id)
      if (originalAccessory) {
        setAccessories((prev) => prev.map((a) => (a.accessoryID === id ? originalAccessory : a)))
      }

      Alert.alert("Error", "Failed to update accessory")
      return false
    } finally {
      setIsLoading((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  // Add a new accessory
  const addAccessory = async (accessory: Omit<Accessory, "accessoryID">): Promise<Accessory | null> => {
    setIsLoading((prev) => ({ ...prev, addAccessory: true }))

    try {
      // Generate a unique ID
      const accessoryID = `A${Date.now().toString().slice(-6)}`

      const newAccessory: Accessory = {
        ...accessory,
        accessoryID,
        accessoryConnectionStatus: false,
        isFavorite: false,
      }

      // Get current accessories
      const { data, error } = await supabase.from("Profiles").select("accessories").eq("id", user?.id).single()

      if (error) {
        throw error
      }

      const currentAccessories = data.accessories || []
      const updatedAccessories = [...currentAccessories, newAccessory]

      // Update in Supabase
      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ accessories: updatedAccessories })
        .eq("id", user?.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setAccessories((prev) => [...prev, newAccessory])

      return newAccessory
    } catch (error) {
      console.error("Error adding accessory:", error)
      Alert.alert("Error", "Failed to add accessory")
      return null
    } finally {
      setIsLoading((prev) => ({ ...prev, addAccessory: false }))
    }
  }

  const value = {
    accessories,
    isLoading,
    refreshAccessories,
    toggleAccessoryStatus,
    toggleAccessoryFavorite,
    updateAccessoryName,
    addAccessory,
  }

  return <AccessoriesContext.Provider value={value}>{children}</AccessoriesContext.Provider>
}

// Custom hook to use the Accessories context
export const useAccessories = () => {
  const context = useContext(AccessoriesContext)
  if (context === undefined) {
    throw new Error("useAccessories must be used within an AccessoriesProvider")
  }
  return context
}

