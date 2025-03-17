"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [checkingSession, setCheckingSession] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          setCheckingSession(false)
          return
        }

        if (session) {
          router.push("/dashboard")
          router.refresh()
        } else {
          setCheckingSession(false)
        }
      } catch (error) {
        setCheckingSession(false)
      }
    }

    const timeoutId = setTimeout(() => {
      setCheckingSession(false)
    }, 5000)

    checkSession()

    return () => clearTimeout(timeoutId)
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
        router.push("/dashboard")
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

      if (!result.success) {
        console.error("Signup failed:", result.error)
        setDebugInfo(JSON.stringify(result, null, 2))
        throw new Error(result.error || "Failed to create account")
      }

      setMessage("Account created! Check your email for the confirmation link.")
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

  if (checkingSession) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Favicon-dark-TCRh0L4cFUo5bEkp6OVorSUlogaWFf.png"
            alt="Geminize IO"
            width={64}
            height={64}
            className="mx-auto"
          />
          <p className="text-center">Checking authentication status...</p>
        </CardContent>
      </Card>
    )
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
      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
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
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
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
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

