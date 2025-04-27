"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { TurnSignalSettings } from "./turn-signal-widget"

interface TurnSignalSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: TurnSignalSettings
  onSave: (settings: TurnSignalSettings) => void
}

export function TurnSignalSettingsDialog({ open, onOpenChange, settings, onSave }: TurnSignalSettingsDialogProps) {
  const [countdownEnabled, setCountdownEnabled] = useState(settings.countdownEnabled)
  const [countdownDuration, setCountdownDuration] = useState(settings.countdownDuration.toString())
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    // Validate input
    const duration = Number.parseInt(countdownDuration, 10)

    if (isNaN(duration)) {
      setError("Please enter a valid number")
      return
    }

    if (duration < 1) {
      setError("Duration must be at least 1 second")
      return
    }

    if (duration > 180) {
      setError("Duration cannot exceed 180 seconds (3 minutes)")
      return
    }

    // Save settings
    onSave({
      countdownEnabled,
      countdownDuration: duration,
    })

    // Close dialog
    onOpenChange(false)
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "")
    setCountdownDuration(value)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Turn Signal Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="countdown-enabled" className="flex flex-col gap-1">
              <span>Auto-cancel signals</span>
              <span className="font-normal text-sm text-muted-foreground">
                Automatically turn off signals after a set time
              </span>
            </Label>
            <Switch id="countdown-enabled" checked={countdownEnabled} onCheckedChange={setCountdownEnabled} />
          </div>

          {countdownEnabled && (
            <div className="grid gap-2">
              <Label htmlFor="countdown-duration">Auto-cancel duration (seconds)</Label>
              <Input
                id="countdown-duration"
                value={countdownDuration}
                onChange={handleDurationChange}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max="180"
                className="col-span-2"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-sm text-muted-foreground">Enter a value between 1 and 180 seconds (3 minutes)</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
