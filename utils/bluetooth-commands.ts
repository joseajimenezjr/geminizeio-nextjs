"use client"

import { bluetoothService } from "@/services/bluetooth-service"

// This is a utility file to handle Bluetooth commands without using hooks directly

let bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
let bluetoothTemperatureCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

// Function to set the characteristic from the BluetoothContext
export function setBluetoothCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic | null) {
  console.log(`Setting bluetoothCharacteristic: ${characteristic ? characteristic.uuid : "null"}`)
  bluetoothCharacteristic = characteristic
}

// Function to set the temperature characteristic
export function setBluetoothTemperatureCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic | null) {
  bluetoothTemperatureCharacteristic = characteristic
  console.log(`BluetoothService: Temperature Characteristic ${characteristic ? "set" : "cleared"}`)
}

// Function to check if Bluetooth is connected
export function isBluetoothConnected(): boolean {
  return bluetoothCharacteristic !== null
}

// Function to send a command to the Bluetooth device
export async function sendBluetoothCommand(value: string | number, relayNumber = 1): Promise<boolean> {
  console.log(`sendBluetoothCommand called with value: ${value}, relay: ${relayNumber}`)

  try {
    let commandValue: number

    if (typeof value === "string") {
      // If value is a string, assume it's a hex code and parse it
      const parsedValue = Number.parseInt(value, 16)

      if (isNaN(parsedValue)) {
        console.error(`Invalid hex code: ${value}. Could not parse to a number.`)
        return false
      }

      if (parsedValue < 0 || parsedValue > 255) {
        console.error(`Hex code out of range: ${value}. Must be between 00 and FF.`)
        return false
      }

      commandValue = parsedValue
    } else {
      // If value is a number, use it directly
      commandValue = value
    }

    // First try using the bluetoothService
    if (bluetoothService.isConnected()) {
      console.log(`Using bluetoothService to send command: ${commandValue} to relay: ${relayNumber}`)

      // Create a simple command array with format: [relay_number, state_value]
      const commandArray = new Uint8Array([
        relayNumber, // Relay number (1-based)
        commandValue, // State (0 = on, 1 = off)
      ])

      await bluetoothCharacteristic.writeValue(commandArray)
      console.log(`Command sent successfully via local characteristic`)
      return true
    }

    // Fall back to the local characteristic if available
    if (bluetoothCharacteristic) {
      console.log(`Using local characteristic to send command: ${commandValue} to relay: ${relayNumber}`)

      // Create a simple command array with format: [relay_number, state_value]
      const commandArray = new Uint8Array([
        relayNumber, // Relay number (1-based)
        commandValue, // State (0 = on, 1 = off)
      ])

      console.log(`Sending command array to characteristic:
        - Relay: ${relayNumber}
        - Value: ${commandValue}
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
