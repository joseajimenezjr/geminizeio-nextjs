"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useEffectEvent } from "@/hooks/use-effect-event" // Import from our custom hook
import { parseVoiceCommand } from "@/lib/voice-commands"

type VoiceCommandHandler = (target: string, action: string, relayPosition: number | null) => void

// Define SpeechRecognition interface if it's not globally available
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognition {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: (event: any) => void
    onerror: (event: any) => void
    onend: () => void
    start: () => void
    abort: () => void
    stop: () => void
  }
}

export function useVoiceControl(onCommand: VoiceCommandHandler) {
  const [isListening, setIsListening] = useState(false)
  const [permissionState, setPermissionState] = useState<"granted" | "denied" | "prompt" | "unavailable">("prompt")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isChromeRef = useRef<boolean>(false)
  const resetCountRef = useRef<number>(0)
  const userAgentRef = useRef<string>("")
  const periodicResetTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if browser supports speech recognition
  const isSpeechRecognitionSupported = useCallback(() => {
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  }, [])

  // Check if the browser is Chrome (any platform)
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    userAgentRef.current = navigator.userAgent
    isChromeRef.current = userAgent.includes("chrome")
    console.log(
      `[Voice Control ${new Date().toLocaleTimeString()}] Detected browser user agent: ${userAgentRef.current}`,
    )
    console.log(
      `[Voice Control ${new Date().toLocaleTimeString()}] Chrome browser detected: ${isChromeRef.current ? "Yes" : "No"}`,
    )
  }, [])

  // Check if the browser supports getUserMedia
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState("unavailable")
    }
  }, [])

  // Use our custom useEffectEvent for handling speech recognition results
  const handleSpeechResult = useEffectEvent((event: any) => {
    const transcript = event.results[event.results.length - 1][0].transcript
    console.log(`[Voice Control ${new Date().toLocaleTimeString()}] Voice command received: "${transcript}"`)

    // Process the command
    const { target, action, relayPosition, isValid } = parseVoiceCommand(transcript)

    if (isValid) {
      console.log(
        `[Voice Control ${new Date().toLocaleTimeString()}] Valid command detected: target=${target}, action=${action}, relayPosition=${relayPosition}`,
      )
      onCommand(target, action, relayPosition || null)

      // For Chrome, do an aggressive reset after each command
      if (isChromeRef.current) {
        console.log(
          `[Voice Control ${new Date().toLocaleTimeString()}] Chrome browser detected - scheduling aggressive recognition reset`,
        )
        setTimeout(() => {
          console.log(
            `[Voice Control ${new Date().toLocaleTimeString()}] Executing scheduled aggressive reset after successful command`,
          )
          forceRecreateRecognition()
        }, 1000) // Longer delay to ensure the previous command is fully processed
      }
    }
  })

  // Function for completely destroying and recreating the recognition instance
  const forceRecreateRecognition = useCallback(() => {
    const resetCount = ++resetCountRef.current
    console.log(
      `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Beginning complete recreation of recognition. isListening=${isListening}`,
    )

    // Check if we should proceed with the reset
    if (!isListening) {
      console.log(
        `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Cancelled - no longer listening`,
      )
      return // Exit if we're no longer supposed to be listening
    }

    // First, completely clean up the existing instance
    if (recognitionRef.current) {
      try {
        // Remove all event listeners
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null

        // Try both abort and stop methods
        try {
          recognitionRef.current.abort()
          console.log(
            `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Called abort() on previous instance`,
          )
        } catch (e) {
          console.log(
            `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: abort() failed, error:`,
            e,
          )
        }

        try {
          recognitionRef.current.stop()
          console.log(
            `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Called stop() on previous instance`,
          )
        } catch (e) {
          console.log(
            `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: stop() failed, error:`,
            e,
          )
        }

        // Clear the reference
        recognitionRef.current = null
        console.log(
          `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Cleared reference to previous instance`,
        )
      } catch (e) {
        console.error(
          `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Error during cleanup:`,
          e,
        )
      }
    }

    // Short delay before creating a new instance
    setTimeout(() => {
      // Double check isListening before proceeding
      if (!isListening) {
        console.log(
          `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Cancelled - no longer listening`,
        )
        return
      }

      console.log(
        `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Creating new recognition instance`,
      )

      try {
        // Create a completely new instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = "en-US"

        // Set up event handlers
        recognition.onresult = handleSpeechResult

        recognition.onerror = (event) => {
          console.error(`[Voice Control ${new Date().toLocaleTimeString()}] Speech recognition error: ${event.error}`)
          if (event.error === "not-allowed") {
            setPermissionState("denied")
          } else if (event.error === "no-speech") {
            console.log(`[Voice Control ${new Date().toLocaleTimeString()}] No speech detected`)
            // This is a normal error, don't change permission state
          } else {
            console.warn(`[Voice Control ${new Date().toLocaleTimeString()}] Speech recognition error: ${event.error}`)

            // For certain errors, try to recreate the recognition
            if (event.error === "network" || event.error === "service-not-allowed") {
              console.log(
                `[Voice Control ${new Date().toLocaleTimeString()}] Critical error detected - scheduling aggressive reset`,
              )
              setTimeout(() => forceRecreateRecognition(), 1000)
            }
          }
        }

        recognition.onend = () => {
          console.log(`[Voice Control ${new Date().toLocaleTimeString()}] Recognition onend event fired`)
          // Restart if we're still supposed to be listening
          if (isListening) {
            try {
              recognition.start()
              console.log(
                `[Voice Control ${new Date().toLocaleTimeString()}] Auto-restarted recognition after onend event`,
              )
            } catch (e) {
              console.error(
                `[Voice Control ${new Date().toLocaleTimeString()}] Failed to restart speech recognition after onend:`,
                e,
              )

              // If restart fails, try the aggressive reset
              console.log(
                `[Voice Control ${new Date().toLocaleTimeString()}] Restart failed - scheduling aggressive reset`,
              )
              setTimeout(() => forceRecreateRecognition(), 500)
            }
          }
        }

        // Start the new instance
        try {
          recognition.start()
          recognitionRef.current = recognition
          console.log(
            `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Successfully started new recognition instance`,
          )
        } catch (startError) {
          console.error(
            `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Error starting new recognition:`,
            startError,
          )

          // If we can't start, we're not really listening
          if (isListening) {
            setIsListening(false)
          }
        }
      } catch (error) {
        console.error(
          `[Voice Control ${new Date().toLocaleTimeString()}] AGGRESSIVE RESET #${resetCount}: Fatal error creating recognition:`,
          error,
        )

        // If we can't create a new instance, we're not really listening
        if (isListening) {
          setIsListening(false)
        }
      }
    }, 300) // Short delay between cleanup and recreation
  }, [isListening, handleSpeechResult])

  // Set up periodic reset for Chrome browsers
  useEffect(() => {
    if (isListening && isChromeRef.current) {
      // Set up a periodic reset every 30 seconds for Chrome
      periodicResetTimerRef.current = setInterval(() => {
        console.log(
          `[Voice Control ${new Date().toLocaleTimeString()}] Executing periodic aggressive reset (30-second interval)`,
        )
        forceRecreateRecognition()
      }, 30000)

      return () => {
        if (periodicResetTimerRef.current) {
          clearInterval(periodicResetTimerRef.current)
          periodicResetTimerRef.current = null
        }
      }
    }
  }, [isListening, forceRecreateRecognition])

  const stopListening = useCallback(() => {
    console.log(`[Voice Control ${new Date().toLocaleTimeString()}] Stopping voice recognition`)

    // Clear the periodic reset timer
    if (periodicResetTimerRef.current) {
      clearInterval(periodicResetTimerRef.current)
      periodicResetTimerRef.current = null
    }

    // Stop the recognition
    if (recognitionRef.current) {
      try {
        // Remove all event listeners
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null

        // Try both abort and stop methods
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.log(`[Voice Control ${new Date().toLocaleTimeString()}] abort() failed during stop, error:`, e)
        }

        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log(`[Voice Control ${new Date().toLocaleTimeString()}] stop() failed during stop, error:`, e)
        }

        recognitionRef.current = null
      } catch (e) {
        console.error(`[Voice Control ${new Date().toLocaleTimeString()}] Error during stop:`, e)
      }
    }

    console.log(
      `[Voice Control ${new Date().toLocaleTimeString()}] stopListening: before setIsListening(false) isListening=${isListening}`,
    )
    setIsListening(false)
  }, [])

  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionSupported()) {
      setPermissionState("unavailable")
      return false
    }

    try {
      // Request microphone permission - this must be triggered by a user action
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
        setPermissionState("granted")
      } catch (error) {
        console.error(`[Voice Control ${new Date().toLocaleTimeString()}] Microphone access error:`, error)

        // Handle specific error types
        if (error.name === "NotFoundError") {
          console.warn(`[Voice Control ${new Date().toLocaleTimeString()}] No microphone found on this device`)
          setPermissionState("unavailable")
          return false
        } else if (error.name === "NotAllowedError") {
          console.warn(`[Voice Control ${new Date().toLocaleTimeString()}] Microphone permission denied`)
          setPermissionState("denied")
          return false
        } else {
          setPermissionState("denied")
          return false
        }
      }

      console.log(`[Voice Control ${new Date().toLocaleTimeString()}] Starting voice recognition`)

      // Set the listening state first
      setIsListening(true)

      return true
    } catch (error) {
      console.error(`[Voice Control ${new Date().toLocaleTimeString()}] Error setting up speech recognition:`, error)
      setPermissionState("denied")
      setIsListening(false)
      return false
    }
  }, [isSpeechRecognitionSupported, forceRecreateRecognition])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  useEffect(() => {
    if (isListening) {
      console.log(`[Voice Control ${new Date().toLocaleTimeString()}] Now listening...`)
      // Perform actions that should only happen when isListening is true
    } else {
      console.log(`[Voice Control ${new Date().toLocaleTimeString()}] No longer listening.`)
      // Perform actions that should only happen when isListening is false
    }
  }, [isListening])

  useEffect(() => {
    if (isListening) {
      console.log(
        `[Voice Control ${new Date().toLocaleTimeString()}] isListening is now true, calling forceRecreateRecognition`,
      )
      forceRecreateRecognition()
    }
  }, [isListening, forceRecreateRecognition])

  return {
    isListening,
    permissionState,
    startListening,
    stopListening,
  }
}
