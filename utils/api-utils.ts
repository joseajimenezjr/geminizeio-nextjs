/**
 * Enhanced fetch function that automatically includes auth headers
 * when in preview mode
 */
export async function fetchWithAuth<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  // Prepare headers
  const headers = new Headers(options.headers || {})

  // Add preview_mode parameter to URL if needed
  let fetchUrl = url
  if (typeof window !== "undefined") {
    const currentUrl = new URL(window.location.href)
    if (currentUrl.searchParams.has("preview_mode") && !url.includes("preview_mode=")) {
      const urlObj = new URL(url, window.location.origin)
      urlObj.searchParams.set("preview_mode", "true")
      fetchUrl = urlObj.toString()
    }
  }

  // Add auth header if token exists
  let token = null
  if (typeof window !== "undefined") {
    // Try to get token from window object first
    if (window.__PREVIEW_AUTH?.token) {
      token = window.__PREVIEW_AUTH.token
    }
    // Fallback to URL hash
    else {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      token = params.get("token")
    }
    // Fallback to localStorage
    if (!token) {
      try {
        token = localStorage.getItem("supabase_access_token")
      } catch (e) {
        console.warn("Could not access localStorage:", e)
      }
    }
  }

  // Add Authorization header if token exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Perform the fetch
  try {
    console.log(`Fetching from ${fetchUrl}...`)
    const response = await fetch(fetchUrl, {
      ...options,
      headers,
    })

    // Handle response
    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      let errorMessage = `Request failed with status ${response.status}`

      if (contentType?.includes("application/json")) {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      }

      throw new Error(errorMessage)
    }

    // Parse response
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return await response.json()
    }

    return response.text() as unknown as T
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}
