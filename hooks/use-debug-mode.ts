"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function useDebugMode(): boolean {
  const searchParams = useSearchParams()
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false)

  useEffect(() => {
    // Check for debug parameter in URL
    const debugParam = searchParams?.get("debug")

    // Also check localStorage in case we've saved the preference
    const storedDebugMode = typeof window !== "undefined" ? localStorage.getItem("geminize-debug-mode") : null

    if (debugParam === "true") {
      setIsDebugMode(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("geminize-debug-mode", "true")
      }
    } else if (debugParam === "false") {
      setIsDebugMode(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("geminize-debug-mode")
      }
    } else if (storedDebugMode === "true") {
      setIsDebugMode(true)
    }
  }, [searchParams])

  return isDebugMode
}
