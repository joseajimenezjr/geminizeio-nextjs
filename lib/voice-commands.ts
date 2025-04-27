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

  // Special handling for turn signals and hazard lights
  let isTurnSignalCommand = false
  let turnSignalAction: "left" | "right" | "hazard" | null = null
  let turnSignalState: "on" | "off" | "toggle" = "toggle" // Default to toggle if not specified

  // Check for turn signal commands
  const leftSignalPatterns = ["left signal", "left turn signal", "left blinker", "left indicator", "turn left"]

  const rightSignalPatterns = ["right signal", "right turn signal", "right blinker", "right indicator", "turn right"]

  const hazardPatterns = [
    "hazard",
    "hazards",
    "hazard lights",
    "hazard signals",
    "emergency lights",
    "emergency signals",
    "warning lights",
  ]

  // Check for left turn signal commands
  for (const pattern of leftSignalPatterns) {
    if (lowerCommand.includes(pattern)) {
      isTurnSignalCommand = true
      turnSignalAction = "left"
      console.log("✅ Left turn signal command detected")

      // Determine if it's on, off, or toggle
      if (onActions.some((action) => lowerCommand.includes(action)) || lowerCommand.includes("on")) {
        turnSignalState = "on"
      } else if (offActions.some((action) => lowerCommand.includes(action)) || lowerCommand.includes("off")) {
        turnSignalState = "off"
      } else {
        turnSignalState = "toggle"
      }

      isValid = true
      break
    }
  }

  // Check for right turn signal commands
  if (!isTurnSignalCommand) {
    for (const pattern of rightSignalPatterns) {
      if (lowerCommand.includes(pattern)) {
        isTurnSignalCommand = true
        turnSignalAction = "right"
        console.log("✅ Right turn signal command detected")

        // Determine if it's on, off, or toggle
        if (onActions.some((action) => lowerCommand.includes(action)) || lowerCommand.includes("on")) {
          turnSignalState = "on"
        } else if (offActions.some((action) => lowerCommand.includes(action)) || lowerCommand.includes("off")) {
          turnSignalState = "off"
        } else {
          turnSignalState = "toggle"
        }

        isValid = true
        break
      }
    }
  }

  // Check for hazard light commands
  if (!isTurnSignalCommand) {
    for (const pattern of hazardPatterns) {
      if (lowerCommand.includes(pattern)) {
        isTurnSignalCommand = true
        turnSignalAction = "hazard"
        console.log("✅ Hazard lights command detected")

        // Determine if it's on, off, or toggle
        if (onActions.some((action) => lowerCommand.includes(action)) || lowerCommand.includes("on")) {
          turnSignalState = "on"
        } else if (offActions.some((action) => lowerCommand.includes(action)) || lowerCommand.includes("off")) {
          turnSignalState = "off"
        } else {
          turnSignalState = "toggle"
        }

        isValid = true
        break
      }
    }
  }

  // If it's a turn signal command, set the target accordingly
  if (isTurnSignalCommand) {
    target =
      turnSignalAction === "left" ? "left signal" : turnSignalAction === "right" ? "right signal" : "hazard lights"
    action = turnSignalState === "on" ? "on" : turnSignalState === "off" ? "off" : "toggle"

    // We're done parsing, return early
    return {
      isValid,
      target,
      action,
      hasWakeWord,
      relayPosition,
      isTurnSignalCommand,
      turnSignalAction,
      turnSignalState,
    }
  }

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
    isTurnSignalCommand,
    turnSignalAction,
    turnSignalState,
  }
}
