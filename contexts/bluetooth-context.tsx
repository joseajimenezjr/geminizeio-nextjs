"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
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
  sendCommand: (command: number) => Promise<boolean>
  requestTemperatureUpdate: () => Promise<void>
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [bluetoothStatus, setBluetoothStatus] = useState({
    available: false,
    error: undefined,
    errorType: null,
  })
  const [device, setDevice] = useState<BluetoothDevice | null>(null)
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null)
  const [temperatureCharacteristic, setTemperatureCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(
    null,
  )
  const { toast } = useToast()

  useEffect(() => {
    const checkBluetoothAvailability = async () => {
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
        await navigator.bluetooth.getAvailability()
        setBluetoothStatus({ available: true })
      } catch (error: any) {
        console.error("Bluetooth availability error:", error)
        setBluetoothStatus({
          available: false,
          error: error.message,
          errorType: "support",
        })
      }
    }

    checkBluetoothAvailability()
  }, [])

  const connect = async (deviceName?: string, serviceUUIDs?: string | string[]): Promise<boolean> => {
    setIsConnecting(true)
    try {
      // Request the Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: deviceName ? [{ name: deviceName }] : [],
        optionalServices: Array.isArray(serviceUUIDs) ? serviceUUIDs : [serviceUUIDs || "generic_attribute"],
      })

      setDevice(device)

      // Connect to the GATT server
      const server = await device.gatt?.connect()
      if (!server) {
        throw new Error("Failed to connect to GATT server")
      }
      setServer(server)

      // Get the service
      const serviceUUID = Array.isArray(serviceUUIDs) ? serviceUUIDs[0] : serviceUUIDs || "generic_attribute"
      const service = await server.getPrimaryService(serviceUUID)

      // Get the temperature characteristic
      const temperatureCharacteristic = await service.getCharacteristic("temperature")
      setTemperatureCharacteristic(temperatureCharacteristic)

      setIsConnected(true)
      toast({
        title: "Bluetooth Connected",
        description: `Connected to ${device.name}`,
      })
      return true
    } catch (error: any) {
      console.error("Bluetooth connection error:", error)
      setBluetoothStatus({ available: false, error: error.message, errorType: "support" })
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Bluetooth device",
        variant: "destructive",
      })
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    if (server && server.connected) {
      server.disconnect()
      setIsConnected(false)
      setDevice(null)
      setServer(null)
      setTemperatureCharacteristic(null)
      toast({
        title: "Bluetooth Disconnected",
        description: "Bluetooth device has been disconnected",
      })
    }
  }

  const sendCommand = async (command: number): Promise<boolean> => {
    if (!temperatureCharacteristic) {
      toast({
        title: "Not Connected",
        description: "Please connect to a Bluetooth device first",
        variant: "destructive",
      })
      return false
    }

    try {
      const data = new Uint8Array([command])
      await temperatureCharacteristic.writeValue(data)
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
  }

  const requestTemperatureUpdate = async () => {
    if (!temperatureCharacteristic) {
      console.warn("Temperature characteristic not available")
      return
    }

    try {
      await temperatureCharacteristic.readValue()
    } catch (error) {
      console.error("Error reading temperature:", error)
    }
  }

  const contextValue: BluetoothContextType = {
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
