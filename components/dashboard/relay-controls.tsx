"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { bluetoothService, type RelayState, type RelayStates } from "@/services/bluetooth-service"
import { Loader2, Power, PowerOff } from "lucide-react"

interface RelayControlsProps {
  deviceType: "relay_hub" | "hub" | "accessory"
}

export function RelayControls({ deviceType }: RelayControlsProps) {
  const { isConnected, server } = useBluetooth()
  const [relayStates, setRelayStates] = useState<RelayStates>({})
  const [relayCount, setRelayCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  // Initialize the service and get relay states when connected
  useEffect(() => {
    if (isConnected && server) {
      const initializeService = async () => {
        try {
          setLoading(true)

          // Initialize the service with the user's configuration
          await bluetoothService.initializeWithUserConfig(server)

          // Get the number of relays
          const count = await bluetoothService.getRelayCount()
          setRelayCount(count)

          // Get the current relay states
          const states = await bluetoothService.getRelayStates()
          setRelayStates(states)
        } catch (error) {
          console.error("Error initializing relay controls:", error)
        } finally {
          setLoading(false)
        }
      }

      initializeService()
    }
  }, [isConnected, server])

  // Toggle a relay
  const toggleRelay = async (relayNumber: number) => {
    if (!isConnected) return

    try {
      setUpdating(relayNumber)
      const newState = await bluetoothService.toggleRelay(relayNumber)

      // Update the local state
      setRelayStates((prev) => ({
        ...prev,
        [relayNumber]: newState,
      }))
    } catch (error) {
      console.error(`Error toggling relay ${relayNumber}:`, error)
    } finally {
      setUpdating(null)
    }
  }

  // Set all relays to the same state
  const setAllRelays = async (state: RelayState) => {
    if (!isConnected || relayCount === 0) return

    try {
      setUpdating(-1) // -1 indicates "all relays"
      await bluetoothService.setAllRelays(state, relayCount)

      // Update the local state
      const newStates: RelayStates = {}
      for (let i = 1; i <= relayCount; i++) {
        newStates[i] = state
      }
      setRelayStates(newStates)
    } catch (error) {
      console.error(`Error setting all relays to ${state}:`, error)
    } finally {
      setUpdating(null)
    }
  }

  // If not connected, show a message
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relay Controls</CardTitle>
          <CardDescription>Connect to your device to control relays</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <p className="text-muted-foreground">No device connected</p>
        </CardContent>
      </Card>
    )
  }

  // If loading, show a loading indicator
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relay Controls</CardTitle>
          <CardDescription>Loading relay status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // If no relays, show a message
  if (relayCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relay Controls</CardTitle>
          <CardDescription>No relays found on this device</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <p className="text-muted-foreground">This device does not have any relays to control</p>
        </CardContent>
      </Card>
    )
  }

  // Render the relay controls
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relay Controls</CardTitle>
        <CardDescription>Control your device's relays</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: relayCount }, (_, i) => i + 1).map((relayNumber) => (
            <div key={relayNumber} className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  relayStates[relayNumber] === "on" ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {updating === relayNumber ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <Power
                    className={`h-6 w-6 ${relayStates[relayNumber] === "on" ? "text-green-600" : "text-gray-400"}`}
                  />
                )}
              </div>
              <Label htmlFor={`relay-${relayNumber}`} className="text-sm">
                Relay {relayNumber}
              </Label>
              <Switch
                id={`relay-${relayNumber}`}
                checked={relayStates[relayNumber] === "on"}
                onCheckedChange={() => toggleRelay(relayNumber)}
                disabled={updating !== null}
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setAllRelays("off")} disabled={updating !== null}>
          <PowerOff className="mr-2 h-4 w-4" />
          All Off
        </Button>
        <Button onClick={() => setAllRelays("on")} disabled={updating !== null}>
          <Power className="mr-2 h-4 w-4" />
          All On
        </Button>
      </CardFooter>
    </Card>
  )
}
