"use client"

import { useState, useEffect } from "react"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { bluetoothService, type RelayState, type RelayStates } from "@/services/bluetooth-service"

export function useDeviceBluetooth() {
  const { isConnected, server } = useBluetooth()
  const [relayStates, setRelayStates] = useState<RelayStates>({})
  const [relayCount, setRelayCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize the service and get relay states when connected
  useEffect(() => {
    if (isConnected && server) {
      const initializeService = async () => {
        try {
          setLoading(true)
          setError(null)

          // Initialize the service with the user's configuration
          await bluetoothService.initializeWithUserConfig(server)

          // Get the number of relays
          const count = await bluetoothService.getRelayCount()
          setRelayCount(count)

          // Get the current relay states
          const states = await bluetoothService.getRelayStates()
          setRelayStates(states)
        } catch (error) {
          console.error("Error initializing device bluetooth:", error)
          setError(error instanceof Error ? error.message : "Unknown error")
        } finally {
          setLoading(false)
        }
      }

      initializeService()
    } else {
      setLoading(false)
      setRelayStates({})
      setRelayCount(0)
    }
  }, [isConnected, server])

  // Toggle a relay
  const toggleRelay = async (relayNumber: number): Promise<boolean> => {
    if (!isConnected) return false

    try {
      const newState = await bluetoothService.toggleRelay(relayNumber)

      // Update the local state
      setRelayStates((prev) => ({
        ...prev,
        [relayNumber]: newState,
      }))

      return true
    } catch (error) {
      console.error(`Error toggling relay ${relayNumber}:`, error)
      return false
    }
  }

  // Set a relay to a specific state
  const setRelayState = async (relayNumber: number, state: RelayState): Promise<boolean> => {
    if (!isConnected) return false

    try {
      await bluetoothService.setRelayState(relayNumber, state)

      // Update the local state
      setRelayStates((prev) => ({
        ...prev,
        [relayNumber]: state,
      }))

      return true
    } catch (error) {
      console.error(`Error setting relay ${relayNumber} to ${state}:`, error)
      return false
    }
  }

  // Set all relays to the same state
  const setAllRelays = async (state: RelayState): Promise<boolean> => {
    if (!isConnected || relayCount === 0) return false

    try {
      await bluetoothService.setAllRelays(state, relayCount)

      // Update the local state
      const newStates: RelayStates = {}
      for (let i = 1; i <= relayCount; i++) {
        newStates[i] = state
      }
      setRelayStates(newStates)

      return true
    } catch (error) {
      console.error(`Error setting all relays to ${state}:`, error)
      return false
    }
  }

  // Refresh the relay states
  const refreshRelayStates = async (): Promise<boolean> => {
    if (!isConnected) return false

    try {
      setLoading(true)

      // Get the current relay states
      const states = await bluetoothService.getRelayStates()
      setRelayStates(states)

      return true
    } catch (error) {
      console.error("Error refreshing relay states:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    isConnected,
    loading,
    error,
    relayStates,
    relayCount,
    toggleRelay,
    setRelayState,
    setAllRelays,
    refreshRelayStates,
  }
}
