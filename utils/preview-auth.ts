// Utility for managing preview mode authentication

// Define the preview auth data structure
export interface PreviewAuthData {
  token: string
  userId?: string
  email?: string
  timestamp: number
}

// Constants
const TOKEN_STORAGE_KEY = "supabase_access_token"
const EMAIL_STORAGE_KEY = "supabase_email"
const PREVIEW_COOKIE_NAME = "preview_mode"

/**
 * Save preview authentication data
 */
export function savePreviewAuth(data: PreviewAuthData): void {
  // 1. Save to window object for immediate access
  if (typeof window !== "undefined") {
    window.__PREVIEW_AUTH = data
  }

  // 2. Save to localStorage as fallback
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
    if (data.email) localStorage.setItem(EMAIL_STORAGE_KEY, data.email)
  } catch (e) {
    console.warn("Could not save auth data to localStorage:", e)
  }

  // 3. Set preview mode cookie
  document.cookie = `${PREVIEW_COOKIE_NAME}=true; path=/; max-age=86400; SameSite=Lax`
}

/**
 * Get preview authentication data
 */
export function getPreviewAuth(): PreviewAuthData | null {
  // 1. Try window object first (fastest)
  if (typeof window !== "undefined" && window.__PREVIEW_AUTH?.token) {
    return window.__PREVIEW_AUTH
  }

  // 2. Fall back to localStorage
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    const email = localStorage.getItem(EMAIL_STORAGE_KEY)

    if (token) {
      return {
        token,
        email: email || undefined,
        timestamp: Date.now(), // We don't know the original timestamp
      }
    }
  } catch (e) {
    console.warn("Could not access localStorage:", e)
  }

  return null
}

/**
 * Clear preview authentication data
 */
export function clearPreviewAuth(): void {
  // 1. Clear window object
  if (typeof window !== "undefined") {
    window.__PREVIEW_AUTH = undefined
  }

  // 2. Clear localStorage
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(EMAIL_STORAGE_KEY)
  } catch (e) {
    console.warn("Could not clear localStorage:", e)
  }

  // 3. Clear cookie
  document.cookie = `${PREVIEW_COOKIE_NAME}=; path=/; max-age=0`
}

/**
 * Check if preview mode is active
 */
export function isPreviewMode(): boolean {
  // Check for preview mode cookie
  const hasPreviewCookie = document.cookie.includes(`${PREVIEW_COOKIE_NAME}=true`)

  // Check for preview mode in URL
  const hasPreviewParam =
    typeof window !== "undefined" && new URL(window.location.href).searchParams.has("preview_mode")

  // Check for auth data
  const hasAuthData = !!getPreviewAuth()

  return hasPreviewCookie || hasPreviewParam || hasAuthData
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): { Authorization: string } | undefined {
  const auth = getPreviewAuth()
  return auth?.token ? { Authorization: `Bearer ${auth.token}` } : undefined
}
