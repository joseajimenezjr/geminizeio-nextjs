"use client"

import { useState } from "react"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRCodeScanner } from "@/components/qr-scanner/qr-code-scanner"
import { BluetoothDeviceConnect } from "@/components/add-device/bluetooth-device-connect"

interface HubSetupProps {
  onClose: () => void
  onBack?: () => void
  onComplete?: (deviceDetails: {
    deviceName: string
    deviceType: string
    serviceName: string
  }) => void
}

export function HubSetup({ onClose, onBack, onComplete }: HubSetupProps) {
  const [step, setStep] = useState("connection-check")
  const [scannedUUID, setScannedUUID] = useState<string | null>(null)
  const deviceType = "hub"

  const handleNotYet = () => {
    // Navigate to connection instructions
    setStep("connection-instructions")
  }

  const handleYes = () => {
    // Navigate to QR code scanning
    setStep("scan-qr")
  }

  const handleQRCodeScanned = (uuid: string) => {
    console.log("QR code scanned, UUID:", uuid)
    setScannedUUID(uuid)
    setStep("bluetooth-connect")
  }

  const handleDeviceConnected = (deviceName: string) => {
    if (onComplete && scannedUUID) {
      onComplete({
        deviceName,
        deviceType,
        serviceName: scannedUUID,
      })
    }
    setStep("setup-complete")
  }

  const getStepTitle = () => {
    switch (step) {
      case "connection-check":
        return "Before We Start"
      case "connection-instructions":
        return "Connection Instructions"
      case "scan-qr":
        return "Scan QR Code"
      case "bluetooth-connect":
        return "Connect to Device"
      case "setup-complete":
        return "Setup Complete"
      default:
        return "Hub Setup"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        {onBack && step !== "setup-complete" && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">{getStepTitle()}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {step === "connection-check" && (
          <div className="flex flex-col items-center justify-between h-full p-4">
            <div className="flex flex-col items-center text-center space-y-4 pt-8">
              <h3 className="text-xl font-medium">Have you already connected your Hub?</h3>

              {/* Illustration */}
              <div className="relative w-full h-64 my-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Simple line drawing of a hub */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full opacity-70"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1"
                  >
                    <rect x="60" y="40" width="80" height="120" rx="5" />
                    <circle cx="100" cy="80" r="25" />
                    <circle cx="100" cy="80" r="5" />
                    <line x1="100" y1="105" x2="100" y2="130" />
                    <line x1="85" y1="115" x2="115" y2="115" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4 mb-8 flex justify-center">
              <Button
                className="py-3 text-base bg-yellow-500 hover:bg-yellow-600 text-black w-40"
                onClick={handleNotYet}
              >
                NOT YET
              </Button>
              <Button
                variant="outline"
                className="py-3 text-base border-primary text-primary hover:bg-primary/10 w-40"
                onClick={handleYes}
              >
                YES
              </Button>
            </div>
          </div>
        )}

        {step === "connection-instructions" && (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">How to Connect Your Hub</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 1: Power On</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure your hub is powered on. You should see indicator lights on the device.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 2: Connect to Power</h4>
                <p className="text-sm text-muted-foreground">
                  Connect the hub to a power source using the provided power adapter.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 3: Position the Hub</h4>
                <p className="text-sm text-muted-foreground">
                  Place the hub in a central location for optimal connectivity with all your accessories.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 4: Check Connectivity</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure the hub's connectivity indicator is lit, showing it's ready to be paired.
                </p>
              </div>

              <Button className="w-full mt-6" onClick={() => setStep("connection-check")}>
                I've Connected the Hub
              </Button>
            </div>
          </div>
        )}

        {step === "scan-qr" && (
          <QRCodeScanner onScan={handleQRCodeScanned} onClose={() => setStep("connection-check")} />
        )}

        {step === "bluetooth-connect" && scannedUUID && (
          <BluetoothDeviceConnect
            deviceType={deviceType}
            serviceUUID={scannedUUID}
            onDeviceConnected={handleDeviceConnected}
            onCancel={() => setStep("scan-qr")}
          />
        )}

        {step === "setup-complete" && (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Setup Complete!</h3>
            <p className="text-muted-foreground text-center mb-6">
              Your Hub has been successfully set up and connected.
            </p>
            <Button onClick={onClose} className="min-w-[200px]">
              Finish
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
