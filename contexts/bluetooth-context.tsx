"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  requestDevice,
  connectToDevice as connect,
  disconnectDevice as disconnect,
  sendCommand as sendBluetoothCommand,
} from "@/utils/bluetooth-utils"
import { setBluetoothCharacteristic } from "@/utils/bluetooth-commands"

// Use the exact UUIDs from your working code
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

interface BluetoothContextType {
  isConnected: boolean
  isConnecting: boolean
  bluetoothStatus: {
    available: boolean
    error?: string
    errorType?: "permission" | "support" | "other"
  }
  connectToDevice: () => Promise<void>
  disconnectDevice: () => Promise<void>
  sendCommand: (value: number) => Promise<boolean>
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)
  const [bluetoothStatus, setBluetoothStatus] = useState<{
    available: boolean
    error?: string
    errorType?: "permission" | "support" | "other"
  }>({ available: false })
  const { toast } = useToast()

  // Check if Web Bluetooth is supported on component mount
  useEffect(() => {
    checkBluetoothAvailability()
  }, [])

  // Function to check if Bluetooth is available
  const checkBluetoothAvailability = async () => {
    // First check if the API exists
    if (typeof navigator === "undefined" || !("bluetooth" in navigator)) {
      setBluetoothStatus({
        available: false,
        error: "Web Bluetooth is not supported in your browser",
        errorType: "support",
      })
      return false
    }

    // Try to access the API to check for permissions
    try {
      // This is a minimal request just to test permissions
      await navigator.bluetooth.getAvailability()
      setBluetoothStatus({ available: true })
      return true
    } catch (error: any) {
      console.error("Bluetooth availability check error:", error)

      // Check for permissions policy error
      if (error.message && error.message.includes("permissions policy")) {
        setBluetoothStatus({
          available: false,
          error: "Bluetooth access is blocked by browser permissions",
          errorType: "permission",
        })
      } else if (error.name === "NotFoundError") {
        setBluetoothStatus({
          available: false,
          error: "No Bluetooth adapter found",
          errorType: "support",
        })
      } else {
        setBluetoothStatus({
          available: false,
          error: error.message || "Unknown Bluetooth error",
          errorType: "other",
        })
      }
      return false
    }
  }

  // Connect to Arduino device
  const connectToDevice = async () => {
    // Check availability again before attempting to connect
    const isAvailable = await checkBluetoothAvailability()

    if (!isAvailable) {
      toast({
        title: "Bluetooth Unavailable",
        description: bluetoothStatus.error || "Bluetooth is not available",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)

      // Request a device
      const device = await requestDevice()
      setBluetoothDevice(device)

      // Setup disconnect listener
      device.addEventListener("gattserverdisconnected", () => {
        console.log("Device disconnected")
        setIsConnected(false)
        characteristicRef.current = null
        setBluetoothCharacteristic(null)
        toast({
          title: "Disconnected",
          description: "Bluetooth device has been disconnected",
          variant: "default",
        })
      })

      // Connect to the device
      const { server, service, characteristic } = await connect(device)

      // Store the characteristic in the ref
      characteristicRef.current = characteristic
      setBluetoothCharacteristic(characteristic)

      setIsConnected(true)
      toast({
        title: "Connected",
        description: "Successfully connected to Arduino device",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Bluetooth connection error:", error)
      let errorMessage = "Failed to connect to Bluetooth device"

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect from device
  const disconnectDevice = async () => {
    if (bluetoothDevice) {
      try {
        await disconnect(bluetoothDevice)
        setIsConnected(false)
        characteristicRef.current = null
        setBluetoothCharacteristic(null)
        toast({
          title: "Disconnected",
          description: "Successfully disconnected from Arduino device",
        })
      } catch (error) {
        console.error("Disconnect error:", error)
        toast({
          title: "Error",
          description: "Failed to disconnect from device",
          variant: "destructive",
        })
      }
    }
  }

  // Send command to device - updated to handle relay position commands
  const sendCommand = async (value: number): Promise<boolean> => {
    if (!characteristicRef.current) {
      console.error("Not connected to a Bluetooth device.")
      toast({
        title: "Error",
        description: "Not connected to a Bluetooth device",
        variant: "destructive",
      })
      return false
    }

    // Valid values are now relay position (1-4) + state (0/1)
    // 10, 11, 20, 21, 30, 31, 40, 41
    const validValues = [10, 11, 20, 21, 30, 31, 40, 41]

    if (!validValues.includes(value)) {
      console.error(`Invalid command value: ${value}.`)
      toast({
        title: "Error",
        description: `Invalid command value: ${value}`,
        variant: "destructive",
      })
      return false
    }

    try {
      // Send the command using the utility function
      await sendBluetoothCommand(characteristicRef.current, value)

      // Extract relay position and state from the command value
      const relayPosition = Math.floor(value / 10)
      const state = value % 10

      toast({
        title: "Command Sent",
        description: `Relay ${relayPosition} turned ${state === 1 ? "ON" : "OFF"}`,
      })
      return true
    } catch (error) {
      console.error("Error sending command:", error)
      toast({
        title: "Error",
        description: "Failed to send command to device",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <BluetoothContext.Provider
      value={{
        isConnected,
        isConnecting,
        bluetoothStatus,
        connectToDevice,
        disconnectDevice,
        sendCommand,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  )
}

export function useBluetooth() {
  const context = useContext(BluetoothContext)
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider")
  }
  return context
}

