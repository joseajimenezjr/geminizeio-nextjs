"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, Smartphone, QrCode, Bluetooth, Plug, Star, AlertCircle, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { CustomDropdown } from "./custom-dropdown"

interface AccessorySetupProps {
  onClose: () => void
  onBack: () => void
  onComplete: (deviceDetails: {
    deviceName: string
    deviceType: string
    serviceName: string
    relayPosition?: number
    isFavorite?: boolean
  }) => void
  accessoryType?: string
  relayAccessoryType?: string | null
}

export function AccessorySetup({
  onClose,
  onBack,
  onComplete,
  accessoryType = "wireless_accessory",
  relayAccessoryType = null,
}: AccessorySetupProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const isRelayAccessory = accessoryType === "relay_accessory"
  const isTurnSignal = accessoryType === "turn_signal"
  const isReverseLight = accessoryType === "reverse_light"

  // For wireless accessories
  const [wirelessStep, setWirelessStep] = useState(1)

  // For turn signal accessories
  const [turnSignalStep, setTurnSignalStep] = useState(1)
  const [isTerminalsConfirmed, setIsTerminalsConfirmed] = useState(false)

  // Shared state
  const [deviceName, setDeviceName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Relay-specific state
  const [relayPosition, setRelayPosition] = useState<number | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  // Profile data state
  const [availablePositions, setAvailablePositions] = useState<number[]>([])
  const [accessoryLimit, setAccessoryLimit] = useState<number>(0)
  const [currentAccessories, setCurrentAccessories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setIsLoading(true)
        setError(null)

        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("No active session found")
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("accessories, accessoryLimit")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          throw new Error(profileError.message)
        }

        // Set accessory limit
        const limit = profileData.accessoryLimit || 4
        setAccessoryLimit(limit)

        // Set current accessories
        const accessories = profileData.accessories || []
        setCurrentAccessories(accessories)

        // Calculate available positions
        const usedPositions = accessories
          .filter((acc: any) => acc.relayPosition !== undefined)
          .map((acc: any) => acc.relayPosition)

        // Generate positions based on accessoryLimit
        const allPositions = Array.from({ length: limit }, (_, i) => i + 1)
        const available = allPositions.filter((pos) => !usedPositions.includes(pos))

        setAvailablePositions(available)

        // Set default relay position if available
        if (available.length > 0) {
          setRelayPosition(available[0])
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (isRelayAccessory || isTurnSignal || isReverseLight) {
      fetchProfileData()
    }
  }, [supabase, isRelayAccessory, isTurnSignal, isReverseLight])

  const handleNext = async () => {
    if (isTurnSignal) {
      if (turnSignalStep < 3) {
        setTurnSignalStep(turnSignalStep + 1)
        return
      }

      // Final step for turn signal - save to database
      setIsSubmitting(true)

      try {
        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("No active session found")
        }

        // Create new accessory object for turn signal
        const newAccessory = {
          id: `acc_${Date.now()}`,
          createdAt: new Date().toISOString(),
          isFavorite: isFavorite,
          accessoryID: `D${String(Math.floor(Math.random() * 900) + 100)}`, // Random 3-digit number with D prefix
          accessoryName: deviceName || "Turn Signal",
          accessoryType: "turn_signal",
          turnSignalStatus: false,
        }

        // Get current accessories
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("accessories")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          throw new Error(profileError.message)
        }

        // Update accessories array
        const updatedAccessories = [...(profileData.accessories || []), newAccessory]

        // Save to database
        const { error: updateError } = await supabase
          .from("Profiles")
          .update({ accessories: updatedAccessories })
          .eq("id", session.user.id)

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Success
        setIsSubmitting(false)
        setIsSuccess(true)

        // Complete the setup
        setTimeout(() => {
          // Refresh the dashboard to show the new accessory
          router.refresh()

          onComplete({
            deviceName: deviceName || "Turn Signal",
            deviceType: "turn_signal",
            serviceName: "turn_signal",
            isFavorite,
          })
        }, 1000)
      } catch (err: any) {
        console.error("Error saving turn signal:", err)
        setError(err.message)
        setIsSubmitting(false)
      }
    } else if (isRelayAccessory) {
      // No need to validate relay position as null is now allowed

      // Check if we're at the accessory limit
      if (currentAccessories.length >= accessoryLimit) {
        setError(`You've reached your accessory limit of ${accessoryLimit}`)
        return
      }

      setIsSubmitting(true)

      try {
        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("No active session found")
        }

        // Create new accessory object following the required structure
        const newAccessory = {
          id: `acc_${Date.now()}`,
          createdAt: new Date().toISOString(),
          isFavorite: isFavorite,
          accessoryID:
            relayPosition === null
              ? `D${Date.now().toString().slice(-3)}`
              : `D${String(relayPosition).padStart(3, "0")}`,
          accessoryName: deviceName,
          accessoryType: relayAccessoryType || "generic",
          relayPosition: relayPosition,
          accessoryConnectionStatus: false,
        }

        // Get current accessories
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("accessories")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          throw new Error(profileError.message)
        }

        // Update accessories array
        const updatedAccessories = [...(profileData.accessories || []), newAccessory]

        // Save to database
        const { error: updateError } = await supabase
          .from("Profiles")
          .update({ accessories: updatedAccessories })
          .eq("id", session.user.id)

        if (updateError) {
          throw new Error(updateError.message)
        }

        // Success
        setIsSubmitting(false)
        setIsSuccess(true)

        // Complete the setup with relay-specific details
        setTimeout(() => {
          // Refresh the dashboard to show the new accessory
          router.refresh()

          onComplete({
            deviceName,
            deviceType: "accessory",
            serviceName: getServiceName(),
            relayPosition: relayPosition,
            isFavorite,
          })
        }, 1000)
      } catch (err: any) {
        console.error("Error saving accessory:", err)
        setError(err.message)
        setIsSubmitting(false)
      }
    } else {
      // For wireless accessories, follow the original flow
      if (wirelessStep < 3) {
        setWirelessStep(wirelessStep + 1)
      } else {
        setIsSubmitting(true)

        try {
          // Get current user session
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (!session) {
            throw new Error("No active session found")
          }

          // Create new accessory object
          const newAccessory = {
            id: `acc_${Date.now()}`,
            createdAt: new Date().toISOString(),
            isFavorite: isFavorite,
            accessoryID: `W${Date.now().toString().slice(-3)}`,
            accessoryName: deviceName,
            accessoryType: "wireless",
            accessoryConnectionStatus: true,
          }

          // Get current accessories
          const { data: profileData, error: profileError } = await supabase
            .from("Profiles")
            .select("accessories")
            .eq("id", session.user.id)
            .single()

          if (profileError) {
            throw new Error(profileError.message)
          }

          // Update accessories array
          const updatedAccessories = [...(profileData.accessories || []), newAccessory]

          // Save to database
          const { error: updateError } = await supabase
            .from("Profiles")
            .update({ accessories: updatedAccessories })
            .eq("id", session.user.id)

          if (updateError) {
            throw new Error(updateError.message)
          }

          // Success
          setIsSubmitting(false)
          setIsSuccess(true)

          // Complete the setup
          setTimeout(() => {
            // Refresh the dashboard to show the new accessory
            router.refresh()

            onComplete({
              deviceName,
              deviceType: "accessory",
              serviceName: getServiceName(),
              isFavorite,
            })
          }, 1000)
        } catch (err: any) {
          console.error("Error saving accessory:", err)
          setError(err.message)
          setIsSubmitting(false)
        }
      }
    }
  }

  const getServiceName = () => {
    if (accessoryType === "relay_accessory" && relayAccessoryType) {
      return `relay_${relayAccessoryType}`
    }
    return "wireless_accessory"
  }

  const getStepTitle = () => {
    if (isRelayAccessory) {
      return "Configure Relay Accessory"
    }

    if (isTurnSignal) {
      switch (turnSignalStep) {
        case 1:
          return "Confirm Connections"
        case 2:
          return "Configure Turn Signal"
        case 3:
          return "Widget Information"
        default:
          return ""
      }
    }

    switch (wirelessStep) {
      case 1:
        return "Power On Your Accessory"
      case 2:
        return "Scan QR Code"
      case 3:
        return "Connect via Bluetooth"
      default:
        return ""
    }
  }

  const getStepDescription = () => {
    if (isRelayAccessory) {
      return "Configure your relay accessory by setting its name, position, and preferences."
    }

    if (isTurnSignal) {
      switch (turnSignalStep) {
        case 1:
          return "Please confirm that you have connected your turn signal kit correctly."
        case 2:
          return "Configure your turn signal settings."
        case 3:
          return "Learn about the widgets available for your turn signal kit."
        default:
          return ""
      }
    }

    switch (wirelessStep) {
      case 1:
        return "Make sure your accessory is powered on and in pairing mode. Refer to the manufacturer's instructions if needed."
      case 2:
        return "Scan the QR code on your accessory to identify it. This helps ensure you're connecting to the right device."
      case 3:
        return "Connect to your accessory via Bluetooth to complete the setup process."
      default:
        return ""
    }
  }

  const getStepIcon = () => {
    if (isRelayAccessory) {
      return <Plug className="h-8 w-8 text-primary" />
    }

    if (isTurnSignal) {
      switch (turnSignalStep) {
        case 1:
          return <AlertTriangle className="h-8 w-8 text-amber-500" />
        case 2:
          return <TurnRight className="h-8 w-8 text-amber-500" />
        case 3:
          return <Check className="h-8 w-8 text-green-500" />
        default:
          return null
      }
    }

    switch (wirelessStep) {
      case 1:
        return <Smartphone className="h-8 w-8" />
      case 2:
        return <QrCode className="h-8 w-8" />
      case 3:
        return <Bluetooth className="h-8 w-8" />
      default:
        return null
    }
  }

  const getAccessoryTypeLabel = () => {
    if (accessoryType === "turn_signal") {
      return "Turn Signal with Hazard Light Support"
    }

    if (accessoryType === "reverse_light") {
      return "Reverse Light"
    }

    if (accessoryType === "relay_accessory") {
      if (relayAccessoryType) {
        // Capitalize first letter and replace underscores with spaces
        return relayAccessoryType.charAt(0).toUpperCase() + relayAccessoryType.slice(1).replace(/_/g, " ")
      }
      return "Relay Accessory"
    }
    return "Wireless Accessory"
  }

  // Prepare position options for the dropdown
  const positionOptions = [
    { value: "null", label: "Set Later" },
    ...availablePositions.map((position) => ({
      value: position.toString(),
      label: `Position ${position}`,
    })),
  ]

  // Import the TurnRight icon for the turn signal
  const TurnRight = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8L22 12L18 16" />
      <path d="M2 12H22" />
    </svg>
  )

  return (
    <div className="space-y-3 p-1 max-w-xs mx-auto">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold flex-1">Add {getAccessoryTypeLabel()}</h2>
      </div>

      <div className="flex flex-col items-center py-2 space-y-1">
        {getStepIcon()}
        <h3 className="text-base font-medium">{getStepTitle()}</h3>
        <p className="text-center text-muted-foreground text-sm">{getStepDescription()}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Different form fields based on accessory type and step */}
      {isTurnSignal ? (
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {turnSignalStep === 1 && (
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-800">
                      Please confirm that you have connected your turn signal kit correctly:
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 text-sm">
                    <p>• Left turn signals connected to the LEFT terminal</p>
                    <p>• Right turn signals connected to the RIGHT terminal</p>
                    <p>• Power connected to the POWER terminal</p>
                    <p>• Ground connected to the GROUND terminal</p>
                  </div>

                  <div className="flex items-center space-x-2 py-1">
                    <Switch
                      id="terminals-confirmed"
                      checked={isTerminalsConfirmed}
                      onCheckedChange={setIsTerminalsConfirmed}
                    />
                    <Label htmlFor="terminals-confirmed" className="text-sm">
                      I confirm all connections are correct
                    </Label>
                  </div>
                </div>
              )}

              {turnSignalStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="deviceName" className="text-sm font-medium">
                      Turn Signal Name
                    </label>
                    <Input
                      id="deviceName"
                      placeholder="Turn Signal"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      className="h-9 w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-2 py-1">
                    <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
                    <Label htmlFor="favorite" className="flex items-center text-sm">
                      <Star className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                      Add to Favorites
                    </Label>
                  </div>
                </div>
              )}

              {turnSignalStep === 3 && (
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      By adding this turn signal kit, you'll now have access to:
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                        <TurnRight />
                      </div>
                      <div>
                        <p className="font-medium">Turn Signal Widget</p>
                        <p className="text-muted-foreground">Control your left and right turn signals</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <div className="bg-red-100 p-1.5 rounded-full mt-0.5">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">Hazard Light Widget</p>
                        <p className="text-muted-foreground">Toggle your hazard lights on and off</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    You can add these widgets to your Control Center by editing your dashboard layout.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : isRelayAccessory ? (
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label htmlFor="deviceName" className="text-sm font-medium">
                  Device Name
                </label>
                <Input
                  id="deviceName"
                  placeholder={`${getAccessoryTypeLabel()} Name`}
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="h-9 w-full"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="relayPosition" className="text-sm font-medium">
                  Relay Position
                </label>
                {availablePositions.length === 0 ? (
                  <Alert className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      No relay positions available. Please free up a position before adding a new accessory.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <CustomDropdown
                    id="relayPosition"
                    value={relayPosition?.toString() || ""}
                    onChange={(value) => setRelayPosition(value === "null" ? null : Number.parseInt(value))}
                    placeholder="Select position"
                    options={positionOptions}
                    className="h-9 w-full"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
                <Label htmlFor="favorite" className="flex items-center text-sm">
                  <Star className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                  Add to Favorites
                </Label>
              </div>

              <div className="text-xs text-muted-foreground">
                {currentAccessories.length} of {accessoryLimit} accessories used
              </div>
            </>
          )}
        </div>
      ) : (
        wirelessStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="wirelessDeviceName" className="text-sm font-medium">
                Device Name
              </label>
              <Input
                id="wirelessDeviceName"
                placeholder="Living Room Light"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="wirelessFavorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
              <Label htmlFor="wirelessFavorite" className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-amber-400" />
                Add to Favorites
              </Label>
            </div>
          </div>
        )
      )}

      <div className="flex justify-end space-x-2 pt-1">
        <Button variant="outline" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            (isTurnSignal && turnSignalStep === 1 && !isTerminalsConfirmed) ||
            (isTurnSignal && turnSignalStep === 2 && deviceName.trim() === "") ||
            (isRelayAccessory &&
              (deviceName.trim() === "" ||
                (availablePositions.length === 0 && !positionOptions.some((opt) => opt.value === "null")) ||
                isLoading)) ||
            (!isRelayAccessory && !isTurnSignal && wirelessStep === 3 && deviceName.trim() === "") ||
            isSubmitting
          }
          size="sm"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Saving...</span>
              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
            </>
          ) : isSuccess ? (
            <>
              <span className="mr-2">Accessory Added</span>
              <Check className="h-3 w-3" />
            </>
          ) : isTurnSignal && turnSignalStep === 3 ? (
            "Add Turn Signal"
          ) : isRelayAccessory ? (
            "Add Accessory"
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  )
}
