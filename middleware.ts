import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    // Skip middleware for auth callback, preview page, and static files
    if (
      req.nextUrl.pathname.startsWith("/auth/callback") ||
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/favicon.ico") ||
      req.nextUrl.pathname === "/preview" // Allow access to preview page
    ) {
      return NextResponse.next()
    }

    // Create a response object that we'll modify and return
    const res = NextResponse.next()

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Define protected routes
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/accessories") ||
      req.nextUrl.pathname.startsWith("/settings") ||
      req.nextUrl.pathname.startsWith("/shop")

    // Define auth routes (login/signup)
    const isAuthRoute = req.nextUrl.pathname === "/"

    // Get the session - but don't throw errors
    const { data } = await supabase.auth.getSession()
    const session = data?.session

    // Check for preview mode cookie
    const previewMode = req.cookies.get("preview_mode")?.value === "true"

    // Check for token in request headers (for API routes)
    const authHeader = req.headers.get("Authorization")
    const hasAuthHeader = authHeader && authHeader.startsWith("Bearer ")

    if (session || previewMode || hasAuthHeader) {
      // If user is signed in and tries to access auth route, redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      // If user is signed in and accessing protected route, allow access
      return res
    }

    // If user is not signed in and tries to access protected route, redirect to login
    if (isProtectedRoute) {
      // Redirect to preview mode instead of login for better experience
      return NextResponse.redirect(new URL("/preview", req.url))
    }

    // Allow access to public routes
    return res
  } catch (error) {
    console.error("Error in middleware:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

