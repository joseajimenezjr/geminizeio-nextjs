/**
 * Helper function to add auth token to server action requests
 * This is needed because server actions don't automatically include headers
 */
export async function withAuthToken<T>(action: (formData: FormData) => Promise<T>, formData: FormData): Promise<T> {
  // Get the auth token
  let token = null

  // Try to get token from window object first
  if (typeof window !== "undefined" && window.__PREVIEW_AUTH?.token) {
    token = window.__PREVIEW_AUTH.token
  }
  // Fallback to localStorage
  else {
    try {
      token = localStorage.getItem("supabase_access_token")
    } catch (e) {
      console.warn("Could not access localStorage:", e)
    }
  }

  // Add the token to the form data if available
  if (token) {
    formData.append("__auth_token", token)
  }

  // Call the server action with the enhanced form data
  return action(formData)
}
