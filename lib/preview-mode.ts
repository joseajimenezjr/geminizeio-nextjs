/**
 * Preview Mode Utilities
 *
 * This file contains utilities for detecting, setting, and clearing preview mode.
 */

// Constants
const PREVIEW_MODE_COOKIE = "preview_mode"
const PREVIEW_MODE_PARAM = "preview_mode"
const TOKEN_STORAGE_KEY = "supabase_access_token"
const EMAIL_STORAGE_KEY = "supabase_email"

// Helper function to check if we're in the V0 environment
/**
 * Helper function to check if we're in the V0 environment
 */
function isInV0Environment(): boolean {
  if (typeof window === "undefined") return false

  return (
    window.location.hostname.includes("v0.dev") ||
    window.location.hostname.includes("vercel-v0") ||
    window.location.search.includes("v0preview=true")
  )
}

/**
 * Set preview mode in all possible storage locations
 */
export function setPreviewMode(token?: string, email?: string) {
  // Only allow preview mode in V0 environment
  if (!isInV0Environment()) {
    console.log("Preview mode is only available in the V0 environment")
    return
  }

  // 1. Set localStorage for token and email if provided
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    if (email) localStorage.setItem(EMAIL_STORAGE_KEY, email)
  } catch (e) {
    console.warn("Could not access localStorage:", e)
  }

  // 2. Set window.__PREVIEW_AUTH if token is provided
  if (token && typeof window !== "undefined") {
    window.__PREVIEW_AUTH = {
      token,
      email: email || null,
      timestamp: Date.now(),
    }
  }

  // 3. Ensure URL has preview_mode parameter
  const url = new URL(window.location.href)
  if (!url.searchParams.has(PREVIEW_MODE_PARAM)) {
    url.searchParams.set(PREVIEW_MODE_PARAM, "true")
    window.history.replaceState(null, document.title, url.toString())
  }
}

/**
 * Clear preview mode from all storage locations
 */
export function clearPreviewMode() {
  // 1. Clear localStorage
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(EMAIL_STORAGE_KEY)
  } catch (e) {
    console.warn("Could not access localStorage:", e)
  }

  // 2. Clear window.__PREVIEW_AUTH
  if (typeof window !== "undefined") {
    window.__PREVIEW_AUTH = undefined
  }

  // 3. Remove preview_mode parameter from URL
  const url = new URL(window.location.href)
  if (url.searchParams.has(PREVIEW_MODE_PARAM)) {
    url.searchParams.delete(PREVIEW_MODE_PARAM)
    window.history.replaceState(null, document.title, url.toString())
  }
}

/**
 * Check if preview mode is active
 */
export function isPreviewMode(): boolean {
  // Only allow preview mode in V0 environment
  if (!isInV0Environment()) return false

  if (typeof window === "undefined") return false

  // 1. Check URL parameter
  const url = new URL(window.location.href)
  const hasUrlParam = url.searchParams.has(PREVIEW_MODE_PARAM)

  // 2. Check window.__PREVIEW_AUTH
  const hasWindowAuth = !!window.__PREVIEW_AUTH?.token

  return hasUrlParam || hasWindowAuth
}

/**
 * Get token from any available source
 */
export function getPreviewToken(): string | null {
  // Only allow preview mode in V0 environment
  if (!isInV0Environment()) return null

  if (typeof window === "undefined") return null

  // 1. Try window.__PREVIEW_AUTH
  if (window.__PREVIEW_AUTH?.token) {
    return window.__PREVIEW_AUTH.token
  }

  // 2. Try URL hash
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const hashToken = params.get("token")
  if (hashToken) return hashToken

  // 3. Try localStorage
  try {
    const localToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (localToken) return localToken
  } catch (e) {
    console.warn("Could not access localStorage:", e)
  }

  return null
}
