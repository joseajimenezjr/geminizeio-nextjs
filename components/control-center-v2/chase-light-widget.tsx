"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Box, Slider, Typography } from "@mui/material"

interface ChaseLightWidgetProps {
  initialSpeed?: number
  onSpeedChange?: (speed: number) => void
}

const ChaseLightWidget: React.FC<ChaseLightWidgetProps> = ({ initialSpeed = 50, onSpeedChange }) => {
  const [speed, setSpeed] = useState<number>(initialSpeed)

  useEffect(() => {
    setSpeed(initialSpeed)
  }, [initialSpeed])

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const newSpeed = typeof newValue === "number" ? newValue : speed
    setSpeed(newSpeed)
    if (onSpeedChange) {
      onSpeedChange(newSpeed)
    }
  }

  return (
    <Box sx={{ width: 200, padding: 2 }}>
      <Typography id="discrete-slider" gutterBottom>
        Chase Light Speed
      </Typography>
      <Slider
        aria-labelledby="discrete-slider"
        value={speed}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={0}
        max={100}
      />
      <Typography variant="body2">Speed: {speed}</Typography>
    </Box>
  )
}

export { ChaseLightWidget }
