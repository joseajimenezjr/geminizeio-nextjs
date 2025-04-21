// Utility functions for Bluetooth commands

// Check if Bluetooth is connected
export function isBluetoothConnected(): boolean {
  // This is a client-side function, so we need to check if window exists
  if (typeof window === "undefined") {
    return false
  }

  // Check if there's a stored connection state in localStorage
  // This is just a simple way to persist connection state between page refreshes
  // In a real app, you would use the actual Bluetooth connection state
  const storedState = localStorage.getItem("bluetoothConnected")
  return storedState === "true"
}

// Send a command to the Bluetooth device
export async function sendBluetoothCommand(command: number, relayPosition = 1): Promise<boolean> {
  // This is a client-side function, so we need to check if window exists
  if (typeof window === "undefined") {
    console.log("Cannot send Bluetooth command on server side")
    return false
  }

  try {
    // In a real implementation, this would use the actual Bluetooth API
    // For now, we'll just log the command and return success
    console.log(`Sending Bluetooth command: ${command} to relay ${relayPosition}`)

    // Simulate a successful command
    // In a real app, you would use the Web Bluetooth API
    localStorage.setItem("lastCommand", JSON.stringify({ command, relayPosition }))

    // Simulate a delay for the command
    await new Promise((resolve) => setTimeout(resolve, 300))

    return true
  } catch (error) {
    console.error("Error sending Bluetooth command:", error)
    return false
  }
}
