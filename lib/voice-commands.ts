import { bluetoothService } from "@/services/bluetooth-service"

// Parse voice commands to extract the target device and action
export function parseVoiceCommand(command: string) {
  // Convert to lowercase for easier matching
  const lowerCommand = command.toLowerCase().trim()

  console.log("🔍 Parsing command:", lowerCommand)

  // Check for wake word (optional)
  const wakeWords = ["geminize", "geminise", "gemini", "geminize", "hey geminize"]
  let hasWakeWord = false

  for (const wakeWord of wakeWords) {
    if (lowerCommand.includes(wakeWord)) {
      hasWakeWord = true
      console.log("✅ Wake word found:", wakeWord)
      break
    }
  }

  // Define action keywords
  const onActions = ["turn on", "activate", "enable", "start", "power on", "switch on"]
  const offActions = ["turn off", "deactivate", "disable", "stop", "power off", "switch off"]

  let action = ""
  let target = ""
  let isValid = false
  let relayPosition: number | null = null

  // Check for "turn on/off relay position number X"
  const relayPositionRegex = /(turn\s(?:on|off))\s(?:relay\s)?(?:(?:number\s|position\s)?)(\d+)/i
  const relayMatch = lowerCommand.match(relayPositionRegex)

  if (relayMatch) {
    action = onActions.some((onAction) => relayMatch[1].includes(onAction)) ? "on" : "off"
    relayPosition = Number.parseInt(relayMatch[2], 10)
    target = `relay ${relayPosition}`
    isValid = true
    console.log("✅ Relay position command detected:", action, relayPosition)
  }

  // Try to extract action and target using different patterns
  if (!isValid) {
    // Pattern 1: "turn on/off [target]"
    // Check for "on" actions
    for (const onAction of onActions) {
      if (lowerCommand.includes(onAction)) {
        action = "on"
        // Extract target after the action
        const parts = lowerCommand.split(onAction)
        if (parts.length > 1) {
          target = parts[1].trim()
          isValid = true
          console.log("✅ Action detected:", onAction)
          break
        }
      }
    }

    // Check for "off" actions if no "on" action was found
    if (!isValid) {
      for (const offAction of offActions) {
        if (lowerCommand.includes(offAction)) {
          action = "off"
          // Extract target after the action
          const parts = lowerCommand.split(offAction)
          if (parts.length > 1) {
            target = parts[1].trim()
            isValid = true
            console.log("✅ Action detected:", offAction)
            break
          }
        }
      }
    }

    // Pattern 2: "[target] on/off"
    if (!isValid) {
      if (lowerCommand.endsWith(" on")) {
        action = "on"
        target = lowerCommand.slice(0, -3).trim()
        isValid = true
        console.log("✅ Pattern 2: Target followed by 'on'")
      } else if (lowerCommand.endsWith(" off")) {
        action = "off"
        target = lowerCommand.slice(0, -4).trim()
        isValid = true
        console.log("✅ Pattern 2: Target followed by 'off'")
      }
    }

    // Pattern 3: Just extract any known device name
    if (!isValid || !target) {
      // This would be implemented with a list of known device names
      // For now, we'll just use a fallback
      console.log("⚠️ No clear pattern matched, using fallback parsing")

      // Remove wake word if present
      let commandWithoutWakeWord = lowerCommand
      for (const wakeWord of wakeWords) {
        if (lowerCommand.includes(wakeWord)) {
          commandWithoutWakeWord = lowerCommand.replace(wakeWord, "").trim()
          // Remove comma if present
          commandWithoutWakeWord = commandWithoutWakeWord.replace(/^,\s*/, "")
          break
        }
      }

      // Try to determine if it's an on or off command
      if (
        commandWithoutWakeWord.includes(" on") ||
        commandWithoutWakeWord.includes("activate") ||
        commandWithoutWakeWord.includes("enable") ||
        commandWithoutWakeWord.includes("start")
      ) {
        action = "on"
      } else if (
        commandWithoutWakeWord.includes(" off") ||
        commandWithoutWakeWord.includes("deactivate") ||
        commandWithoutWakeWord.includes("disable") ||
        commandWithoutWakeWord.includes("stop")
      ) {
        action = "off"
      }

      // Extract potential target by removing action words
      if (action) {
        let potentialTarget = commandWithoutWakeWord
        const actionWords =
          action === "on" ? ["on", "activate", "enable", "start"] : ["off", "deactivate", "disable", "stop"]

        for (const word of actionWords) {
          potentialTarget = potentialTarget.replace(word, "").trim()
        }

        if (potentialTarget) {
          target = potentialTarget
          isValid = true
          console.log("✅ Fallback parsing extracted target:", target)
        }
      }
    }
  }

  // Clean up target by removing common words
  if (target) {
    const wordsToRemove = ["the", "my", "please", "can", "you", "would", "could", "really", "actually"]
    for (const word of wordsToRemove) {
      target = target.replace(new RegExp(`\\b${word}\\b`, "g"), "").trim()
    }

    // Remove any remaining commas
    target = target.replace(/,/g, "").trim()

    console.log("✅ Final target after cleanup:", target)
  }

  return {
    isValid: isValid && !!target,
    target,
    action,
    hasWakeWord,
    relayPosition,
  }
}

