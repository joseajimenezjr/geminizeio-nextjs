import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        // Redirect to error page
        return NextResponse.redirect(new URL("/auth/error", request.url))
      }

      // URL to redirect to after sign in process completes
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
      // Redirect to error page
      return NextResponse.redirect(new URL("/auth/error", request.url))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
