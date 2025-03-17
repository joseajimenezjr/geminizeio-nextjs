"use client"

// Use the exact UUIDs from your working code
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

// Request a Bluetooth device
export async function requestDevice(): Promise<BluetoothDevice> {
  console.log("Requesting Bluetooth Device...")
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  })

  return device
}

// Connect to a Bluetooth device
export async function connectToDevice(device: BluetoothDevice): Promise<{
  server: BluetoothRemoteGATTServer
  service: BluetoothRemoteGATTService
  characteristic: BluetoothRemoteGATTCharacteristic
}> {
  console.log("Connecting to GATT Server...")
  const server = await device.gatt!.connect()

  console.log("Getting Service...")
  const service = await server.getPrimaryService(SERVICE_UUID)

  console.log("Getting Characteristics...")
  const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID)

  console.log("Connected! Ready to send commands.")
  return { server, service, characteristic }
}

// Disconnect from a Bluetooth device
export async function disconnectDevice(device: BluetoothDevice): Promise<void> {
  if (device.gatt?.connected) {
    device.gatt.disconnect()
    console.log("Device disconnected")
  }
}

// Start notifications from a characteristic
export async function startNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<void> {
  await characteristic.startNotifications()
  console.log("Notifications started")
}

// Stop notifications from a characteristic
export async function stopNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<void> {
  await characteristic.stopNotifications()
  console.log("Notifications stopped")
}

// Send a command to a characteristic
export async function sendCommand(characteristic: BluetoothRemoteGATTCharacteristic, value: number): Promise<void> {
  const validValues = [10, 11, 20, 21, 30, 31, 40, 41]

  if (!validValues.includes(value)) {
    console.error(`Invalid command value: ${value}.`)
    return
  }

  try {
    const data = Uint8Array.of(value)
    await characteristic.writeValue(data)
    console.log(`Command ${value} sent`)
  } catch (error) {
    console.error("Error sending command:", error)
    throw error
  }
}

