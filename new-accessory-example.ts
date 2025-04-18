interface Device {
  accessoryID: string
  accessoryName: string
  accessoryType: string
  accessoryConnectionStatus: boolean
  isFavorite: boolean
  location?: string
  relayPosition?: string
}

const newAccessory: Device = {
  accessoryID: `D${Date.now().toString().slice(-6)}`, // Generate a unique ID
  accessoryName: "New Accessory",
  accessoryType: "light", // Options: "light", "utility", "communication", "sensor", "power"
  accessoryConnectionStatus: false,
  isFavorite: false,
  // Optional properties
  location: "Relay 1", // Optional location description
  relayPosition: "1", // Optional relay position as a string
}
