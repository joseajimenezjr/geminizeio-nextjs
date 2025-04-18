"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateVehicleInfo } from "@/app/actions/settings"

interface VehicleInfoFormProps {
  userData: any
}

export function VehicleInfoForm({ userData }: VehicleInfoFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the correct field names from the Profiles table
  const [vehicleName, setVehicleName] = useState(userData?.vehicle_name || "")
  const [vehicleType, setVehicleType] = useState(userData?.vehicle_type || "")
  const [vehicleYear, setVehicleYear] = useState(userData?.vehicle_year || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("vehicleName", vehicleName)
      formData.append("vehicleType", vehicleType)
      formData.append("vehicleYear", vehicleYear)

      const result = await updateVehicleInfo(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Vehicle information updated successfully",
        })
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

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 4 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setVehicleYear(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vehicleName">Vehicle Name</Label>
        <Input
          id="vehicleName"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          placeholder="Enter vehicle name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleType">Vehicle Type</Label>
        <Select value={vehicleType} onValueChange={setVehicleType}>
          <SelectTrigger id="vehicleType" className="w-full">
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom">
            <SelectItem value="SXS">SXS</SelectItem>
            <SelectItem value="UTV">UTV</SelectItem>
            <SelectItem value="ATV">ATV</SelectItem>
            <SelectItem value="Truck">Truck</SelectItem>
            <SelectItem value="Offroad">Offroad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleYear">Vehicle Year</Label>
        <Input
          id="vehicleYear"
          value={vehicleYear}
          onChange={handleYearChange}
          placeholder="Enter vehicle year (e.g., 2023)"
          maxLength={4}
        />
        <p className="text-xs text-muted-foreground">Enter a 4-digit year (e.g., 2023)</p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
