"use client"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Prepare headers
  const headers = new Headers(options.headers || {})

  // Try to get token from window object first
  let token = null
  if (typeof window !== "undefined" && window.__PREVIEW_AUTH?.token) {
    token = window.__PREVIEW_AUTH.token
    console.log("Using token from window.__PREVIEW_AUTH")
  }
  // Fallback to localStorage
  else {
    try {
      token = localStorage.getItem("supabase_access_token")
      if (token) console.log("Using token from localStorage")
    } catch (e) {
      console.warn("Could not access localStorage:", e)
    }
  }

  // Add Authorization header if token exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Merge with existing options
  const fetchOptions = {
    ...options,
    headers,
  }

  return fetch(url, fetchOptions)
}