// Execute a voice command by controlling the appropriate device
export async function executeVoiceCommand(command: string): Promise<{
  success: boolean
  message: string
  action?: string
  target?: string
  relayPosition?: number | null
}> {
  try {
    console.log("🎯 Executing voice command:", command)

    // Parse the command
    const parsedCommand = parseVoiceCommand(command)

    if (!parsedCommand.isValid) {
      return {
        success: false,
        message: "Could not understand the command. Please try again.",
      }
    }

    const { action, target, relayPosition } = parsedCommand

    // Handle relay commands specifically
    if (relayPosition !== null && relayPosition > 0) {
      try {
        if (action === "on" || action === "off") {
          await bluetoothService.setRelayState(relayPosition, action as "on" | "off")
          return {
            success: true,
            message: `Relay ${relayPosition} turned ${action}`,
            action,
            target,
            relayPosition,
          }
        }
      } catch (error) {
        console.error("Error controlling relay:", error)
        return {
          success: false,
          message: `Failed to control relay ${relayPosition}: ${error instanceof Error ? error.message : String(error)}`,
          action,
          target,
          relayPosition,
        }
      }
    }

    // Handle other device types based on target name
    // This is a simplified implementation - in a real app, you'd have a mapping of
    // device names to their control functions

    // Example: Handle light-related commands
    if (target.includes("light") || target.includes("lamp") || target.includes("spotlight")) {
      // Find the appropriate relay for lights (example: relay 1)
      const lightRelay = 1

      try {
        await bluetoothService.setRelayState(lightRelay, action as "on" | "off")
        return {
          success: true,
          message: `${target} turned ${action}`,
          action,
          target,
        }
      } catch (error) {
        console.error("Error controlling light:", error)
        return {
          success: false,
          message: `Failed to control ${target}: ${error instanceof Error ? error.message : String(error)}`,
          action,
          target,
        }
      }
    }

    // Example: Handle winch commands
    if (target.includes("winch")) {
      // Find the appropriate relay for winch (example: relay 2)
      const winchRelay = 2

      try {
        await bluetoothService.setRelayState(winchRelay, action as "on" | "off")
        return {
          success: true,
          message: `Winch turned ${action}`,
          action,
          target,
        }
      } catch (error) {
        console.error("Error controlling winch:", error)
        return {
          success: false,
          message: `Failed to control winch: ${error instanceof Error ? error.message : String(error)}`,
          action,
          target,
        }
      }
    }

    // Default case: we understood the command but don't know how to execute it
    return {
      success: false,
      message: `I understood you want to turn ${action} the ${target}, but I don't know how to control that device.`,
      action,
      target,
    }
  } catch (error) {
    console.error("Error executing voice command:", error)
    return {
      success: false,
      message: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
