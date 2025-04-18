/**
 * Adds preview mode parameter to a URL if needed
 */
export function addPreviewModeToUrl(url: string): string {
  // Check if we're in preview mode
  const isPreviewMode = checkIfPreviewMode()

  if (isPreviewMode) {
    // Add preview_mode=true to the URL
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}preview_mode=true`
  }

  return url
}

/**
 * Checks if the current session is in preview mode
 */
export function checkIfPreviewMode(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const previewParam = urlParams.get("preview_mode")

  // Check cookies
  const previewCookie = document.cookie.includes("preview_mode=true")

  // Check localStorage/window object
  const hasPreviewAuth = !!window.__PREVIEW_AUTH?.token

  return !!(previewParam || previewCookie || hasPreviewAuth)
}

/**
 * Sets a custom header for fetch requests in preview mode
 */
export function getPreviewModeHeaders(): HeadersInit {
  const headers: HeadersInit = {}

  if (checkIfPreviewMode()) {
    headers["X-Preview-Mode"] = "true"

    // Add Authorization header if token is available
    if (typeof window !== "undefined" && window.__PREVIEW_AUTH?.token) {
      headers["Authorization"] = `Bearer ${window.__PREVIEW_AUTH.token}`
    }
  }

  return headers
}
