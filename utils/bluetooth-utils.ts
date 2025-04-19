"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bluetooth } from "lucide-react"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { getUserData } from "@/app/actions/user-data"
import { bluetoothService } from "@/services/bluetooth-service"

// Function to request a Bluetooth device
export async function requestDevice(deviceName?: string, serviceUUIDs?: string[]): Promise<BluetoothDevice> {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth API is not available in this browser.")
  }

  console.log(`Requesting Bluetooth device with name: ${deviceName || "any"}, serviceUUIDs: ${serviceUUIDs || "none"}`)

  // Prepare request options based on the desired format
  let options: RequestDeviceOptions

  if (deviceName) {
    // If we have a device name, use it as a filter and add serviceUUID to optionalServices
    options = {
      filters: [{ name: deviceName }],
    }

    // Add optionalServices if serviceUUID is provided
    if (serviceUUIDs && serviceUUIDs.length > 0) {
      options.optionalServices = serviceUUIDs
    }
  } else {
    // If no device name is provided, fall back to acceptAllDevices
    options = {
      acceptAllDevices: true,
    }

    // Still add optionalServices if serviceUUID is provided
    if (serviceUUIDs && serviceUUIDs.length > 0) {
      options.optionalServices = serviceUUIDs
    }
  }

  console.log("Bluetooth scan options:", JSON.stringify(options, null, 2))

  try {
    const device = await navigator.bluetooth.requestDevice(options)
    console.log("Bluetooth device selected:", device.name || "unnamed device")
    return device
  } catch (error) {
    console.error("Error requesting Bluetooth device:", error)
    throw error
  }
}

// Function to connect to a Bluetooth device
export async function connectToDevice(
  device: BluetoothDevice,
  serviceUUIDs: string[],
): Promise<{
  server: BluetoothRemoteGATTServer
  service: BluetoothRemoteGATTService
  characteristic: BluetoothRemoteGATTCharacteristic
}> {
  if (!device.gatt) {
    throw new Error("Device does not have GATT server")
  }

  let server: BluetoothRemoteGATTServer | null = null
  let service: BluetoothRemoteGATTService | null = null
  let characteristic: BluetoothRemoteGATTCharacteristic | null = null

  for (const serviceUUID of serviceUUIDs) {
    try {
      console.log(`Attempting to connect to service UUID: ${serviceUUID}`)
      console.log(`Connecting to GATT server for device: ${device.name || "unnamed"}`)
      server = await device.gatt.connect()

      console.log(`Getting primary service with UUID: ${serviceUUID}`)
      service = await server.getPrimaryService(serviceUUID)

      // Get all characteristics
      console.log("Getting characteristics for service")
      const characteristics = await service.getCharacteristics()
      console.log(
        `Found ${characteristics.length} characteristics:`,
        characteristics.map((c) => c.uuid),
      )

      // Use the first characteristic if available, otherwise try to get one with the same UUID as the service
      if (characteristics.length > 0) {
        characteristic = characteristics[0]
        console.log(`Using first characteristic: ${characteristic.uuid}`)
      } else {
        console.log(`BluetoothService: No characteristics found, trying to get one with UUID: ${serviceUUID}`)
        characteristic = await service.getCharacteristic(serviceUUID)
      }

      console.log("Connected successfully to device and got characteristic")

      // Initialize the bluetoothService with the server and serviceUUID
      bluetoothService.setServer(server)
      bluetoothService.setServiceUUID(serviceUUID)
      bluetoothService.setCharacteristic(characteristic)
      console.log("Initialized bluetoothService with server, serviceUUID, and characteristic")

      // If successful, break out of the loop
      break
    } catch (error) {
      console.warn(`Failed to connect with service UUID: ${serviceUUID}`, error)
      // If it fails, and it's the last service UUID, throw the error
      if (serviceUUID === serviceUUIDs[serviceUUIDs.length - 1]) {
        throw error
      }
      // Otherwise, continue to the next service UUID
    }
  }

  if (!server || !service || !characteristic) {
    throw new Error("Failed to connect to any of the provided services")
  }

  return { server, service, characteristic }
}

// Function to disconnect from a Bluetooth device
export async function disconnectDevice(device: BluetoothDevice): Promise<void> {
  if (device.gatt && device.gatt.connected) {
    console.log("Disconnecting from device...")
    device.gatt.disconnect()
    console.log("Disconnected successfully")
  } else {
    console.log("Device already disconnected")
  }
}

