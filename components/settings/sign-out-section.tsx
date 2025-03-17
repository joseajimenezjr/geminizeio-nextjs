"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function SignOutSection() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDataWipeDialogOpen, setIsDataWipeDialogOpen] = useState(false)
  const [isWipingData, setIsWipingData] = useState(false)

  // Regular sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while signing out",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
      setIsConfirmDialogOpen(false)
    }
  }

  // Complete data wipe
  const handleDataWipe = async () => {
    setIsWipingData(true)
    try {
      // 1. Sign out of Supabase
      await supabase.auth.signOut()

      // 2. Clear all localStorage items
      localStorage.clear()

      // 3. Clear all cookies
      const cookies = document.cookie.split(";")
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }

      // 4. Show success message
      toast({
        title: "All data cleared",
        description: "You have been signed out and all local data has been removed",
      })

      // 5. Redirect to login page
      setTimeout(() => {
        window.location.href = "/" // Use window.location for a full page refresh
      }, 1000)
    } catch (error: any) {
      console.error("Error wiping data:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while clearing data",
        variant: "destructive",
      })
    } finally {
      setIsWipingData(false)
      setIsDataWipeDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="border-red-100 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400">Account Actions</CardTitle>
          <CardDescription>Sign out or clear all application data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sign Out</h3>
            <p className="text-sm text-muted-foreground">
              Sign out of your account on this device. Your data will remain stored for your next login.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Clear All Data</h3>
            <p className="text-sm text-muted-foreground">
              Sign out and remove all locally stored data including tokens, preferences, and cached information.
            </p>
            <Alert
              variant="destructive"
              className="mt-2 bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900/50"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will completely remove all application data from this browser. You'll need to sign in again to use
                the app.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsConfirmDialogOpen(true)}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => setIsDataWipeDialogOpen(true)}
            disabled={isWipingData}
          >
            {isWipingData ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing Data...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>Are you sure you want to sign out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isSigningOut}>
              Cancel
            </Button>
            <Button onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Out...
                </>
              ) : (
                "Sign Out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Wipe Confirmation Dialog */}
      <Dialog open={isDataWipeDialogOpen} onOpenChange={setIsDataWipeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data</DialogTitle>
            <DialogDescription>
              This will sign you out and remove all application data from this browser. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You will need to sign in again to use the application. Any unsaved changes will be lost.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDataWipeDialogOpen(false)} disabled={isWipingData}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDataWipe} disabled={isWipingData}>
              {isWipingData ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing Data...
                </>
              ) : (
                "Clear All Data"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

