import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Helper function to check if we're in the V0 environment
function isInV0Environment(req: NextRequest): boolean {
  const hostname = req.headers.get("host") || ""
  const url = req.url || ""

  return hostname.includes("v0.dev") || hostname.includes("vercel-v0") || url.includes("v0preview=true")
}

export async function middleware(req: NextRequest) {
  try {
    // Skip middleware for auth callback, preview page, and static files
    if (
      req.nextUrl.pathname.startsWith("/auth/callback") ||
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/favicon.ico")
    ) {
      return NextResponse.next()
    }

    // Create a response object that we'll modify and return
    const res = NextResponse.next()

    // Check for preview mode in URL query parameter
    const isPreviewMode = req.nextUrl.searchParams.has("preview_mode") && isInV0Environment(req)

    // If in preview mode, allow access to all routes
    if (isPreviewMode) {
      console.log("Middleware: Preview mode detected, allowing access")
      return res
    }

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Define protected routes
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/control-center") ||
      req.nextUrl.pathname.startsWith("/control-center-retired") ||
      req.nextUrl.pathname.startsWith("/accessories") ||
      req.nextUrl.pathname.startsWith("/settings") ||
      req.nextUrl.pathname.startsWith("/shop")

    // Define auth routes (login/signup)
    const isAuthRoute = req.nextUrl.pathname === "/login"

    // Get the session - but don't throw errors
    const { data } = await supabase.auth.getSession()
    const session = data?.session

    // If user is signed in and tries to access auth route, redirect to control center
    if (isAuthRoute && session) {
      console.log("Redirecting from auth route to control center")
      return NextResponse.redirect(new URL("/control-center", req.url))
    }

    // If user is not signed in and tries to access protected route, redirect to login
    if (isProtectedRoute && !session && !isPreviewMode) {
      console.log("Redirecting to login page")
      return NextResponse.redirect(new URL("/login", req.url))
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
