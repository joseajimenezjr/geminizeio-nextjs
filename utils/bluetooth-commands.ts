"use client"

// This is a utility file to handle Bluetooth commands without using hooks directly

let bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

// Function to set the characteristic from the BluetoothContext
export function setBluetoothCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic | null) {
  bluetoothCharacteristic = characteristic
}

// Function to check if Bluetooth is connected
export function isBluetoothConnected(): boolean {
  return bluetoothCharacteristic !== null
}

// Function to send a command to the Bluetooth device
export async function sendBluetoothCommand(value: number): Promise<boolean> {
  if (!bluetoothCharacteristic) {
    console.error("Not connected to a Bluetooth device.")
    return false
  }

  // Valid values are relay position (1-4) + state (0/1)
  // 10, 11, 20, 21, 30, 31, 40, 41
  const validValues = [10, 11, 20, 21, 30, 31, 40, 41]

  if (!validValues.includes(value)) {
    console.error(`Invalid command value: ${value}.`)
    return false
  }

  try {
    const data = Uint8Array.of(value)
    await bluetoothCharacteristic.writeValue(data)
    console.log(`Bluetooth command ${value} sent`)
    return true
  } catch (error) {
    console.error("Error sending Bluetooth command:", error)
    return false
  }
}

