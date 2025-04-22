"use client"

import { useState } from "react"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRCodeScanner } from "@/components/qr-scanner/qr-code-scanner"
import { BluetoothDeviceConnect } from "@/components/add-device/bluetooth-device-connect"

interface RelayHubSetupProps {
  onClose: () => void
  onBack?: () => void
  onComplete?: (deviceDetails: {
    deviceName: string
    deviceType: string
    serviceName: string
  }) => void
}

export function RelayHubSetup({ onClose, onBack, onComplete }: RelayHubSetupProps) {
  const [step, setStep] = useState("wiring-check")
  const [scannedUUID, setScannedUUID] = useState<string | null>(null)
  const deviceType = "relay_hub"

  const handleNotYet = () => {
    // Navigate to wiring instructions
    setStep("wiring-instructions")
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
      case "wiring-check":
        return "Before We Start"
      case "wiring-instructions":
        return "Wiring Instructions"
      case "scan-qr":
        return "Scan QR Code"
      case "bluetooth-connect":
        return "Connect to Device"
      case "setup-complete":
        return "Setup Complete"
      default:
        return "Relay Hub Setup"
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
        {step === "wiring-check" && (
          <div className="flex flex-col items-center justify-between h-full p-4">
            <div className="flex flex-col items-center text-center space-y-4 pt-8">
              <h3 className="text-xl font-medium">Have you already wired up your Relay Hub?</h3>

              {/* Illustration */}
              <div className="relative w-full h-64 my-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Simple line drawing of a relay hub */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full opacity-70"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1"
                  >
                    <rect x="60" y="40" width="80" height="120" rx="5" />
                    <rect x="70" y="60" width="60" height="80" rx="2" />
                    <circle cx="100" cy="50" r="3" />
                    <line x1="75" y1="150" x2="85" y2="150" />
                    <line x1="95" y1="150" x2="105" y2="150" />
                    <line x1="115" y1="150" x2="125" y2="150" />
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

        {step === "wiring-instructions" && (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">How to Wire Your Relay Hub</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 1: Safety First</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure all power is disconnected before beginning installation.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 2: Mount the Relay Hub</h4>
                <p className="text-sm text-muted-foreground">
                  Secure the relay hub to a clean, dry surface using the provided mounting hardware.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 3: Connect the Wires</h4>
                <p className="text-sm text-muted-foreground">
                  Connect each accessory to the corresponding relay terminal. Refer to the manual for detailed wiring
                  diagrams.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 4: Power Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Connect the power supply to the designated terminals, ensuring correct polarity.
                </p>
              </div>

              <Button className="w-full mt-6" onClick={() => setStep("wiring-check")}>
                I've Completed the Wiring
              </Button>
            </div>
          </div>
        )}

        {step === "scan-qr" && <QRCodeScanner onScan={handleQRCodeScanned} onClose={() => setStep("wiring-check")} />}

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
              Your Relay Hub has been successfully set up and connected.
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
