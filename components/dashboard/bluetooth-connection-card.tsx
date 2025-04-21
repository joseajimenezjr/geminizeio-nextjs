"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bluetooth, BluetoothOff, Check, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { useEffect, useState, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function BluetoothConnectionCard() {
  const { isConnected, isConnecting, bluetoothStatus, connectToDevice, disconnectDevice, sendCommand } = useBluetooth()
  const [hubDevice, setHubDevice] = useState<any>(null)
  const supabase = createClientComponentClient()
  const connectButtonRef = useRef<HTMLButtonElement>(null)

  // Add effect to fetch hub details
  useEffect(() => {
    const fetchHubDetails = async () => {
      try {
        // Get the user's session
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          console.log("No active session, skipping hub details fetch")
          return
        }

        // Get the user's profile data to check hubDetails
        const { data: profileData, error } = await supabase
          .from("Profiles")
          .select("hubDetails")
          .eq("id", sessionData.session.user.id)
          .single()

        if (error || !profileData?.hubDetails) {
          console.log("No hub details found")
          return
        }

        // Find a hub or relay_hub device in hubDetails
        const device = profileData.hubDetails.find(
          (device: any) => device.deviceType === "hub" || device.deviceType === "relay_hub",
        )

        if (device) {
          console.log(`Found ${device.deviceType} device: ${device.deviceName}`)
          setHubDevice(device)
        }
      } catch (error) {
        console.error("Error fetching hub details:", error)
      }
    }

    fetchHubDetails()
  }, [supabase])

  // Handle manual connect button click
  const handleConnectClick = () => {
    if (isConnected) {
      disconnectDevice()
    } else if (hubDevice?.deviceName && hubDevice?.serviceName) {
      connectToDevice(hubDevice.deviceName, hubDevice.serviceName)
    } else {
      // If no hub device is found, show an error
      console.error("No hub device found for connection")
      // You could show a toast here to inform the user
    }
  }

  // Render different content based on Bluetooth availability
  const renderContent = () => {
    if (!bluetoothStatus.available) {
      // Bluetooth is not available
      return (
        <>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">BLUETOOTH CONNECTION</p>
            <p className="text-lg font-bold flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <span>Not Available</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {bluetoothStatus.errorType === "permission"
                ? "Bluetooth access is blocked by browser permissions"
                : bluetoothStatus.errorType === "support"
                  ? "Web Bluetooth is not supported in this browser"
                  : bluetoothStatus.error || "Bluetooth is not available"}
            </p>
          </div>
          <div>
            {bluetoothStatus.errorType === "permission" && (
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link
                  href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn More
                </Link>
              </Button>
            )}
          </div>
        </>
      )
    }

    // Bluetooth is available
    return (
      <>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">BLUETOOTH CONNECTION</p>
          <p className="text-2xl font-bold flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="text-green-500">Connected</span>
                <Check className="h-5 w-5 text-green-500" />
              </>
            ) : (
              <span className={isConnecting ? "" : "text-yellow-500"}>Not Connected</span>
            )}
          </p>
          {hubDevice ? (
            <p className="text-sm text-muted-foreground mt-1">Device: {hubDevice.deviceName || "Unknown"}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">No hub device configured</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            ref={connectButtonRef}
            variant={isConnected ? "outline" : "default"}
            size="sm"
            onClick={handleConnectClick}
            disabled={isConnecting || (!isConnected && !hubDevice)}
            className={cn(
              "min-w-[130px]",
              isConnected ? "border-green-300" : "bg-yellow-500 hover:bg-yellow-600 text-black",
            )}
          >
            {isConnecting ? (
              <>
                <Bluetooth className="h-4 w-4 mr-2 animate-pulse" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <BluetoothOff className="h-4 w-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>
      </>
    )
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 bg-gradient-to-br border-none shadow-md overflow-hidden h-full",
        isConnected
          ? "from-green-500/10 to-green-600/5 border-green-500/20"
          : !bluetoothStatus.available
            ? "from-amber-50/30 to-amber-100/10 dark:from-amber-950/10 dark:to-amber-900/5"
            : isConnecting
              ? "from-background to-muted/30"
              : "from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 animate-pulse-very-slow",
      )}
    >
      <CardContent className="p-4 flex items-center justify-between h-full">{renderContent()}</CardContent>
    </Card>
  )
}

export default BluetoothConnectionCard
