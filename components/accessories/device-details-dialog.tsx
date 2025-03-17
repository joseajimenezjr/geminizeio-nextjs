"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Wrench, Radio, Thermometer, Zap, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { useAccessories } from "@/contexts/device-context"
import { useDebugMode } from "@/hooks/use-debug-mode"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DeviceDetailsDialogProps {
  device: any
  open: boolean
  onOpenChange: (open: boolean) => void
  accessoryLimit?: number
}

export function DeviceDetailsDialog({ device, open, onOpenChange, accessoryLimit = 4 }: DeviceDetailsDialogProps) {
  const {
    accessories,
    toggleAccessoryStatus,
    toggleAccessoryFavorite,
    updateAccessoryNameInContext,
    isLoading,
    refreshAccessories,
  } = useAccessories()
  const [accessoryName, setAccessoryName] = useState("")
  const [relayPosition, setRelayPosition] = useState<string>("")
  const [active, setActive] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const { toast } = useToast()
  const isDebugMode = useDebugMode()

  // Find the current accessory in the context to ensure we have the latest state
  const currentAccessory = accessories.find((a) => a.accessoryID === device?.accessoryID)

  // Find which relay positions are already taken
  const takenPositions = accessories
    .filter((acc) => acc.accessoryID !== device?.accessoryID && acc.relayPosition)
    .map((acc) => acc.relayPosition)

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isTogglingStatus = isLoading[`status-${device?.accessoryID}`] || false
  const isTogglingFavorite = isLoading[`favorite-${device?.accessoryID}`] || false

  // Update state when device changes or dialog opens
  useEffect(() => {
    if (currentAccessory && open) {
      setAccessoryName(currentAccessory.accessoryName || "")
      setRelayPosition(currentAccessory.relayPosition || "")
      setActive(currentAccessory.accessoryConnectionStatus || false)
      setFavorite(currentAccessory.isFavorite || false)
    } else if (device && open) {
      setAccessoryName(device.accessoryName || "")
      setRelayPosition(device.relayPosition || "")
      setActive(device.accessoryConnectionStatus || false)
      setFavorite(device.isFavorite || false)
    }
  }, [currentAccessory, device, open])

  // Get the appropriate icon for the accessory type
  const getAccessoryIcon = () => {
    if (!currentAccessory && !device) return Lightbulb

    const accessoryType = (currentAccessory?.accessoryType || device?.accessoryType || "").toLowerCase()
    if (accessoryType.includes("light")) return Lightbulb
    if (accessoryType.includes("utility")) return Wrench
    if (accessoryType.includes("communication")) return Radio
    if (accessoryType.includes("sensor")) return Thermometer
    if (accessoryType.includes("power")) return Zap
    return Lightbulb // Default
  }

  const AccessoryIcon = getAccessoryIcon()

  // Use the current accessory from context if available, otherwise use the prop
  const displayAccessory = currentAccessory || device

  // Generate relay position options
  const generateRelayOptions = () => {
    const options = []

    // Add "No Location Set" option
    options.push({ value: "", label: "No Location Set" })

    // Add numbered positions that aren't already taken
    for (let i = 1; i <= accessoryLimit; i++) {
      const positionValue = `relay-${i}`
      if (!takenPositions.includes(positionValue) || positionValue === relayPosition) {
        options.push({ value: positionValue, label: `Relay ${i}` })
      }
    }

    return options
  }

  const relayOptions = generateRelayOptions()

  // Update the handleSubmit function to properly save and update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayAccessory) return

    setIsSubmitting(true)

    // Get the correct ID property
    const accessoryID = displayAccessory.accessoryID

    // Log for debugging
    console.log(`Attempting to update accessory ${accessoryID} with:`, {
      name: accessoryName,
      relayPosition,
      active,
      favorite,
    })

    if (!accessoryID) {
      console.error("Cannot update accessory: No valid ID found in accessory object", displayAccessory)
      toast({
        title: "Error",
        description: "Failed to identify accessory ID",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Update name
      const nameSuccess = await updateAccessoryNameInContext(accessoryID, accessoryName, relayPosition)

      // Update status if changed
      if (active !== displayAccessory.accessoryConnectionStatus) {
        await toggleAccessoryStatus(accessoryID, active)
      }

      // Update favorite if changed
      if (favorite !== displayAccessory.isFavorite) {
        await toggleAccessoryFavorite(accessoryID, favorite)
      }

      if (nameSuccess) {
        toast({
          title: "Success",
          description: "Accessory updated successfully",
        })

        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to update accessory",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!displayAccessory) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn("p-2 rounded-md", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}
            >
              <AccessoryIcon className="h-5 w-5" />
            </div>
            <span>Accessory Details</span>
            <Badge variant={active ? "default" : "outline"} className="ml-2">
              {active ? "On" : "Off"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accessoryName" className="text-right">
                Name
              </Label>
              <Input
                id="accessoryName"
                value={accessoryName}
                onChange={(e) => setAccessoryName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <div className="col-span-3">{displayAccessory.accessoryType || "Unknown"}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="relayPosition" className="text-right">
                Relay Position
              </Label>
              <Select value={relayPosition} onValueChange={setRelayPosition}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a relay position" />
                </SelectTrigger>
                <SelectContent>
                  {relayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="status"
                  checked={active}
                  onCheckedChange={setActive}
                  disabled={isTogglingStatus}
                  className="mr-2"
                />
                <span className="text-sm">{active ? "On" : "Off"}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Favorite</Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="favorite"
                  checked={favorite}
                  onCheckedChange={setFavorite}
                  disabled={isTogglingFavorite}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <span className="text-sm">{favorite ? "This accessory is a favorite" : "Add to favorites"}</span>
                  {favorite && <Star className="h-4 w-4 text-yellow-400 ml-2" />}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>

            {/* Debug toggle button - only show in debug mode */}
            {isDebugMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => toggleAccessoryStatus(displayAccessory.accessoryID, !active)}
                disabled={isSubmitting}
                className="ml-2 bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
              >
                Debug Toggle
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

