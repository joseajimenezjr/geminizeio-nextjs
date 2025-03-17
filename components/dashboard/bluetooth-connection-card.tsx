"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bluetooth, BluetoothOff, Check, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useBluetooth } from "@/contexts/bluetooth-context"

export function BluetoothConnectionCard() {
  const { isConnected, isConnecting, bluetoothStatus, connectToDevice, disconnectDevice, sendCommand } = useBluetooth()

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
                <span className="text-blue-500">Connected</span>
                <Check className="h-5 w-5 text-green-500" />
              </>
            ) : (
              <span>Not Connected</span>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant={isConnected ? "outline" : "default"}
            size="sm"
            onClick={isConnected ? disconnectDevice : connectToDevice}
            disabled={isConnecting}
            className={cn("min-w-[130px]", isConnected && "border-blue-300")}
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
          ? "from-blue-500/10 to-blue-600/5 border-blue-500/20"
          : !bluetoothStatus.available
            ? "from-amber-50/30 to-amber-100/10 dark:from-amber-950/10 dark:to-amber-900/5"
            : "from-background to-muted/30",
      )}
    >
      <CardContent className="p-4 flex items-center justify-between h-full">{renderContent()}</CardContent>
    </Card>
  )
}

export default BluetoothConnectionCard

