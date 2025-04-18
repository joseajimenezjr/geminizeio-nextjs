"use client"

import { bluetoothService } from "@/services/bluetooth-service"

// This is a utility file to handle Bluetooth commands without using hooks directly

let bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

// Function to set the characteristic from the BluetoothContext
export function setBluetoothCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic | null) {
  console.log(`Setting bluetoothCharacteristic: ${characteristic ? characteristic.uuid : "null"}`)
  bluetoothCharacteristic = characteristic
}

// Function to check if Bluetooth is connected
export function isBluetoothConnected(): boolean {
  // First check the local characteristic
  if (bluetoothCharacteristic !== null) {
    return true
  }

  // Then check the service
  return bluetoothService.isConnected()
}

// Function to send a command to the Bluetooth device
export async function sendBluetoothCommand(value: number, relayNumber = 1): Promise<boolean> {
  console.log(`sendBluetoothCommand called with value: ${value}, relay: ${relayNumber}`)

  // Ensure value is a number
  value = Number(value)

  // Handle NaN case
  if (isNaN(value)) {
    console.error(`Invalid command value: NaN. Only 0 (ON) and 1 (OFF) are supported.`)
    return false
  }

  try {
    // First try using the bluetoothService
    if (bluetoothService.isConnected()) {
      console.log(
        `Using bluetoothService to send command: ${value} (${value === 0 ? "ON" : "OFF"}) to relay: ${relayNumber}`,
      )

      // Convert numeric value to string state
      const state = value === 1 ? "on" : "off" // Corrected: 1 for ON, 0 for OFF
      console.log(`Converting value ${value} to state "${state}" for bluetoothService`)

      await bluetoothService.setRelayState(relayNumber, state)
      console.log(`Command sent successfully via bluetoothService`)
      return true
    }

    // Fall back to the local characteristic if available
    if (bluetoothCharacteristic) {
      console.log(
        `Using local characteristic to send command: ${value} (${value === 0 ? "ON" : "OFF"}) to relay: ${relayNumber}`,
      )

      // Create a simple command array with format: [relay_number, state_value]
      const commandArray = new Uint8Array([
        relayNumber, // Relay number (1-based)
        value, // State (0 = on, 1 = off)
      ])

      console.log(`Sending command array to characteristic:
        - Relay: ${relayNumber}
        - Value: ${value} (${value === 0 ? "ON" : "OFF"})
        - Binary data: [${Array.from(commandArray)}]
        - Characteristic UUID: ${bluetoothCharacteristic.uuid}
      `)

      await bluetoothCharacteristic.writeValue(commandArray)
      console.log(`Command sent successfully via local characteristic`)
      return true
    }

    console.error("Not connected to a Bluetooth device.")
    return false
  } catch (error) {
    console.error("Error sending Bluetooth command:", error)
    return false
  }
}
