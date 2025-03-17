"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, Wrench, Radio, Thermometer, Zap } from "lucide-react"

const accessoryTypes = [
  { value: "light", label: "Light", icon: Lightbulb },
  { value: "utility", label: "Utility", icon: Wrench },
  { value: "communication", label: "Communication", icon: Radio },
  { value: "sensor", label: "Sensor", icon: Thermometer },
  { value: "power", label: "Power", icon: Zap },
]

const relayLocations = Array.from({ length: 8 }, (_, i) => ({
  value: `relay-${i + 1}`,
  label: `Relay ${i + 1}`,
}))

export function NewAccessoryForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [location, setLocation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("accessoryName", name)
      formData.append("accessoryType", type)
      formData.append("location", location)

      const result = await fetch("/api/accessories", {
        method: "POST",
        body: formData,
      })

      const data = await result.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to accessories page
      router.push("/accessories")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while adding the accessory")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Accessory Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Accessory Name</Label>
            <Input
              id="name"
              placeholder="e.g., Light Bar, Winch, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Accessory Type</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select accessory type" />
              </SelectTrigger>
              <SelectContent>
                {accessoryTypes.map((accessoryType) => (
                  <SelectItem key={accessoryType.value} value={accessoryType.value}>
                    <div className="flex items-center">
                      <accessoryType.icon className="mr-2 h-4 w-4" />
                      {accessoryType.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Relay Location</Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select relay location" />
              </SelectTrigger>
              <SelectContent>
                {relayLocations.map((relayLocation) => (
                  <SelectItem key={relayLocation.value} value={relayLocation.value}>
                    {relayLocation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Accessory"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

