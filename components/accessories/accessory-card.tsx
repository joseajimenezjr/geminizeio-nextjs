"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ChevronRight } from "lucide-react"
import { useDialog } from "@/components/providers/dialog-provider"
import type { Accessory } from "@/types"
import { cn } from "@/lib/utils"

interface AccessoryCardProps {
  accessory: Accessory
  isConnected: boolean
  isOn: boolean
  toggleAccessory: (id: string) => void
}

const AccessoryCard = ({ accessory, isConnected, isOn, toggleAccessory }: AccessoryCardProps) => {
  const { onOpen } = useDialog()
  const { toast } = useToast()

  // Function to handle toggling the accessory
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isConnected) {
      toggleAccessory(accessory.id)
    } else {
      toast({
        title: "Device not connected",
        description: "Please connect to the device first.",
        variant: "destructive",
      })
    }
  }

  // Function to open the details dialog
  const openDetailsDialog = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    onOpen({
      title: accessory.name,
      description: accessory.description,
      accessoryId: accessory.id,
    })
  }

  return (
    <Card className={cn("relative overflow-hidden", isConnected ? "" : "opacity-50")}>
      <div className="flex w-full">
        <div className="flex-grow" onClick={handleToggle}>
          <CardHeader>
            <CardTitle>{accessory.name}</CardTitle>
            <CardDescription>{accessory.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center">
            <Switch
              checked={isOn}
              disabled={!isConnected}
              onClick={(e) => {
                // This prevents the card's onClick from firing
                e.stopPropagation()
                handleToggle(e)
              }}
            />
          </CardContent>
        </div>
        <div className="flex items-center pr-4" onClick={openDetailsDialog}>
          <ChevronRight className="h-4 w-4 cursor-pointer" />
        </div>
      </div>
    </Card>
  )
}

export default AccessoryCard
