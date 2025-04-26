"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react"

interface ChaseLightWidgetProps {
  id: string
  title?: string
  accessoryId?: string
}

export function ChaseLightWidget({ id, title = "Chase Light", accessoryId }: ChaseLightWidgetProps) {
  const [pattern, setPattern] = useState<"left" | "right" | "hazard" | "off">("off")
  const [isRunning, setIsRunning] = useState(false)

  // Simulate sending commands to the device
  const sendCommand = async (command: string) => {
    console.log(`Sending command to chase light: ${command}`)
    // In a real implementation, this would send a command to the device
    // await fetch(`/api/accessories/${accessoryId}/command`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ command }),
    // })
  }

  const handlePatternChange = (newPattern: "left" | "right" | "hazard" | "off") => {
    setPattern(newPattern)

    if (newPattern === "off") {
      setIsRunning(false)
      sendCommand("stop")
    } else {
      setIsRunning(true)
      sendCommand(newPattern)
    }
  }

  const toggleRunning = () => {
    const newRunningState = !isRunning
    setIsRunning(newRunningState)

    if (newRunningState && pattern !== "off") {
      sendCommand(pattern)
    } else {
      sendCommand("stop")
    }
  }

  const resetPattern = () => {
    setPattern("off")
    setIsRunning(false)
    sendCommand("stop")
  }

  return (
    <Card className="bg-black text-white rounded-lg shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <Button
            size="lg"
            className={`w-20 h-20 ${
              pattern === "left" && isRunning ? "bg-amber-500 text-black" : "bg-gray-700 border border-gray-600"
            }`}
            onClick={() => handlePatternChange("left")}
          >
            <ArrowLeft className="h-10 w-10" />
          </Button>

          <Button
            size="lg"
            className={`w-20 h-20 ${
              pattern === "right" && isRunning ? "bg-amber-500 text-black" : "bg-gray-700 border border-gray-600"
            }`}
            onClick={() => handlePatternChange("right")}
          >
            <ArrowRight className="h-10 w-10" />
          </Button>

          <Button
            size="lg"
            className={`w-20 h-20 ${
              pattern === "hazard" && isRunning ? "bg-amber-500 text-black" : "bg-gray-700 border border-gray-600"
            }`}
            onClick={() => handlePatternChange("hazard")}
          >
            <div className="flex items-center justify-center">
              <ArrowLeft className="h-6 w-6 mr-1" />
              <ArrowRight className="h-6 w-6 ml-1" />
            </div>
          </Button>

          <Button size="lg" className="w-20 h-20 bg-gray-700 border border-gray-600" onClick={resetPattern}>
            <RotateCcw className="h-10 w-10" />
          </Button>
        </div>

        <Button
          size="lg"
          className={`w-full mt-2 ${isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
          onClick={toggleRunning}
          disabled={pattern === "off"}
        >
          {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isRunning ? "Stop" : "Start"}
        </Button>
      </CardContent>
    </Card>
  )
}