// Function to send a command to a Bluetooth characteristic
export async function sendCommand(
  characteristic: BluetoothRemoteGATTCharacteristic,
  value: number,
  relayNumber = 1,
): Promise<void> {
  // Ensure value is a number
  value = Number(value)

  // Handle NaN case
  if (isNaN(value)) {
    console.error("Invalid command value: NaN")
    throw new Error("Invalid command value: NaN")
  }

  // Normalize to 0 or 1 (0 for ON, 1 for OFF)
  value = value === 0 ? 1 : 0 // Flip the value: 0 input -> 1 (OFF), non-zero input -> 0 (ON)

  // Create a simple command array with format: [relay_number, state_value]
  const commandArray = new Uint8Array([
    relayNumber, // Relay number (1-based)
    value, // State (0 = on, 1 = off)
  ])

  console.log(`Sending command array to characteristic:
   - Relay: ${relayNumber}
   - Value: ${value} (${value === 0 ? "ON" : "OFF"})
   - Binary data: [${Array.from(commandArray)}]
   - Characteristic UUID: ${characteristic.uuid}
 `)

  await characteristic.writeValue(commandArray)
  console.log("Command sent successfully")
}

export function BluetoothNavButton() {
  const { isConnected, connectToDevice, disconnectDevice } = useBluetooth()
  const [isFlashing, setIsFlashing] = useState(false)

  // Default service UUID as fallback
  const DEFAULT_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"

  // Toggle flashing effect when disconnected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setIsFlashing((prev) => !prev)
      }, 500)
      return () => clearInterval(interval)
    } else {
      setIsFlashing(false)
    }
  }, [isConnected])

  const handleClick = async () => {
    if (isConnected) {
      await disconnectDevice()
    } else {
      try {
        // Fetch user data to get hub details
        console.log("Fetching user data...")
        const userData = await getUserData()
        console.log("User data received:", userData)

        // Initialize variables
        let deviceName = undefined
        let serviceUUIDs: string[] = [DEFAULT_SERVICE_UUID] // Default fallback

        if (userData?.hubDetails) {
          console.log("Hub details found:", userData.hubDetails)

          // Check if hubDetails is an array
          if (Array.isArray(userData.hubDetails)) {
            console.log("Hub details is an array with", userData.hubDetails.length, "items")

            // Loop through the array to find a device with deviceType = "relay_hub"
            const relayHub = userData.hubDetails.find((hub) => hub.deviceType === "relay_hub")

            if (relayHub) {
              console.log("Found relay hub:", relayHub)
              deviceName = relayHub.deviceName

              // Extract service UUIDs if available
              if (relayHub.serviceName && Array.isArray(relayHub.serviceName) && relayHub.serviceName.length > 0) {
                serviceUUIDs = relayHub.serviceName
                console.log(`Using service UUIDs from profile:`, serviceUUIDs)
              } else {
                console.log(`No services found in relay hub, using default:`, DEFAULT_SERVICE_UUID)
              }

              console.log(`Using relay hub device name: ${deviceName}`)
            } else {
              console.log("No relay hub found in hubDetails array")
            }
          } else {
            // If it's a single object (not an array)
            console.log("Hub details is a single object")
            if (userData.hubDetails.deviceType === "relay_hub") {
              deviceName = userData.hubDetails.deviceName

              // Extract service UUIDs if available
              if (
                userData.hubDetails.services &&
                Array.isArray(userData.hubDetails.services) &&
                userData.hubDetails.services.length > 0
              ) {
                serviceUUIDs = userData.hubDetails.services
                console.log(`Using service UUIDs from profile:`, serviceUUIDs)
              } else {
                console.log(`No services found in relay hub, using default:`, DEFAULT_SERVICE_UUID)
              }

              console.log(`Found relay hub device name: ${deviceName}`)
            }
          }
        } else {
          console.log("No hub details found in user data")
        }

        // Connect to the device, using the specific name and services if available
        console.log(`Connecting to device: ${deviceName || "any"} with services:`, serviceUUIDs)
        // await connectToDevice(deviceName, serviceUUIDs)
      } catch (error) {
        console.error("Failed to connect:", error)
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`${isFlashing && !isConnected ? "animate-pulse bg-yellow-500/20" : ""} rounded-full`}
      title={isConnected ? "Bluetooth Connected" : "Bluetooth Disconnected"}
    >
      <Bluetooth className={`h-5 w-5 ${isConnected ? "text-blue-500" : "text-yellow-500"}`} />
    </Button>
  )
}
