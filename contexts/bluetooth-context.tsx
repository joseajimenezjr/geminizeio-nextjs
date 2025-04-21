"use client"

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { requestDevice, connectToDevice as connect } from "@/utils/bluetooth-utils"
import { disconnectDevice as disconnect } from "@/utils/bluetooth-utils"
import { setBluetoothCharacteristic, setBluetoothTemperatureCharacteristic } from "@/utils/bluetooth-commands"
import { bluetoothService } from "@/services/bluetooth-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface BluetoothContextType {
  isConnected: boolean
  isConnecting: boolean
  bluetoothStatus: {
    available: boolean
    error?: string
    errorType?: "permission" | "support" | "other"
  }
  connectToDevice: (deviceName?: string, serviceUUIDs?: string[]) => Promise<void>
  disconnectDevice: () => Promise<void>
  sendCommand: (value: number) => Promise<boolean>
  requestTemperatureUpdate: () => Promise<void>
  temperatureCharacteristic: BluetoothRemoteGATTCharacteristic | null
  autoConnect: () => Promise<void>
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null)
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null)
  const [temperatureCharacteristic, setTemperatureCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(
    null,
  )
  const [bluetoothStatus, setBluetoothStatus] = useState<{
    available: boolean
    error?: string
    errorType?: "permission" | "support" | "other"
  }>({ available: false })
  const { toast } = useToast()
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false)
  const supabase = createClientComponentClient()

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
  const connectToDevice = async (deviceName?: string, serviceUUIDs?: string[]) => {
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

    // Validate serviceUUIDs
    if (!serviceUUIDs || serviceUUIDs.length === 0) {
      toast({
        title: "Connection Error",
        description: "Service UUIDs are required for Bluetooth connection",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)

      // Log the connection attempt details
      console.log(`Attempting to connect to device: ${deviceName || "any"} with service UUIDs: ${serviceUUIDs}`)

      // Request a device - if deviceName is provided, use it to filter devices
      const device = await requestDevice(deviceName, serviceUUIDs)
      setBluetoothDevice(device)

      // Setup disconnect listener
      device.addEventListener("gattserverdisconnected", () => {
        console.log("Device disconnected")
        setIsConnected(false)
        characteristicRef.current = null
        setBluetoothCharacteristic(null)
        setTemperatureCharacteristic(null) // Clear temperature characteristic
        toast({
          title: "Disconnected",
          description: "Bluetooth device has been disconnected",
          variant: "default",
        })
      })

      // Connect to all services
      for (const serviceUUID of serviceUUIDs) {
        try {
          console.log(`Attempting to connect to service UUID: ${serviceUUID}`)
          const { server, service, characteristic } = await connect(device, [serviceUUID])

          if (serviceUUID === "869c10ef-71d9-4f55-92d6-859350c3b8f6") {
            // This is the temperature service
            setTemperatureCharacteristic(characteristic)
            setBluetoothTemperatureCharacteristic(characteristic)
            console.log(`Connected to temperature service with characteristic UUID: ${characteristic.uuid}`)

            // Start notifications for the temperature characteristic
            try {
              await characteristic.startNotifications()
              console.log("Temperature notifications started")

              characteristic.addEventListener("characteristicvaluechanged", (event) => {
                const value = new TextDecoder().decode(event.target.value)
                console.log("Raw temperature data received:", event.target.value)
                console.log("Current temperature:", value)
              })
            } catch (error) {
              console.error("Error starting temperature notifications:", error)
            }
          } else {
            // This is the main service
            characteristicRef.current = characteristic
            setBluetoothCharacteristic(characteristic)
            console.log(`Connected to main service with characteristic UUID: ${characteristic.uuid}`)
          }

          bluetoothService.setServer(server)
          bluetoothService.setServiceUUID(serviceUUID)
          console.log("Initialized bluetoothService with server and serviceUUID")
        } catch (serviceError: any) {
          console.warn(`Failed to connect to service ${serviceUUID}:`, serviceError)
        }
      }

      console.log("Bluetooth connection established")
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

  // Auto-connect function
  const autoConnect = async () => {
    if (autoConnectAttempted || isConnected || isConnecting) {
      return
    }

    setAutoConnectAttempted(true)

    try {
      // Get user data to get hub details
      console.log("Fetching user data for auto-connect...")
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        console.log("No active session, skipping auto-connect")
        return
      }

      const { data: profileData, error } = await supabase
        .from("Profiles")
        .select("hubDetails")
        .eq("id", sessionData.session.user.id)
        .single()

      if (error || !profileData?.hubDetails) {
        console.log("No hub details found for auto-connect")
        return
      }

      // Find a hub or relay_hub device in hubDetails
      const device = profileData.hubDetails.find(
        (device: any) => device.deviceType === "hub" || device.deviceType === "relay_hub",
      )

      if (device?.deviceName && device?.serviceName) {
        console.log(`Attempting auto-connect to device: ${device.deviceName} with service: ${device.serviceName}`)
        await connectToDevice(device.deviceName, device.serviceName)
      } else {
        console.log("Missing deviceName or serviceName in hubDevice", device)
      }
    } catch (error) {
      console.error("Error in auto-connect:", error)
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

  const requestTemperatureUpdate = async () => {
    if (!temperatureCharacteristic) {
      console.error("Temperature characteristic not set")
      toast({
        title: "Error",
        description: "Temperature characteristic not set",
        variant: "destructive",
      })
      return
    }

    try {
      const command = "temp-reading-request"
      const encoder = new TextEncoder()
      const data = encoder.encode(command)

      console.log(`Sending temperature request command: ${command}`)
      await temperatureCharacteristic.writeValue(data)
      console.log("Temperature request command sent successfully")
    } catch (error) {
      console.error("Error sending temperature request:", error)
      toast({
        title: "Error",
        description: "Failed to send temperature request",
        variant: "destructive",
      })
      return
    }
  }

  const disconnectDevice = async () => {
    if (!bluetoothDevice) {
      console.warn("No device to disconnect from.")
      return
    }

    try {
      await disconnect(bluetoothDevice)
      setIsConnected(false)
      characteristicRef.current = null
      setBluetoothCharacteristic(null)
      setTemperatureCharacteristic(null)
      setBluetoothDevice(null)

      toast({
        title: "Disconnected",
        description: "Device has been disconnected",
        variant: "default",
      })
    } catch (error) {
      console.error("Disconnection failed:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect from device",
        variant: "destructive",
      })
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
        requestTemperatureUpdate,
        temperatureCharacteristic,
        autoConnect,
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
