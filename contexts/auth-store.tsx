"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthState {
  token: string | null
  email: string | null
  isPreviewMode: boolean
}

interface AuthContextType extends AuthState {
  setAuthState: (state: Partial<AuthState>) => void
  clearAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available (for non-V0 environments)
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    email: null,
    isPreviewMode: false,
  })

  // On mount, try to load from localStorage as a fallback
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("supabase_access_token")
      const savedEmail = localStorage.getItem("supabase_email")
      const previewMode = document.cookie.includes("preview_mode=true")

      if (savedToken || savedEmail || previewMode) {
        setAuthState({
          token: savedToken,
          email: savedEmail,
          isPreviewMode: previewMode,
        })
        console.log("Auth state loaded from localStorage/cookies")
      }
    } catch (error) {
      console.error("Error loading auth state:", error)
    }
  }, [])

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

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setAuthState: updateAuthState,
        clearAuthState,
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
