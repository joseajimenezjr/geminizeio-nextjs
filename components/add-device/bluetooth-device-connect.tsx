"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bluetooth, RefreshCw } from "lucide-react"

interface BluetoothDeviceConnectProps {
  deviceType: string
  serviceUUID: string
  onDeviceConnected: (deviceName: string) => void
  onCancel: () => void
}

export function BluetoothDeviceConnect({
  deviceType,
  serviceUUID,
  onDeviceConnected,
  onCancel,
}: BluetoothDeviceConnectProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null)

  // Get the device name prefix based on device type
  const getDeviceNamePrefix = () => {
    switch (deviceType) {
      case "relay_hub":
        return "geminize_relay_hub_"
      case "hub":
        return "geminize_hub_"
      case "accessory":
        return "geminize_accessory_"
      case "turn_signal":
        return "geminize_turn_signal_kit_"
      default:
        return "geminize_"
    }
  }

  const scanForDevices = async () => {
    setError(null)
    setIsScanning(true)
    setStatusMessage("Requesting Bluetooth permission...")

    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not available in your browser")
      }

      setStatusMessage("Scanning for devices...")

      // Request device with name prefix filter
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: getDeviceNamePrefix() }],
        optionalServices: [serviceUUID],
      })

      setStatusMessage(`Found device: ${device.name}`)
      setConnectedDevice(device)

      // Connect to the device
      await connectToDevice(device)
    } catch (error: any) {
      console.error("Error scanning for devices:", error)
      setError(error.message || "Failed to scan for devices")
    } finally {
      setIsScanning(false)
    }
  }

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true)
    setStatusMessage(`Connecting to ${device.name}...`)

    try {
      // Connect to GATT server
      const server = await device.gatt?.connect()
      if (!server) {
        throw new Error("Failed to connect to GATT server")
      }

      setStatusMessage("Connected! Looking for service...")

      // Get the service with the UUID from the QR code
      const service = await server.getPrimaryService(serviceUUID)
      if (!service) {
        throw new Error("Service not found")
      }

      setStatusMessage("Service found! Setup complete.")

      // Call the onDeviceConnected callback with the device name
      onDeviceConnected(device.name || "Unknown Device")
    } catch (error: any) {
      console.error("Error connecting to device:", error)
      setError(error.message || "Failed to connect to device")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bluetooth
          className={`h-8 w-8 ${isScanning || isConnecting ? "animate-pulse text-primary" : "text-muted-foreground"}`}
        />
      </div>

      <h3 className="text-xl font-medium mb-2">Connect to Your Device</h3>

      <p className="text-muted-foreground text-center mb-6">
        {statusMessage || "We need to connect to your device via Bluetooth."}
      </p>

      {connectedDevice ? (
        <div className="text-center mb-6">
          <p className="font-medium">Device: {connectedDevice.name || "Unknown"}</p>
          <p className="text-sm text-muted-foreground">Service UUID: {serviceUUID.substring(0, 8)}...</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          We'll look for devices that start with "{getDeviceNamePrefix()}"
        </p>
      )}

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel} disabled={isScanning || isConnecting}>
          Back
        </Button>

        <Button onClick={scanForDevices} disabled={isScanning || isConnecting}>
          {isScanning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : isConnecting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Scan for Devices"
          )}
        </Button>
      </div>
    </div>
  )
}
