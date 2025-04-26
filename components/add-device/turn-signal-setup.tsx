"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QRCodeScanner } from "@/components/qr-scanner/qr-code-scanner"
import { BluetoothDeviceConnect } from "@/components/add-device/bluetooth-device-connect"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ArrowLeft, Check, Lightbulb, AlertTriangle } from "lucide-react"

interface TurnSignalSetupProps {
  onClose: () => void
  onBack: () => void
  onComplete: (deviceId: string) => void
}

export function TurnSignalSetup({ onClose, onBack, onComplete }: TurnSignalSetupProps) {
  const [step, setStep] = useState<"wiring-check" | "instructions" | "qr-scan" | "bluetooth-connect">("wiring-check")
  const [qrData, setQrData] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleQRScanned = (data: string) => {
    console.log("QR code scanned:", data)
    setQrData(data)
    setStep("bluetooth-connect")
  }

  const handleDeviceConnected = (deviceId: string) => {
    console.log("Device connected:", deviceId)
    onComplete(deviceId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Turn Signal Kit Setup</h2>
      </div>

      {step === "wiring-check" && (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="font-medium">Wiring Check</p>
            </div>
            <p className="mt-2">
              Before proceeding, please ensure that your turn signal kit is properly wired to your vehicle's electrical
              system.
            </p>
          </div>

          <div className="flex flex-col items-center mb-6">
            <Lightbulb className="h-16 w-16 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Turn Signal Kit Installation</h3>
            <p className="text-center text-muted-foreground mb-4">
              Make sure your turn signal kit is properly installed according to the included instructions.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Connect the power wire to a fused 12V source</li>
              <li>Connect the ground wire to a suitable ground point</li>
              <li>Ensure left and right signal wires are connected correctly</li>
              <li>Verify that all connections are secure and insulated</li>
            </ul>
          </div>

          <Button onClick={() => setStep("instructions")} className="w-full">
            <Check className="mr-2 h-4 w-4" /> Wiring is Complete
          </Button>
        </div>
      )}

      {step === "instructions" && (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-4">Turn Signal Kit Setup Instructions</h3>
            <ol className="list-decimal pl-6 space-y-4 mb-6">
              <li>
                <p className="font-medium">Scan the QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code that came with your turn signal kit to identify your device.
                </p>
              </li>
              <li>
                <p className="font-medium">Connect via Bluetooth</p>
                <p className="text-sm text-muted-foreground">
                  Your phone will connect to the turn signal kit via Bluetooth to complete the setup.
                </p>
              </li>
              <li>
                <p className="font-medium">Test Functionality</p>
                <p className="text-sm text-muted-foreground">
                  Once connected, you'll be able to test your turn signals from the app.
                </p>
              </li>
            </ol>
            <Button onClick={() => setStep("qr-scan")} className="w-full">
              Continue to QR Scan
            </Button>
          </div>
        </div>
      )}

      {step === "qr-scan" && (
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">Scan QR Code</h3>
            <p className="text-sm text-muted-foreground">Scan the QR code that came with your turn signal kit</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <QRCodeScanner onScan={handleQRScanned} />
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setStep("bluetooth-connect")} className="w-full">
              Skip QR Scan
            </Button>
          </div>
        </div>
      )}

      {step === "bluetooth-connect" && (
        <div className="flex-1">
          <BluetoothDeviceConnect onDeviceConnected={handleDeviceConnected} deviceType="turn_signal" qrData={qrData} />
        </div>
      )}
    </div>
  )
}
