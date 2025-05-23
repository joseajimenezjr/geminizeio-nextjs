"use client"

import { useState, useEffect } from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { DeviceTypeSelector } from "@/components/add-device/device-type-selector"
import { AccessoryTypeSelector } from "@/components/add-device/accessory-type-selector"
import { RelayAccessoryTypeSelector } from "@/components/add-device/relay-accessory-type-selector"
import { RelayHubSetup } from "@/components/add-device/relay-hub-setup"
import { HubSetup } from "@/components/add-device/hub-setup"
import { AccessorySetup } from "@/components/add-device/accessory-setup"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { TurnSignalSetup } from "@/components/add-device/turn-signal-setup"

interface AddDeviceFlowProps {
  open: boolean
  onClose: () => void
  initialMode?: "hub-only" | "all" | "accessory-only" // Updated to include accessory-only mode
}

export function AddDeviceFlow({ open, onClose, initialMode = "all" }: AddDeviceFlowProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const [step, setStep] = useState<string>("select-type")
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null)
  const [selectedAccessoryType, setSelectedAccessoryType] = useState<string | null>(null)
  const [selectedRelayAccessoryType, setSelectedRelayAccessoryType] = useState<string | null>(null)
  const [isRelayHubAvailable, setIsRelayHubAvailable] = useState<boolean>(false)
  const [isTurnSignalKitAvailable, setIsTurnSignalKitAvailable] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasHubOrTurnSignal, setHasHubOrTurnSignal] = useState<boolean>(false)

  // Initialize the flow based on initialMode
  useEffect(() => {
    if (open) {
      if (initialMode === "accessory-only") {
        // Skip device type selection and go directly to accessory type selection
        setSelectedDeviceType("accessory")
        checkForHubs()
      } else {
        // For other modes, start with device type selection
        setStep("select-type")
        // Check if user has hub or turn signal when the flow opens
        checkUserDevices()
      }
    }
  }, [open, initialMode])

  // Reset all state when the flow is closed
  useEffect(() => {
    if (!open) {
      // Reset all state variables to their initial values
      setStep("select-type")
      setSelectedDeviceType(null)
      setSelectedAccessoryType(null)
      setSelectedRelayAccessoryType(null)
      setIsRelayHubAvailable(false)
      setIsTurnSignalKitAvailable(false)
      setIsLoading(false)
      setErrorMessage(null)
    }
  }, [open])

  // Check if user has hub or turn signal devices
  const checkUserDevices = async () => {
    setIsLoading(true)
    try {
      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add a device",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get current profile data
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("hubDetails")
        .eq("id", session.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Check if user has any hub, relay hub, or turn signal configured
      const hubDetails = profileData?.hubDetails || []
      const hasRequiredDevice = hubDetails.some(
        (device: any) =>
          device.deviceType === "hub" || device.deviceType === "relay_hub" || device.deviceType === "turnSignal",
      )

      // Check specifically for relay hub and turn signal kit
      const hasRelayHub = hubDetails.some((device: any) => device.deviceType === "relay_hub")
      const hasTurnSignalKit = hubDetails.some((device: any) => device.deviceType === "turnSignal")

      setHasHubOrTurnSignal(hasRequiredDevice)
      setIsRelayHubAvailable(hasRelayHub)
      setIsTurnSignalKitAvailable(hasTurnSignalKit)
    } catch (error: any) {
      console.error("Error checking for devices:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to check for existing devices",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check for hubs and proceed to accessory selection
  const checkForHubs = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add a device",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Get current profile data
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("hubDetails")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      // Check if user has any hub or relay hub configured
      const hubDetails = profileData?.hubDetails || []
      const hasHub = hubDetails.some(
        (device: any) =>
          device.deviceType === "hub" || device.deviceType === "relay_hub" || device.deviceType === "turnSignal",
      )

      // Check specifically for relay hub and turn signal kit
      const hasRelayHub = hubDetails.some((device: any) => device.deviceType === "relay_hub")
      const hasTurnSignalKit = hubDetails.some((device: any) => device.deviceType === "turnSignal")

      if (!hasHub) {
        setErrorMessage("You need to set up a Hub, Relay Hub, or Turn Signal Kit before adding accessories.")
        setStep("select-type") // Fall back to device selection if no hub is found
        setIsLoading(false)
        return
      }

      // Set whether a relay hub or turn signal kit is available
      setIsRelayHubAvailable(hasRelayHub)
      setIsTurnSignalKitAvailable(hasTurnSignalKit)

      // Move to accessory type selection
      setStep("select-accessory-type")
    } catch (error: any) {
      console.error("Error checking for hubs:", error)
      setErrorMessage(error.message || "Failed to check for existing hubs")
      setStep("select-type") // Fall back to device selection on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      // Add a class to the body to hide the bottom navigation
      document.body.classList.add("bottom-sheet-open")
      // Prevent scrolling
      document.body.style.overflow = "hidden"
    } else {
      // Remove the class when closed
      document.body.classList.remove("bottom-sheet-open")
      // Restore scrolling
      document.body.style.overflow = ""
    }

    return () => {
      // Cleanup
      document.body.classList.remove("bottom-sheet-open")
      document.body.style.overflow = ""
    }
  }, [open])

  // Update the handleDeviceTypeSelect function to check for existing hubs
  const handleDeviceTypeSelect = async (deviceType: string) => {
    setSelectedDeviceType(deviceType)

    // If accessory is selected, check if user has a hub configured
    if (deviceType === "accessory") {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to add a device",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Get current profile data
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("hubDetails")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        // Check if user has any hub or relay hub configured
        const hubDetails = profileData?.hubDetails || []
        const hasHub = hubDetails.some(
          (device: any) =>
            device.deviceType === "hub" || device.deviceType === "relay_hub" || device.deviceType === "turnSignal",
        )

        // Check specifically for relay hub and turn signal kit
        const hasRelayHub = hubDetails.some((device: any) => device.deviceType === "relay_hub")
        const hasTurnSignalKit = hubDetails.some((device: any) => device.deviceType === "turnSignal")

        if (!hasHub) {
          setErrorMessage("You need to set up a Hub, Relay Hub, or Turn Signal Kit before adding accessories.")
          setIsLoading(false)
          return
        }

        // Set whether a relay hub or turn signal kit is available
        setIsRelayHubAvailable(hasRelayHub)
        setIsTurnSignalKitAvailable(hasTurnSignalKit)

        // Move to accessory type selection
        setStep("select-accessory-type")
      } catch (error: any) {
        console.error("Error checking for hubs:", error)
        setErrorMessage(error.message || "Failed to check for existing hubs")
      } finally {
        setIsLoading(false)
      }
    } else {
      // For other device types, show the appropriate setup flow
      switch (deviceType) {
        case "relay-hub":
          setStep("relay-hub-setup")
          break
        case "hub":
          setStep("hub-setup")
          break
        case "turnSignal":
          setStep("turn-signal-setup")
          break
        default:
          // Fallback
          onClose()
          router.push("/accessories/new")
      }
    }
  }

  const handleAccessoryTypeSelect = (accessoryType: string) => {
    setSelectedAccessoryType(accessoryType)

    if (accessoryType === "relay_accessory") {
      // If relay accessory is selected, show the relay accessory type selector
      setStep("select-relay-accessory-type")
    } else {
      // Otherwise, proceed to the accessory setup
      setStep("accessory-setup")
    }
  }

  const handleRelayAccessoryTypeSelect = (relayAccessoryType: string) => {
    setSelectedRelayAccessoryType(relayAccessoryType)
    // Proceed to the accessory setup
    setStep("accessory-setup")
  }

  const handleBack = () => {
    // Handle back button based on current step
    switch (step) {
      case "select-accessory-type":
        if (initialMode === "accessory-only") {
          // If in accessory-only mode, close the flow instead of going back
          onClose()
        } else {
          setStep("select-type")
          setSelectedDeviceType(null)
        }
        break
      case "select-relay-accessory-type":
        setStep("select-accessory-type")
        setSelectedAccessoryType(null)
        break
      case "accessory-setup":
        if (selectedAccessoryType === "relay_accessory") {
          setStep("select-relay-accessory-type")
          setSelectedRelayAccessoryType(null)
        } else {
          setStep("select-accessory-type")
          setSelectedAccessoryType(null)
        }
        break
      default:
        if (initialMode === "accessory-only") {
          // If in accessory-only mode, close the flow
          onClose()
        } else {
          setStep("select-type")
          setSelectedDeviceType(null)
        }
    }
  }

  const handleDeviceSetupComplete = async (deviceDetails: {
    deviceName: string
    deviceType: string
    serviceName: string
  }) => {
    try {
      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add a device",
          variant: "destructive",
        })
        return
      }

      // Get current profile data
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("hubDetails")
        .eq("id", session.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Enhance device details with accessory type information if applicable
      const enhancedDeviceDetails = { ...deviceDetails }

      if (selectedDeviceType === "accessory") {
        enhancedDeviceDetails.accessoryType = selectedAccessoryType || "wireless_accessory"

        if (selectedAccessoryType === "relay_accessory" && selectedRelayAccessoryType) {
          enhancedDeviceDetails.relayAccessoryType = selectedRelayAccessoryType
        }
      }

      // Update the hubDetails array
      const hubDetails = profileData?.hubDetails || []
      const updatedHubDetails = [...hubDetails, enhancedDeviceDetails]

      // Update the profile with the new hubDetails array
      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ hubDetails: updatedHubDetails })
        .eq("id", session.user.id)

      if (updateError) {
        throw updateError
      }

      // Store information about the last added device if it's a hub, relay hub, or turn signal
      if (
        deviceDetails.deviceType === "hub" ||
        deviceDetails.deviceType === "relay_hub" ||
        deviceDetails.deviceType === "turnSignal"
      ) {
        // Store the last added device info in localStorage
        const lastAddedDevice = {
          type: deviceDetails.deviceType,
          name: deviceDetails.deviceName,
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem("lastAddedDevice", JSON.stringify(lastAddedDevice))
      } else if (deviceDetails.deviceType === "accessory") {
        // If an accessory was added, clear the last added device info
        localStorage.removeItem("lastAddedDevice")
      }

      toast({
        title: "Success",
        description: `${deviceDetails.deviceType.replace("_", " ")} added successfully`,
      })

      // Close the flow after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error("Error saving device details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save device details",
        variant: "destructive",
      })
    }
  }

  // Determine the appropriate size for the bottom sheet based on the current step
  const getSheetSize = () => {
    switch (step) {
      case "relay-hub-setup":
      case "hub-setup":
      case "accessory-setup":
        return "lg"
      default:
        return "default"
    }
  }

  // Determine whether to show the accessory option based on initialMode and user's devices
  const shouldShowAccessoryOption = initialMode === "all" && hasHubOrTurnSignal

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      size={getSheetSize()}
      className="bg-background border-t border-border"
      showCloseButton={step === "select-type" || (step === "select-accessory-type" && initialMode === "accessory-only")}
    >
      {step === "select-type" && (
        <DeviceTypeSelector
          onSelect={handleDeviceTypeSelect}
          isLoading={isLoading}
          errorMessage={errorMessage}
          showAccessoryOption={shouldShowAccessoryOption}
        />
      )}

      {step === "select-accessory-type" && (
        <AccessoryTypeSelector
          onSelect={handleAccessoryTypeSelect}
          isRelayHubAvailable={isRelayHubAvailable}
          isTurnSignalKitAvailable={isTurnSignalKitAvailable}
        />
      )}

      {step === "select-relay-accessory-type" && (
        <RelayAccessoryTypeSelector onSelect={handleRelayAccessoryTypeSelect} />
      )}

      {step === "relay-hub-setup" && (
        <RelayHubSetup onClose={onClose} onBack={handleBack} onComplete={handleDeviceSetupComplete} />
      )}

      {step === "hub-setup" && (
        <HubSetup onClose={onClose} onBack={handleBack} onComplete={handleDeviceSetupComplete} />
      )}

      {step === "accessory-setup" && (
        <AccessorySetup
          onClose={onClose}
          onBack={handleBack}
          onComplete={handleDeviceSetupComplete}
          accessoryType={selectedAccessoryType || "wireless_accessory"}
          relayAccessoryType={selectedRelayAccessoryType}
        />
      )}

      {step === "turn-signal-setup" && (
        <TurnSignalSetup onClose={onClose} onBack={handleBack} onComplete={handleDeviceSetupComplete} />
      )}
    </BottomSheet>
  )
}
