"use client"

import { useState } from "react"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRCodeScanner } from "@/components/qr-scanner/qr-code-scanner"
import { BluetoothDeviceConnect } from "@/components/add-device/bluetooth-device-connect"

interface TurnSignalSetupProps {
  onClose: () => void
  onBack?: () => void
  onComplete?: (deviceDetails: {
    deviceName: string
    deviceType: string
    serviceName: string
  }) => void
}

export function TurnSignalSetup({ onClose, onBack, onComplete }: TurnSignalSetupProps) {
  const [step, setStep] = useState("wiring-check")
  const [scannedUUID, setScannedUUID] = useState<string | null>(null)
  const deviceType = "turnSignal"

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
        return "Turn Signal Kit Setup"
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
              <h3 className="text-xl font-medium">Have you already wired up your Turn Signal Kit?</h3>

              {/* Illustration */}
              <div className="relative w-full h-64 my-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Simple line drawing of a turn signal kit */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full opacity-70"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="1"
                  >
                    <rect x="50" y="40" width="100" height="60" rx="5" />
                    <rect x="60" y="50" width="80" height="40" rx="2" />
                    <circle cx="70" cy="70" r="10" />
                    <circle cx="130" cy="70" r="10" />
                    <line x1="70" y1="110" x2="70" y2="140" />
                    <line x1="130" y1="110" x2="130" y2="140" />
                    <path d="M60,140 L80,140 L70,160 Z" />
                    <path d="M120,140 L140,140 L130,160 Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="w-full space-y-4 mb-8">
              <Button
                className="w-full py-6 text-base bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleNotYet}
              >
                NOT YET
              </Button>
              <Button
                variant="outline"
                className="w-full py-6 text-base border-primary text-primary hover:bg-primary/10"
                onClick={handleYes}
              >
                YES
              </Button>
            </div>
          </div>
        )}

        {step === "wiring-instructions" && (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">How to Wire Your Turn Signal Kit</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 1: Safety First</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure all power is disconnected before beginning installation.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 2: Mount the Control Module</h4>
                <p className="text-sm text-muted-foreground">
                  Secure the turn signal control module in a dry location away from extreme heat.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 3: Connect Signal Wires</h4>
                <p className="text-sm text-muted-foreground">
                  Connect the left and right signal input wires to your vehicle's turn signal wires. The yellow wire
                  connects to the left turn signal, and the green wire connects to the right turn signal.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 4: Connect Output Wires</h4>
                <p className="text-sm text-muted-foreground">
                  Connect the output wires to your auxiliary turn signals or light bars. Make sure to match left and
                  right sides correctly.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Step 5: Connect Power</h4>
                <p className="text-sm text-muted-foreground">
                  Connect the red wire to a fused 12V power source and the black wire to a good ground point.
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
              Your Turn Signal Kit has been successfully set up and connected.
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
