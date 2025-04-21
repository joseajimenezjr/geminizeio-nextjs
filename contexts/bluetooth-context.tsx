"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface BluetoothContextType {
  isConnected: boolean
  isConnecting: boolean
  bluetoothStatus: {
    available: boolean
    error?: string
    errorType?: "permission" | "support" | null
  }
  device: BluetoothDevice | null
  server: BluetoothRemoteGATTServer | null
  temperatureCharacteristic: BluetoothRemoteGATTCharacteristic | null
  connect: (deviceName?: string, serviceUUIDs?: string | string[]) => Promise<boolean>
  disconnect: () => void
  sendCommand: (command: number, relayPosition?: number) => Promise<boolean>
  requestTemperatureUpdate: () => Promise<void>
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [bluetoothStatus, setBluetoothStatus] = useState({
    available: false,
    error: undefined,
    errorType: null as "permission" | "support" | null,
  })
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null)
  const [temperatureCharacteristic, setTemperatureCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(
    null,
  )
  const { toast } = useToast()

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined" && typeof navigator !== "undefined"

  useEffect(() => {
    const checkBluetoothAvailability = async () => {
      if (!isBrowser) {
        return // Skip on server-side
      }

      if (!navigator.bluetooth) {
        setBluetoothStatus({
          available: false,
          error: "Web Bluetooth API is not available in this browser.",
          errorType: "support",
        })
        return
      }

      try {
        // Check for Bluetooth availability
        const available = await navigator.bluetooth.getAvailability()
        setBluetoothStatus({
          available,
          error: available ? undefined : "Bluetooth is not available on this device.",
          errorType: available ? null : "support",
        })
      } catch (error: any) {
        console.error("Bluetooth availability error:", error)
        setBluetoothStatus({
          available: false,
          error: error.message,
          errorType: "support",
        })
      }
    }

    if (isBrowser) {
      checkBluetoothAvailability()
    }
  }, [isBrowser])

  const connect = useCallback(
    async (deviceName?: string, serviceUUIDs?: string | string[]): Promise<boolean> => {
      if (!isBrowser) {
        console.warn("Bluetooth is not available in server-side rendering")
        return false
      }

      if (!navigator.bluetooth) {
        toast({
          title: "Bluetooth Not Supported",
          description: "Web Bluetooth API is not available in this browser.",
          variant: "destructive",
        })
        return false
      }

      setIsConnecting(true)

      try {
        console.log(`Connecting to device: ${deviceName || "any"} with services:`, serviceUUIDs)

        // Request the Bluetooth device
        const requestOptions: RequestDeviceOptions = {
          acceptAllDevices: !deviceName,
        }

        if (deviceName) {
          requestOptions.filters = [{ name: deviceName }]
        }

        if (serviceUUIDs) {
          requestOptions.optionalServices = Array.isArray(serviceUUIDs) ? serviceUUIDs : [serviceUUIDs]
        }

        console.log("Request options:", requestOptions)
        const bluetoothDevice = await navigator.bluetooth.requestDevice(requestOptions)

        if (!bluetoothDevice) {
          throw new Error("No Bluetooth device selected")
        }

        console.log("Device selected:", bluetoothDevice.name)
        setDevice(bluetoothDevice)

        // Connect to the GATT server
        console.log("Connecting to GATT server...")
        if (!bluetoothDevice.gatt) {
          throw new Error("Device does not have GATT server")
        }

        const gattServer = await bluetoothDevice.gatt.connect()
        console.log("GATT server connected:", gattServer)
        setServer(gattServer)

        // For now, we'll just set connected state without trying to get services
        // This makes the connection more robust for different types of devices
        setIsConnected(true)

        toast({
          title: "Bluetooth Connected",
          description: `Connected to ${bluetoothDevice.name || "device"}`,
        })

        // Store connection state in localStorage for persistence
        localStorage.setItem("bluetoothConnected", "true")

        return true
      } catch (error: any) {
        console.error("Bluetooth connection error:", error)

        setBluetoothStatus({
          ...bluetoothStatus,
          error: error.message,
          errorType: error.message.includes("permission") ? "permission" : "support",
        })

        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to Bluetooth device",
          variant: "destructive",
        })

        return false
      } finally {
        setIsConnecting(false)
      }
    },
    [isBrowser, toast, bluetoothStatus],
  )

  const disconnect = useCallback(() => {
    if (device && server) {
      try {
        if (server.connected) {
          server.disconnect()
        }

        setIsConnected(false)
        setDevice(null)
        setServer(null)
        setTemperatureCharacteristic(null)

        // Update localStorage
        localStorage.setItem("bluetoothConnected", "false")

        toast({
          title: "Bluetooth Disconnected",
          description: "Bluetooth device has been disconnected",
        })
      } catch (error) {
        console.error("Error disconnecting:", error)
      }
    }
  }, [device, server, toast])

  const sendCommand = useCallback(
    async (command: number, relayPosition = 1): Promise<boolean> => {
      console.log(`Sending command ${command} to relay ${relayPosition}`)

      if (!isConnected || !server) {
        console.warn("Not connected to Bluetooth device")
        toast({
          title: "Not Connected",
          description: "Please connect to a Bluetooth device first",
          variant: "destructive",
        })
        return false
      }

      try {
        // For now, we'll simulate sending a command
        console.log(`Simulating command: ${command} to relay ${relayPosition}`)

        // In a real implementation, you would:
        // 1. Get the appropriate service
        // 2. Get the characteristic
        // 3. Write the command value

        // Simulate success
        toast({
          title: "Command Sent",
          description: `Sent command ${command} to relay ${relayPosition}`,
        })

        return true
      } catch (error) {
        console.error("Error sending command:", error)
        toast({
          title: "Command Failed",
          description: error instanceof Error ? error.message : "Failed to send command to device",
          variant: "destructive",
        })
        return false
      }
    },
    [isConnected, server, toast],
  )

  const requestTemperatureUpdate = useCallback(async () => {
    if (!temperatureCharacteristic) {
      console.warn("Temperature characteristic not available")
      return
    }

    try {
      await temperatureCharacteristic.readValue()
    } catch (error) {
      console.error("Error reading temperature:", error)
    }
  }, [temperatureCharacteristic])

  const contextValue = {
    isConnected,
    isConnecting,
    bluetoothStatus,
    device,
    server,
    temperatureCharacteristic,
    connect,
    disconnect,
    sendCommand,
    requestTemperatureUpdate,
  }

  return <BluetoothContext.Provider value={contextValue}>{children}</BluetoothContext.Provider>
}

export function useBluetooth() {
  const context = useContext(BluetoothContext)
  if (!context) {
    throw new Error("useBluetooth must be used within a BluetoothProvider")
  }
  return context
}

export const useBluetoothContext = useBluetooth
