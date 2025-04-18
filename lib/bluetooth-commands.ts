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

  try {
    // Convert the numeric value to ASCII string and then to UTF-8 encoded bytes
    const encoder = new TextEncoder()
    const data = encoder.encode(value.toString())

    console.log(`Bluetooth write operation:
      - Command value: ${value}
      - ASCII string: "${value.toString()}"
      - State: ${value === 0 ? "OFF" : value === 1 ? "ON" : value === 2 ? "SHUFFLE" : "CUSTOM"}
      - Encoded bytes: [${Array.from(data)}]
      - Characteristic UUID: ${bluetoothCharacteristic.uuid}
    `)

    await bluetoothCharacteristic.writeValue(data)
    console.log(`✅ Bluetooth command "${value.toString()}" sent successfully`)
    return true
  } catch (error) {
    console.error("Error sending Bluetooth command:", error)
    return false
  }
}

// Function to send chase light shuffle command (value 2)
export async function sendChaseLightShuffleCommand(): Promise<boolean> {
  return await sendBluetoothCommand(2)
}
