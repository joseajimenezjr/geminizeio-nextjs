"use client"

import { useEffect, useState } from "react"
import { useBluetooth } from "@/contexts/bluetooth-context"

export function AutoConnectHandler() {
  const { autoConnect, isConnected } = useBluetooth()
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false)

  useEffect(() => {
    // Only attempt to auto-connect once when the component mounts
    // and only if not already connected
    if (!hasAttemptedConnect && !isConnected) {
      const attemptConnection = async () => {
        await autoConnect()
        setHasAttemptedConnect(true)
      }

      attemptConnection()
    }
  }, [autoConnect, hasAttemptedConnect, isConnected])

  // This is a utility component that doesn't render anything
  return null
}
