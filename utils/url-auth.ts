/**
 * Utility functions for URL-based authentication
 */

// Extract token from URL hash
export function getTokenFromHash(): string | null {
  if (typeof window === "undefined") return null

  const hash = window.location.hash.substring(1) // Remove the # character
  const params = new URLSearchParams(hash)
  return params.get("token")
}

// Extract email from URL hash
export function getEmailFromHash(): string | null {
  if (typeof window === "undefined") return null

  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  return params.get("email")
}

// Add token to URL for navigation
export function addAuthToUrl(url: string, token: string, email?: string): string {
  // Create URL object to handle query parameters properly
  const urlObj = new URL(url, window.location.origin)

  // Add preview_mode parameter
  urlObj.searchParams.set("preview_mode", "true")

  // Create hash with token and email
  let hash = `token=${encodeURIComponent(token)}`
  if (email) {
    hash += `&email=${encodeURIComponent(email)}`
  }

  // Set the hash
  urlObj.hash = hash

  return urlObj.toString()
}

// Check if URL has preview mode
export function isPreviewModeUrl(): boolean {
  if (typeof window === "undefined") return false

  // Check for preview_mode parameter
  const urlParams = new URLSearchParams(window.location.search)
  const hasPreviewParam = urlParams.has("preview_mode")

  // Check for token in hash
  const hasToken = !!getTokenFromHash()

  return hasPreviewParam && hasToken
}
