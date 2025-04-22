import type React from "react"

interface TemperatureWidgetProps {
  temperature: number
  unit: "Celsius" | "Fahrenheit"
}

const TemperatureWidget: React.FC<TemperatureWidgetProps> = ({ temperature, unit }) => {
  return (
    <div>
      <h3>Temperature</h3>
      <p>
        {temperature} °{unit === "Celsius" ? "C" : "F"}
      </p>
    </div>
  )
}

export { TemperatureWidget }
