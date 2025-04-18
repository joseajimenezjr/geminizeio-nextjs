"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { requestDevice, connectToDevice as connect, disconnectDevice as disconnect } from "@/utils/bluetooth-utils"
import { setBluetoothCharacteristic } from "@/utils/bluetooth-commands"
import { bluetoothService } from "@/services/bluetooth-service"

interface BluetoothContextType {
  isConnected: boolean
  isConnecting: boolean
  bluetoothStatus: {
    available: boolean
    error?: string
    errorType?: "permission" | "support" | "other"
  }
  connectToDevice: (deviceName?: string, serviceUUID?: string) => Promise<void>
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

  // Debug connection state changes
  useEffect(() => {
    console.log(`Bluetooth connection state changed: ${isConnected ? "Connected" : "Disconnected"}`)
    console.log(`Characteristic reference: ${characteristicRef.current ? "Set" : "Not set"}`)
  }, [isConnected])

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
  const connectToDevice = async (deviceName?: string, serviceUUID?: string) => {
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

    // Validate serviceUUID
    if (!serviceUUID) {
      toast({
        title: "Connection Error",
        description: "Service UUID is required for Bluetooth connection",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)

      // Log the connection attempt details
      console.log(`Attempting to connect to device: ${deviceName || "any"} with service UUID: ${serviceUUID}`)

      // Request a device - if deviceName is provided, use it to filter devices
      const device = await requestDevice(deviceName, serviceUUID)
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
      const { server, service, characteristic } = await connect(device, serviceUUID)

      console.log(`Connected to device with characteristic UUID: ${characteristic.uuid}`)

      // Store the characteristic in the ref
      characteristicRef.current = characteristic

      // Set the characteristic in the utility file
      setBluetoothCharacteristic(characteristic)

      // Initialize the bluetoothService
      bluetoothService.setServer(server)
      bluetoothService.setServiceUUID(serviceUUID)
      console.log("Initialized bluetoothService with server and serviceUUID")

      console.log("Bluetooth connection established:", {
        deviceName: device.name,
        serviceUUID,
        characteristicUUID: characteristic.uuid,
      })

      setIsConnected(true)
      toast({
        title: "Connected",
        description: `Successfully connected to ${device.name || "device"}`,
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

      throw error // Re-throw the error so the calling component can handle it
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
          description: "Successfully disconnected from device",
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

  // Send command to device - updated to handle value 2 for shuffle
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

    // Ensure value is a number
    value = Number(value)

    // Handle NaN case explicitly
    if (isNaN(value)) {
      console.error(`Invalid command value: NaN. Only 0 (OFF), 1 (ON), and 2 (SHUFFLE) are supported.`)
      return false
    }

    try {
      // Create a Uint8Array with the raw value (0, 1, or 2)
      const data = new Uint8Array([value])

      // Send the raw value directly to the device
      await characteristicRef.current.writeValue(data)

      console.log(`Bluetooth write operation:
        - Command value: ${value}
        - Binary data: [${data}]
        - State: ${value === 0 ? "OFF" : value === 1 ? "ON" : "SHUFFLE"}
        - Characteristic UUID: ${characteristicRef.current.uuid}
      `)

      // Show appropriate toast message based on the value
      if (value === 2) {
        toast({
          title: "Command Sent",
          description: "Shuffle pattern activated",
        })
      } else {
        toast({
          title: "Command Sent",
          description: `Device turned ${value === 1 ? "ON" : "OFF"}`,
        })
      }

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

export function useBluetoothContext() {
  const context = useContext(BluetoothContext)
  if (context === undefined) {
    throw new Error("useBluetoothContext must be used within a BluetoothProvider")
  }
  return context
}

export const useBluetooth = useBluetoothContext
