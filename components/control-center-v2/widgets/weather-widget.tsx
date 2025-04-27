"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, Snowflake, Loader2 } from "lucide-react"

// OpenWeather API types
interface WeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  name: string
  sys: {
    country: string
  }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (err) => {
          console.error("Error getting location:", err)
          setError("Unable to get your location")
          setLoading(false)
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
    }
  }, [])

  // Fetch weather data when location is available
  useEffect(() => {
    if (location) {
      fetchWeatherData()
    }
  }, [location])

  const fetchWeatherData = async () => {
    if (!location) return

    try {
      const API_KEY = "ba8cf5d5bf2163e46a4fb6558dd58ad3"
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=imperial&appid=${API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data: WeatherData = await response.json()
      setWeather(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching weather:", err)
      setError("Failed to fetch weather data")
      setLoading(false)
    }
  }

  // Get the appropriate weather icon based on the condition
  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-16 w-16 text-yellow-500" />

    const conditionId = weather.weather[0].id

    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (conditionId >= 200 && conditionId < 600) {
      return <CloudRain className="h-16 w-16 text-blue-500" />
    } else if (conditionId >= 600 && conditionId < 700) {
      return <Snowflake className="h-16 w-16 text-blue-300" />
    } else if (conditionId >= 801 && conditionId < 900) {
      return <Cloud className="h-16 w-16 text-gray-500" />
    } else {
      return <Sun className="h-16 w-16 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-3 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="mt-2 text-sm text-muted-foreground">Loading weather data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 flex flex-col items-center justify-center h-full">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="p-3 flex flex-col items-center justify-center h-full">
        <div className="text-muted-foreground text-center">Weather data unavailable</div>
      </div>
    )
  }

  return (
    <div className="p-3 flex flex-col items-center justify-center h-full">
      <div className="text-2xl font-medium text-muted-foreground mb-1 w-full text-center">
        {weather.name}
      </div>
      <div className="flex items-center justify-center">
        {getWeatherIcon()}
        <div className="text-6xl font-bold ml-2">{Math.round(weather.main.temp)}°</div>
      </div>
      <div className="text-xl font-medium mt-1 capitalize">{weather.weather[0].description}</div>
    </div>
  )
}
