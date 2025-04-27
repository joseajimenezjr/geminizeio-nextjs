"use client"

import { useState, useEffect, useCallback } from "react"
import { parseVoiceCommand } from "@/lib/voice-commands"

type PermissionState = "granted" | "denied" | "prompt" | "unavailable"

type ProcessCommandFunction = (
  transcript: string,
  action: string,
  relayPosition: number | null,
  isTurnSignalCommand?: boolean,
  turnSignalAction?: "left" | "right" | "hazard" | null,
  turnSignalState?: "on" | "off" | "toggle",
) => void

export function useVoiceControl(processCommand: ProcessCommandFunction) {
  const [isListening, setIsListening] = useState(false)
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt")
  const [recognition, setRecognition] = useState<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is available
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.log("Speech recognition not available")
      setPermissionState("unavailable")
      return
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    // Configure recognition
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false
    recognitionInstance.lang = "en-US"

    // Set up event handlers
    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Recognized speech:", transcript)

      // Parse the command
      const parsedCommand = parseVoiceCommand(transcript)
      console.log("Parsed command:", parsedCommand)

      if (parsedCommand.isValid && parsedCommand.hasWakeWord) {
        // Process the command
        processCommand(
          parsedCommand.target,
          parsedCommand.action,
          parsedCommand.relayPosition,
          parsedCommand.isTurnSignalCommand,
          parsedCommand.turnSignalAction,
          parsedCommand.turnSignalState,
        )
      } else {
        console.log("Invalid command or missing wake word")
      }

      // Stop listening after processing a command
      recognitionInstance.stop()
      setIsListening(false)
    }

    recognitionInstance.onend = () => {
      console.log("Speech recognition ended")
      setIsListening(false)
    }

    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)

      if (event.error === "not-allowed") {
        setPermissionState("denied")
      }

      setIsListening(false)
    }

    // Save the recognition instance
    setRecognition(recognitionInstance)

    // Check permission state
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((permissionStatus) => {
        console.log("Microphone permission state:", permissionStatus.state)
        setPermissionState(permissionStatus.state as PermissionState)

        // Listen for permission changes
        permissionStatus.onchange = () => {
          console.log("Microphone permission state changed:", permissionStatus.state)
          setPermissionState(permissionStatus.state as PermissionState)
        }
      })
      .catch((error) => {
        console.error("Error checking microphone permission:", error)
      })

    // Cleanup
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [processCommand])

  // Start listening function
  const startListening = useCallback(async () => {
    if (!recognition) {
      console.error("Speech recognition not initialized")
      return false
    }

    if (permissionState === "denied") {
      console.log("Microphone permission denied")
      return false
    }

    if (permissionState === "unavailable") {
      console.log("Speech recognition not available")
      return false
    }

    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Start recognition
      recognition.start()
      setIsListening(true)
      console.log("Started listening")
      return true
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setPermissionState("denied")
      return false
    }
  }, [recognition, permissionState])

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
      console.log("Stopped listening")
    }
  }, [recognition, isListening])

  return {
    isListening,
    permissionState,
    startListening,
    stopListening,
  }
}
