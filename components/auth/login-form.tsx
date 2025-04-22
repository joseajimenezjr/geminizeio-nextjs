"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUpUser } from "@/app/actions/auth"

interface SignUpFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  vehicleType: string
  vehicleName: string
  vehicleYear: string
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    vehicleType: "",
    vehicleName: "",
    vehicleYear: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // State to track if we're in registration mode
  const [isRegistering, setIsRegistering] = useState(false)

  // State to track if registration is allowed
  const [showRegistration, setShowRegistration] = useState(false)

  // Check if we're in the V0 preview environment
  const [isV0Environment, setIsV0Environment] = useState(false)

  // Check for register parameter in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const registerParam = searchParams.get("registration")
      setShowRegistration(registerParam === "true")

      // If register=true and mode=signup in the URL, show the signup form
      const modeParam = searchParams.get("mode")
      setIsRegistering(registerParam === "true" && modeParam === "signup")

      // Check if we're in the V0 environment
      setIsV0Environment(isInV0Preview())
    }
  }, [searchParams])

  // Check for existing session on component mount, but don't show loading state
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          return
        }

        if (session) {
          router.push("/control-center-v2")
          router.refresh()
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    checkSession()
  }, [supabase.auth, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage("Signing in...")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.session) {
        setMessage("Sign in successful! Redirecting...")
        router.push("/control-center-v2")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in")
      setMessage(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage("Creating your account...")
    setDebugInfo(null)

    try {
      // Validate required fields
      const requiredFields = ["email", "password", "firstName", "lastName", "phoneNumber", "vehicleName"] as const

      for (const field of requiredFields) {
        if (!signUpData[field]) {
          throw new Error(`${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`)
        }
      }

      // Update email in signUpData to match the email field
      const updatedSignUpData = {
        ...signUpData,
        email: signUpData.email || email,
      }

      console.log("Submitting signup data:", updatedSignUpData)
      const result = await signUpUser(updatedSignUpData)

      // Log the complete result for debugging
      console.log("Signup result:", result)

      if (!result.success) {
        console.error("Signup failed:", result.error)
        // Show more detailed debug info
        setDebugInfo(JSON.stringify(result, null, 2))
        throw new Error(result.error || "Failed to create account")
      }

      if (result.success) {
        // Log success details
        console.log("Signup successful:", result)

        setMessage("Account created! Check your email for the confirmation link.")

        // Reset the form
        setSignUpData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          vehicleType: "",
          vehicleName: "",
          vehicleYear: "",
        })

        // Show a message before redirecting to signin tab
        setMessage("Account created successfully! Redirecting to login page...")

        // Wait a moment before switching to the signin form
        setTimeout(() => {
          // Switch to the signin form
          setIsRegistering(false)

          // Pre-fill the email field for convenience
          setEmail(updatedSignUpData.email)

          // Clear the signup message after switching forms
          setMessage("Account created! You can now sign in with your credentials.")

          // If we have a redirect URL from the server, use it
          if (result.redirectUrl) {
            setTimeout(() => {
              router.push(result.redirectUrl)
            }, 1000)
          }
        }, 1500)
      }
    } catch (error: any) {
      console.error("Error in signup form:", error)
      setError(error.message || "An error occurred during sign up")
      setMessage(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignUpData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Toggle between sign in and sign up forms
  const toggleRegistration = () => {
    setIsRegistering(!isRegistering)
    // Update URL to reflect the current mode
    const params = new URLSearchParams(window.location.search)
    params.set("mode", isRegistering ? "signin" : "signup")

    // Use router.replace to update the URL without a full page reload
    router.replace(`/login?${params.toString()}`)

    // Clear any previous errors or messages
    setError(null)
    setMessage(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Favicon-dark-TCRh0L4cFUo5bEkp6OVorSUlogaWFf.png"
            alt="Geminize IO"
            width={64}
            height={64}
            className="mx-auto"
          />
        </div>
        <CardTitle>Welcome to Geminize IO</CardTitle>
        <CardDescription>Manage your off-road accessories digitally</CardDescription>
      </CardHeader>

      {!isRegistering ? (
        // Sign In Form
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Only show the register link if registration is allowed */}
            {showRegistration && (
              <div className="text-center text-sm flex flex-col">
                <span>Don't have an account?</span>
                <button
                  type="button"
                  onClick={toggleRegistration}
                  className="text-red-500 hover:text-red-400 focus:outline-none mt-1"
                >
                  Register now
                </button>
              </div>
            )}
          </CardFooter>
        </form>
      ) : (
        // Sign Up Form
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4 pt-4">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Account Information</h3>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={signUpData.email}
                  onChange={handleSignUpInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={signUpData.password}
                  onChange={handleSignUpInputChange}
                  required
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={signUpData.firstName}
                    onChange={handleSignUpInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={signUpData.lastName}
                    onChange={handleSignUpInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={signUpData.phoneNumber}
                  onChange={handleSignUpInputChange}
                  required
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Vehicle Information</h3>
              <div className="space-y-2">
                <Label htmlFor="vehicleName">Vehicle Name</Label>
                <Input
                  id="vehicleName"
                  name="vehicleName"
                  placeholder="My Jeep"
                  value={signUpData.vehicleName}
                  onChange={handleSignUpInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  name="vehicleType"
                  placeholder="Jeep Wrangler"
                  value={signUpData.vehicleType}
                  onChange={handleSignUpInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Vehicle Year</Label>
                <Input
                  id="vehicleYear"
                  name="vehicleYear"
                  placeholder="2023"
                  value={signUpData.vehicleYear}
                  onChange={handleSignUpInputChange}
                />
              </div>
            </div>

            {error && (
              <Alert variant={error.includes("Check your email") ? "default" : "destructive"}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                <pre>{debugInfo}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center text-sm flex flex-col">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={toggleRegistration}
                className="text-red-500 hover:text-red-400 focus:outline-none mt-1"
              >
                Sign in
              </button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}

function isInV0Preview() {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return false

  // Check for V0-specific environment indicators
  // This could be refined based on specific V0 environment characteristics
  const isV0 =
    window.location.hostname.includes("v0.dev") ||
    window.location.hostname.includes("vercel-v0") ||
    window.location.search.includes("v0preview=true")

  return isV0
}
