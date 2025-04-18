"use client"

export type RelayState = "on" | "off"

export type RelayStates = {
  [relayNumber: number]: RelayState
}

export class BluetoothService {
  private server: BluetoothRemoteGATTServer | null = null
  private serviceUUID: string | null = null
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null
  private lastCommand: { relay: number; state: RelayState } | null = null

  constructor() {
    console.log("BluetoothService initialized")
  }

  setCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic | null) {
    this.characteristic = characteristic
    console.log(`BluetoothService: Characteristic ${characteristic ? "set" : "cleared"}`)
  }

  setServer(server: BluetoothRemoteGATTServer) {
    this.server = server
    console.log(`BluetoothService: Server set, connected: ${server.connected}`)
  }

  setServiceUUID(uuid: string) {
    this.serviceUUID = uuid
    console.log(`BluetoothService: Service UUID set to ${uuid}`)
  }

  isConnected(): boolean {
    const connected = !!this.server?.connected
    console.log(`BluetoothService.isConnected(): ${connected}`)
    return connected
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      serverConnected: this.server?.connected || false,
      serviceUUID: this.serviceUUID,
      hasCharacteristic: !!this.characteristic,
    }
  }

  getLastCommand() {
    return this.lastCommand
  }

  async setRelayState(relayNumber: number, state: RelayState): Promise<void> {
    console.log(`BluetoothService: Setting relay ${relayNumber} to ${state}`)

    if (!this.server || !this.server.connected) {
      console.error("BluetoothService: Not connected to a device")
      throw new Error("Not connected to a device")
    }

    if (!this.serviceUUID) {
      console.error("BluetoothService: Service UUID not set")
      throw new Error("Service UUID not set")
    }

    try {
      // Get the service
      console.log(`BluetoothService: Getting service with UUID ${this.serviceUUID}`)
      const service = await this.server.getPrimaryService(this.serviceUUID)

      // Get all characteristics to see what's available
      console.log(`BluetoothService: Getting characteristics for service`)
      const characteristics = await service.getCharacteristics()
      console.log(
        `BluetoothService: Found ${characteristics.length} characteristics:`,
        characteristics.map((c) => c.uuid),
      )

      // Use the first characteristic if available, otherwise try to get one with the same UUID as the service
      let characteristic
      if (characteristics.length > 0) {
        characteristic = characteristics[0]
        console.log(`BluetoothService: Using first characteristic: ${characteristic.uuid}`)
      } else {
        console.log(`BluetoothService: No characteristics found, trying to get one with UUID: ${this.serviceUUID}`)
        characteristic = await service.getCharacteristic(this.serviceUUID)
      }

      // Store the characteristic for future use
      this.characteristic = characteristic

      // Convert state to binary value (0 for ON, 1 for OFF)
      const stateValue = state === "on" ? 0 : 1

      // Create a simple command array with format: [relay_number, state_value]
      const commandArray = new Uint8Array([
        relayNumber, // Relay number (1-based)
        stateValue, // State (0 = on, 1 = off)
      ])

      console.log(`BluetoothService: Sending command array to characteristic:
        - Relay: ${relayNumber}
        - State: ${state} (${stateValue})
        - Binary data: [${Array.from(commandArray)}]
        - Characteristic UUID: ${characteristic.uuid}
      `)

      // Write the command array to the characteristic
      await characteristic.writeValue(commandArray)
      console.log(`BluetoothService: Successfully sent command array for relay ${relayNumber} to ${state}`)

      // Store the last command
      this.lastCommand = { relay: relayNumber, state }
    } catch (error) {
      console.error(`BluetoothService: Error setting relay ${relayNumber} to ${state}:`, error)
      throw error
    }
  }

  async getRelayCount(): Promise<number> {
    // Placeholder implementation
    return 4
  }

  async getRelayStates(): Promise<RelayStates> {
    // Placeholder implementation
    const states: RelayStates = {}
    for (let i = 1; i <= (await this.getRelayCount()); i++) {
      states[i] = "off"
    }
    return states
  }

  async toggleRelay(relayNumber: number): Promise<RelayState> {
    // Get current state
    const states = await this.getRelayStates()
    const currentState = states[relayNumber] || "off"
    const newState: RelayState = currentState === "on" ? "off" : "on"

    // Set the new state
    await this.setRelayState(relayNumber, newState)

    return newState
  }

  async setAllRelays(state: RelayState): Promise<void> {
    const relayCount = await this.getRelayCount()
    console.log(`Setting all ${relayCount} relays to ${state}`)

    for (let i = 1; i <= relayCount; i++) {
      await this.setRelayState(i, state)
    }
  }
}

export const bluetoothService = new BluetoothService()
