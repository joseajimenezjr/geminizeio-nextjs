"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Power } from "lucide-react"
import { useRouter } from "next/navigation"

interface ToggleButtonProps {
  id: string
  active: boolean
}

export function ToggleButton({ id, active: initialActive }: ToggleButtonProps) {
  const [active, setActive] = useState(initialActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    try {
      const newState = !active
      const response = await fetch(`/api/accessories/${id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: newState }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle accessory")
      }

      setActive(newState)
      router.refresh()
    } catch (error) {
      console.error("Error toggling accessory:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className="flex-1"
      onClick={handleToggle}
      disabled={loading}
    >
      <Power className="mr-2 h-4 w-4" />
      {active ? "Turn Off" : "Turn On"}
    </Button>
  )
}

