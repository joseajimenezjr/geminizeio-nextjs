import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

// Create a simple loading component
function LoginLoading() {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">Loading...</div>
}

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/control-center-v2")
    }
  } catch (error) {
    console.error("Error checking session:", error)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <Suspense fallback={<LoginLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
