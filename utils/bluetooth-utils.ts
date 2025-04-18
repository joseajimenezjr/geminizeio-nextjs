"use client"

import { bluetoothService } from "@/services/bluetooth-service"

// Function to request a Bluetooth device
export async function requestDevice(deviceName?: string, serviceUUID?: string): Promise<BluetoothDevice> {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth API is not available in this browser.")
  }

  console.log(`Requesting Bluetooth device with name: ${deviceName || "any"}, serviceUUID: ${serviceUUID || "none"}`)

  // Prepare request options based on the desired format
  let options: RequestDeviceOptions

  if (deviceName) {
    // If we have a device name, use it as a filter and add serviceUUID to optionalServices
    options = {
      filters: [{ name: deviceName }],
    }

    // Add optionalServices if serviceUUID is provided
    if (serviceUUID) {
      options.optionalServices = [serviceUUID]
    }
  } else {
    // If no device name is provided, fall back to acceptAllDevices
    options = {
      acceptAllDevices: true,
    }

    // Still add optionalServices if serviceUUID is provided
    if (serviceUUID) {
      options.optionalServices = [serviceUUID]
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
  serviceUUID: string,
): Promise<{
  server: BluetoothRemoteGATTServer
  service: BluetoothRemoteGATTService
  characteristic: BluetoothRemoteGATTCharacteristic
}> {
  if (!device.gatt) {
    throw new Error("Device does not have GATT server")
  }

  try {
    console.log(`Connecting to GATT server for device: ${device.name || "unnamed"}`)
    const server = await device.gatt.connect()

    console.log(`Getting primary service with UUID: ${serviceUUID}`)
    const service = await server.getPrimaryService(serviceUUID)

    // Get all characteristics
    console.log("Getting characteristics for service")
    const characteristics = await service.getCharacteristics()
    console.log(
      `Found ${characteristics.length} characteristics:`,
      characteristics.map((c) => c.uuid),
    )

    // Use the first characteristic if available, otherwise try to get one with the same UUID as the service
    let characteristic
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

    return { server, service, characteristic }
  } catch (error) {
    console.error("Error connecting to device:", error)
    throw error
  }
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
