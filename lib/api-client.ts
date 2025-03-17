"use client"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from localStorage if available
  const token = localStorage.getItem("supabase_access_token")

  // Prepare headers
  const headers = new Headers(options.headers || {})

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

