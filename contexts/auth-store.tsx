"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getUserData } from "@/app/actions/user-data"

interface AuthState {
  token: string | null
  email: string | null
  isPreviewMode: boolean
  userData: any | null
  hasHubDevices: boolean
}

interface AuthContextType extends AuthState {
  setAuthState: (state: Partial<AuthState>) => void
  clearAuthState: () => void
  updateUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  // Initialize state from localStorage if available (for non-V0 environments)
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    email: null,
    isPreviewMode: false,
    userData: null,
    hasHubDevices: false,
  })

  // On mount, try to load from localStorage as a fallback
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const savedToken = localStorage.getItem("supabase_access_token")
        const savedEmail = localStorage.getItem("supabase_email")
        const previewMode = document.cookie.includes("preview_mode=true")

        if (savedToken || savedEmail || previewMode) {
          setAuthState((prev) => ({
            ...prev,
            token: savedToken,
            email: savedEmail,
            isPreviewMode: previewMode,
          }))
          console.log("Auth state loaded from localStorage/cookies")
        }
      } catch (error) {
        console.error("Error loading auth state:", error)
      }
    }

    loadAuthState()
  }, [])

  // Fetch user data on mount and when the session changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData()
        setAuthState((prev) => ({
          ...prev,
          userData: data,
          hasHubDevices:
            data?.hubDetails?.some(
              (device: any) =>
                device.deviceType === "hub" || device.deviceType === "relay_hub" || device.deviceType === "turn_signal",
            ) || false,
        }))
        console.log("Fetched user data:", data)
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUserData()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Update auth state
  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...newState }))

    // Also try to save to localStorage as a fallback for non-V0 environments
    try {
      if (newState.token !== undefined) {
        if (newState.token) {
          localStorage.setItem("supabase_access_token", newState.token)
        } else {
          localStorage.removeItem("supabase_access_token")
        }
      }

      if (newState.email !== undefined) {
        if (newState.email) {
          localStorage.setItem("supabase_email", newState.email)
        } else {
          localStorage.removeItem("supabase_email")
        }
      }

      if (newState.isPreviewMode !== undefined) {
        if (newState.isPreviewMode) {
          document.cookie = "preview_mode=true; path=/; max-age=86400; SameSite=Lax"
        } else {
          document.cookie = "preview_mode=; path=/; max-age=0"
        }
      }
    } catch (error) {
      console.error("Error saving auth state:", error)
    }
  }

  // Clear auth state
  const clearAuthState = () => {
    setAuthState({
      token: null,
      email: null,
      isPreviewMode: false,
      userData: null,
      hasHubDevices: false,
    })

    // Also clear localStorage and cookies as a fallback
    try {
      localStorage.removeItem("supabase_access_token")
      localStorage.removeItem("supabase_email")
      document.cookie = "preview_mode=; path=/; max-age=0"
    } catch (error) {
      console.error("Error clearing auth state:", error)
    }
  }

  const updateUserData = async () => {
    try {
      const data = await getUserData()
      setAuthState((prev) => ({
        ...prev,
        userData: data,
        hasHubDevices:
          data?.hubDetails?.some(
            (device: any) =>
              device.deviceType === "hub" || device.deviceType === "relay_hub" || device.deviceType === "turn_signal",
          ) || false,
      }))
      console.log("Updated user data:", data)
    } catch (error) {
      console.error("Error updating user data:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setAuthState: updateAuthState,
        clearAuthState,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthStore() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
