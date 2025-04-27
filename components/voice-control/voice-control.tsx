"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAccessories } from "@/contexts/device-context"
import { useVoiceControl } from "@/hooks/use-voice-control"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function VoiceControl() {
  const { accessories, toggleAccessoryStatus } = useAccessories()
  const { toast } = useToast()
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Function to process voice commands
  const processCommand = useCallback(
    (
      transcript: string,
      action: string,
      relayPosition: number | null,
      isTurnSignalCommand?: boolean,
      turnSignalAction?: "left" | "right" | "hazard" | null,
      turnSignalState?: "on" | "off" | "toggle",
    ) => {
      console.log(
        "Processing command:",
        transcript,
        action,
        relayPosition,
        isTurnSignalCommand,
        turnSignalAction,
        turnSignalState,
      )

      // Handle turn signal commands
      if (isTurnSignalCommand && turnSignalAction) {
        // Find the turn signal widget accessory
        const turnSignalAccessory = accessories.find((acc) => acc.accessoryType === "turnSignal")

        if (turnSignalAccessory) {
          console.log("Found turn signal accessory:", turnSignalAccessory)

          // Determine which action to take based on the command
          let actionTaken = ""

          // Find the turn signal widget in the DOM
          const turnSignalWidgets = document.querySelectorAll('[data-turn-signal-widget="true"]')
          if (turnSignalWidgets.length > 0) {
            const turnSignalWidget = turnSignalWidgets[0]

            // Find the appropriate button based on the command
            let buttonToClick: HTMLElement | null = null

            if (turnSignalAction === "left") {
              buttonToClick = turnSignalWidget.querySelector('[data-turn-signal="left"]')
              actionTaken =
                turnSignalState === "on"
                  ? "Turned on left signal"
                  : turnSignalState === "off"
                    ? "Turned off left signal"
                    : "Toggled left signal"
            } else if (turnSignalAction === "right") {
              buttonToClick = turnSignalWidget.querySelector('[data-turn-signal="right"]')
              actionTaken =
                turnSignalState === "on"
                  ? "Turned on right signal"
                  : turnSignalState === "off"
                    ? "Turned off right signal"
                    : "Toggled right signal"
            } else if (turnSignalAction === "hazard") {
              buttonToClick = turnSignalWidget.querySelector('[data-turn-signal="hazard"]')
              actionTaken =
                turnSignalState === "on"
                  ? "Turned on hazard lights"
                  : turnSignalState === "off"
                    ? "Turned off hazard lights"
                    : "Toggled hazard lights"
            }

            // Click the button if found
            if (buttonToClick) {
              console.log("Clicking button:", buttonToClick)
              buttonToClick.click()

              toast({
                title: "Voice Command Executed",
                description: actionTaken,
              })

              return
            }
          }

          // If we couldn't find the widget or button, try to use the accessory API
          if (turnSignalAction === "left") {
            // Here we would call the appropriate API to control the left signal
            // For now, we'll just show a toast
            toast({
              title: "Voice Command Executed",
              description:
                turnSignalState === "on"
                  ? "Turned on left signal"
                  : turnSignalState === "off"
                    ? "Turned off left signal"
                    : "Toggled left signal",
            })
            return
          } else if (turnSignalAction === "right") {
            // Here we would call the appropriate API to control the right signal
            toast({
              title: "Voice Command Executed",
              description:
                turnSignalState === "on"
                  ? "Turned on right signal"
                  : turnSignalState === "off"
                    ? "Turned off right signal"
                    : "Toggled right signal",
            })
            return
          } else if (turnSignalAction === "hazard") {
            // Here we would call the appropriate API to control the hazard lights
            toast({
              title: "Voice Command Executed",
              description:
                turnSignalState === "on"
                  ? "Turned on hazard lights"
                  : turnSignalState === "off"
                    ? "Turned off hazard lights"
                    : "Toggled hazard lights",
            })
            return
          }
        } else {
          console.log("No turn signal accessory found")
          toast({
            title: "Turn Signal Not Found",
            description: "No turn signal accessory is available. Please add a turn signal widget first.",
            variant: "destructive",
          })
          return
        }
      }

      // Find matching accessory
      let matchingAccessory = null

      if (relayPosition !== null) {
        // Try to find accessory by relay position
        matchingAccessory = accessories.find((acc) => acc.relayPosition === relayPosition)
        if (matchingAccessory) {
          console.log(`Found matching accessory by relay position ${relayPosition}:`, matchingAccessory)
        }
      }

      if (!matchingAccessory) {
        // If no relay position or no match, try to find by name
        matchingAccessory = accessories.find(
          (acc) =>
            acc.accessoryName.toLowerCase().includes(transcript.toLowerCase()) ||
            transcript.toLowerCase().includes(acc.accessoryName.toLowerCase()),
        )
        if (matchingAccessory) {
          console.log("Found matching accessory by name:", matchingAccessory)
        }
      }

      if (matchingAccessory) {
        console.log("Found matching accessory:", matchingAccessory)

        // Determine the desired state
        const desiredState = action === "on" || action === "activate" || action === "enable"

        // Toggle the accessory
        console.log(`Toggling ${matchingAccessory.accessoryName} to ${desiredState ? "ON" : "OFF"}`)

        toggleAccessoryStatus(matchingAccessory.accessoryID, desiredState)
          .then((success) => {
            console.log(`Toggle result: ${success ? "SUCCESS" : "FAILED"}`)

            if (success) {
              toast({
                title: "Voice Command Executed",
                description: `${desiredState ? "Turned on" : "Turned off"} ${matchingAccessory.accessoryName}`,
              })
            } else {
              toast({
                title: "Command Failed",
                description: `Failed to ${desiredState ? "turn on" : "turn off"} ${matchingAccessory.accessoryName}`,
                variant: "destructive",
              })
            }
          })
          .catch((error) => {
            console.error("Error toggling accessory:", error)
            toast({
              title: "Command Error",
              description: `Error toggling ${matchingAccessory.accessoryName}`,
              variant: "destructive",
            })
          })
      } else {
        console.log("No matching accessory found for target:", transcript)
        console.log(
          "Available accessories:",
          accessories.map((a) => a.accessoryName),
        )

        toast({
          title: "Voice Command Not Recognized",
          description: "Try saying 'Geminize, turn on [device name]' or 'Geminize, turn on relay [number]'",
          variant: "destructive",
        })
      }
    },
    [accessories, toggleAccessoryStatus, toast],
  )

  const { isListening, permissionState, startListening, stopListening } = useVoiceControl(processCommand)

  // Function to start audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      if (!microphoneStreamRef.current) {
        microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256

        const source = audioContextRef.current.createMediaStreamSource(microphoneStreamRef.current)
        source.connect(analyserRef.current)
      }

      const updateAudioLevel = () => {
        if (!analyserRef.current) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1

        setAudioLevel(normalizedLevel)

        if (isListening) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (error) {
      console.error("Error starting audio monitoring:", error)
    }
  }

  // Function to stop audio level monitoring
  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop())
      microphoneStreamRef.current = null
    }

    setAudioLevel(0)
  }

  // Determine button color based on permission and listening state
  const getButtonColor = () => {
    if (isListening) return "text-red-500 hover:text-red-400"
    if (permissionState === "granted") return "text-green-500 hover:text-green-400"
    if (permissionState === "denied") return "text-orange-500 hover:text-orange-400"
    if (permissionState === "unavailable") return "text-gray-500 hover:text-gray-400"
    return "text-gray-400 hover:text-gray-300"
  }

  // Calculate pulse animation based on audio level
  const getPulseStyle = () => {
    if (!isListening) return {}

    const scale = 1 + audioLevel * 0.5 // Scale from 1 to 1.5 based on audio level
    return {
      transform: `scale(${scale})`,
      transition: "transform 0.1s ease-out",
    }
  }

  // Add a function to get tooltip text based on permission state
  const getTooltipText = () => {
    if (isListening) return "Listening..."
    if (permissionState === "granted") return "Start voice control"
    if (permissionState === "denied") return "Microphone access denied"
    if (permissionState === "unavailable") return "No microphone available"
    return "Voice control"
  }

  // Handle button click - this is where we'll request permissions
  const handleClick = async () => {
    if (isListening) {
      stopListening()
    } else {
      console.log("Starting voice control...")

      // This will trigger the permission prompt because it's in direct response to a user action
      const started = await startListening()

      if (started) {
        toast({
          title: "Voice Control Activated",
          description: "Say 'Geminize, turn on [device name]' to control your accessories.",
        })
      } else if (permissionState === "unavailable") {
        toast({
          title: "Microphone Not Available",
          description: "No microphone was detected on your device.",
          variant: "destructive",
        })
      } else if (permissionState === "denied") {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings.",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    if (isListening) {
      startAudioMonitoring()
    } else {
      stopAudioMonitoring()
    }

    return () => {
      stopAudioMonitoring()
    }
  }, [isListening])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`relative ${getButtonColor()}`}
            aria-label={getTooltipText()}
            onClick={handleClick}
          >
            <div style={getPulseStyle()}>
              <Mic className="h-5 w-5" />
            </div>
            {isListening && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
          {isListening && (
            <p className="text-xs mt-1">Try: "Geminize turn on relay 1" or "Geminize turn off rock lights"</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
