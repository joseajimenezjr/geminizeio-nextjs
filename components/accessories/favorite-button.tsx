"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  id: string
  isFavorite: boolean
}

export function FavoriteButton({ id, isFavorite: initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggleFavorite = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/accessories/${id}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      })

      if (!response.ok) {
        throw new Error("Failed to update favorite status")
      }

      setIsFavorite(!isFavorite)
      router.refresh()
    } catch (error) {
      console.error("Error updating favorite status:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      disabled={loading}
      className={cn("h-8 w-8", isFavorite && "text-yellow-500 hover:text-yellow-600")}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={cn("h-4 w-4", isFavorite ? "fill-current" : "fill-none")} />
      <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}
