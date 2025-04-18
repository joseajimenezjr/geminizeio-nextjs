"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QRCodeScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)

  // Initialize scanner
  useEffect(() => {
    const qrCodeScanner = new Html5Qrcode("qr-reader")
    setHtml5QrCode(qrCodeScanner)

    return () => {
      if (qrCodeScanner.isScanning) {
        qrCodeScanner.stop().catch((error) => console.error("Error stopping scanner:", error))
      }
    }
  }, [])

  const startScanner = async () => {
    if (!html5QrCode) return

    setError(null)
    setScanning(true)

    try {
      // Request camera permission
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length > 0) {
        setPermissionGranted(true)

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        }

        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera
          config,
          onQRCodeSuccess,
          onQRCodeError,
        )
      } else {
        setError("No camera found on this device")
        setScanning(false)
      }
    } catch (err: any) {
      console.error("Error starting scanner:", err)
      setError(err.message || "Failed to access camera")
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop()
        setScanning(false)
      } catch (error) {
        console.error("Error stopping scanner:", error)
      }
    }
  }

  const onQRCodeSuccess = (decodedText: string) => {
    // Check if the decoded text is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (uuidRegex.test(decodedText)) {
      stopScanner()
      onScan(decodedText)
    } else {
      setError("Invalid QR code. Please scan a valid device QR code.")
    }
  }

  const onQRCodeError = (error: string) => {
    // We don't need to show every scanning error to the user
    console.log("QR scanning in progress:", error)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {error && (
        <Alert variant="destructive" className="mb-4 w-full max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        id="qr-reader"
        className={`w-full max-w-md aspect-square bg-muted/30 rounded-lg overflow-hidden ${scanning ? "border-2 border-primary" : "border border-dashed border-muted-foreground"}`}
      ></div>

      <div className="mt-6 text-center">
        {!scanning ? (
          <>
            <p className="text-muted-foreground mb-4">Scan the QR code on your device to get its unique identifier.</p>
            <Button onClick={startScanner} className="mx-auto">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">Position the QR code within the frame to scan.</p>
            <Button variant="outline" onClick={stopScanner}>
              Stop Scanning
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
