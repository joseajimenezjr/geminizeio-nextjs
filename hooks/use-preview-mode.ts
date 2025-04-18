"use client"

import { useState, useEffect } from "react"

export function usePreviewMode() {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check for token in window object
    if (typeof window !== "undefined" && window.__PREVIEW_AUTH?.token) {
      setIsPreviewMode(true)
      setToken(window.__PREVIEW_AUTH.token)
      setEmail(window.__PREVIEW_AUTH.email)
      console.log("Preview mode detected: token found in window.__PREVIEW_AUTH")
      return
    }

    // Fallback to localStorage
    try {
      // Check for token in localStorage
      const savedToken = localStorage.getItem("supabase_access_token")
      if (savedToken) {
        setIsPreviewMode(true)
        setToken(savedToken)
        console.log("Preview mode detected: token found in localStorage")
      }

      // Check for email in localStorage
      const savedEmail = localStorage.getItem("supabase_email")
      if (savedEmail) {
        setEmail(savedEmail)
        console.log("Email found in localStorage:", savedEmail)
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e)
    }
  }, [])

  return { isPreviewMode, token, email }
}
