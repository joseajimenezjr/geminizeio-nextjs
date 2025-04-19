// Function to request a Bluetooth device
export async function requestDevice(deviceName?: string, serviceUUIDs?: string[]): Promise<BluetoothDevice> {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth API is not available in this browser.")
  }

  const options: RequestDeviceOptions = deviceName
    ? {
        filters: [{ name: deviceName }],
        optionalServices: serviceUUIDs,
      }
    : {
        acceptAllDevices: true,
        optionalServices: serviceUUIDs,
      }

  try {
    const device = await navigator.bluetooth.requestDevice(options)
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
      server = await device.gatt.connect()
      service = await server.getPrimaryService(serviceUUID)
      characteristic = await service.getCharacteristic(serviceUUID)
      break // If successful, break out of the loop
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
    device.gatt.disconnect()
  }
}
