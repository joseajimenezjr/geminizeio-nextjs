"use client"

import type React from "react"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { updateUserSettings } from "@/app/actions/settings"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  userData: any
}

export function SettingsForm({ userData }: SettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [darkMode, setDarkMode] = useState(userData?.settings?.darkMode ?? false)
  const [notifications, setNotifications] = useState(userData?.settings?.notificationsEnabled ?? true)
  const [showFavorites, setShowFavorites] = useState(userData?.settings?.showFavorites ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("darkMode", darkMode.toString())
      formData.append("notificationsEnabled", notifications.toString())
      formData.append("showFavorites", showFavorites.toString())

      const result = await updateUserSettings(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
        </div>
        <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="favorites">Show Favorites Tab</Label>
          <p className="text-sm text-muted-foreground">Display the favorites tab on dashboard</p>
        </div>
        <Switch id="favorites" checked={showFavorites} onCheckedChange={setShowFavorites} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="notifications">Notifications</Label>
          <p className="text-sm text-muted-foreground">Receive notifications about your accessories</p>
        </div>
        <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}

