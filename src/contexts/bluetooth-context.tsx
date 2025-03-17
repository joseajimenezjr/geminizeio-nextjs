"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Platform, PermissionsAndroid, Alert } from "react-native"
import BleManager, { type Peripheral } from "react-native-ble-manager"
import { NativeEventEmitter, NativeModules } from "react-native"

// Service and characteristic UUIDs from your web app
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214"
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214"

type BluetoothContextType = {
  isConnected: boolean
  isConnecting: boolean
  connectedDevice: Peripheral | null
  scanForDevices: () => Promise<void>
  connectToDevice: (deviceId: string) => Promise<boolean>
  disconnectDevice: () => Promise<void>
  sendCommand: (value: number) => Promise<boolean>
  availableDevices: Peripheral[]
  isScanning: boolean
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined)

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedDevice, setConnectedDevice] = useState<Peripheral | null>(null)
  const [availableDevices, setAvailableDevices] = useState<Peripheral[]>([])
  const [isScanning, setIsScanning] = useState(false)

  // Initialize BLE Manager
  useEffect(() => {
    BleManager.start({ showAlert: false })

    // Initialize event listeners
    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager)

    // Listen for device discovery
    const discoveryListener = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", (device) => {
      // Filter for devices with our service UUID if possible
      setAvailableDevices((prevDevices) => {
        if (prevDevices.some((d) => d.id === device.id)) {
          return prevDevices
        }
        return [...prevDevices, device]
      })
    })

    // Listen for connection changes
    const connectListener = bleManagerEmitter.addListener("BleManagerConnectPeripheral", ({ peripheral }) => {
      console.log(`Connected to ${peripheral}`)
    })

    // Listen for disconnection
    const disconnectListener = bleManagerEmitter.addListener("BleManagerDisconnectPeripheral", ({ peripheral }) => {
      console.log(`Disconnected from ${peripheral}`)
      if (connectedDevice?.id === peripheral) {
        setIsConnected(false)
        setConnectedDevice(null)
      }
    })

    // Request permissions on Android
    if (Platform.OS === "android") {
      requestAndroidPermissions()
    }

    return () => {
      // Clean up listeners
      discoveryListener.remove()
      connectListener.remove()
      disconnectListener.remove()
      BleManager.stopScan()
    }
  }, [connectedDevice])

  // Request Android permissions
  const requestAndroidPermissions = async () => {
    if (Platform.OS === "android" && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Bluetooth Permission", "Location permission is required for Bluetooth scanning")
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  // Scan for devices
  const scanForDevices = async () => {
    try {
      setIsScanning(true)
      setAvailableDevices([])

      // Stop any ongoing scan
      await BleManager.stopScan()

      // Start scan
      await BleManager.scan([], 5, true)

      // Stop scanning after 5 seconds
      setTimeout(() => {
        BleManager.stopScan()
        setIsScanning(false)
      }, 5000)
    } catch (error) {
      console.error("Scan error:", error)
      setIsScanning(false)
    }
  }

  // Connect to device
  const connectToDevice = async (deviceId: string) => {
    try {
      setIsConnecting(true)

      // Connect to the device
      await BleManager.connect(deviceId)

      // Discover services and characteristics
      await BleManager.retrieveServices(deviceId)

      // Get the device details
      const device = availableDevices.find((d) => d.id === deviceId) || null

      setConnectedDevice(device)
      setIsConnected(true)
      setIsConnecting(false)

      return true
    } catch (error) {
      console.error("Connection error:", error)
      setIsConnecting(false)
      return false
    }
  }

  // Disconnect from device
  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await BleManager.disconnect(connectedDevice.id)
        setIsConnected(false)
        setConnectedDevice(null)
      } catch (error) {
        console.error("Disconnect error:", error)
      }
    }
  }

  // Send command to device
  const sendCommand = async (value: number): Promise<boolean> => {
    if (!connectedDevice || !isConnected) {
      Alert.alert("Not Connected", "Please connect to a device first")
      return false
    }

    // Valid values are relay position (1-4) + state (0/1)
    // 10, 11, 20, 21, 30, 31, 40, 41
    const validValues = [10, 11, 20, 21, 30, 31, 40, 41]

    if (!validValues.includes(value)) {
      console.error(`Invalid command value: ${value}`)
      return false
    }

    try {
      // Convert value to byte array
      const data = [value]

      // Write to characteristic
      await BleManager.write(connectedDevice.id, SERVICE_UUID, CHARACTERISTIC_UUID, data)

      console.log(`Command ${value} sent successfully`)
      return true
    } catch (error) {
      console.error("Error sending command:", error)
      return false
    }
  }

  const value = {
    isConnected,
    isConnecting,
    connectedDevice,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    sendCommand,
    availableDevices,
    isScanning,
  }

  return <BluetoothContext.Provider value={value}>{children}</BluetoothContext.Provider>
}

// Custom hook to use the Bluetooth context
export const useBluetooth = () => {
  const context = useContext(BluetoothContext)
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider")
  }
  return context
}

