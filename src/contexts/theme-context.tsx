"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

type ThemeType = "light" | "dark" | "system"

type ThemeContextType = {
  theme: ThemeType
  isDarkMode: boolean
  setTheme: (theme: ThemeType) => void
  colors: {
    background: string
    card: string
    text: string
    border: string
    primary: string
    primaryForeground: string
    secondary: string
    muted: string
    mutedForeground: string
    accent: string
    error: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeType>("system")

  // Determine if dark mode is active
  const isDarkMode = theme === "system" ? systemColorScheme === "dark" : theme === "dark"

  // Define color palette
  const lightColors = {
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0",
    primary: "#C00000",
    primaryForeground: "#FFFFFF",
    secondary: "#F9ECEC",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    accent: "#F9ECEC",
    error: "#EF4444",
  }

  const darkColors = {
    background: "#0F172A",
    card: "#1E293B",
    text: "#F8FAFC",
    border: "#334155",
    primary: "#C00000",
    primaryForeground: "#F8FAFC",
    secondary: "#334155",
    muted: "#1E293B",
    mutedForeground: "#94A3B8",
    accent: "#334155",
    error: "#EF4444",
  }

  const colors = isDarkMode ? darkColors : lightColors

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme")
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
          setThemeState(savedTheme as ThemeType)
        }
      } catch (error) {
        console.error("Failed to load theme", error)
      }
    }

    loadTheme()
  }, [])

  // Set theme and save to storage
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem("theme", newTheme)
    } catch (error) {
      console.error("Failed to save theme", error)
    }
  }

  const value = {
    theme,
    isDarkMode,
    setTheme,
    colors,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Custom hook to use the Theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

