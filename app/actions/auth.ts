"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  vehicleType: string
  vehicleName: string
  vehicleYear: string
  membershipPlanId?: string
}

export async function signUpUser(data: SignUpData) {
  const supabase = createServerActionClient({ cookies })

  try {
    console.log("Starting signup process for:", data.email)

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `https://geminize.io/auth/callback`,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          vehicle_type: data.vehicleType,
          vehicle_name: data.vehicleName,
          vehicle_year: data.vehicleYear,
        },
      },
    })

    if (authError) {
      console.error("Auth signup error:", authError)
      throw authError
    }

    if (!authData.user) {
      console.error("No user returned from sign up")
      throw new Error("No user returned from sign up")
    }

    console.log("Auth user created successfully with ID:", authData.user.id)

    // Add a delay to ensure auth user is fully created
    console.log("Waiting 1 second before creating profile...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Log the profile data we're about to insert - using snake_case to match DB schema
    const profileData = {
      id: authData.user.id,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber,
      vehicle_name: data.vehicleName,
      vehicle_type: data.vehicleType,
      vehicle_year: data.vehicleYear,
      accessories: [],
      group_ids: [],
      membership_plan_id: data.membershipPlanId || "free",
      accessoryLimit: 4,
    }

    console.log("Attempting to insert profile data:", JSON.stringify(profileData, null, 2))

    // Explicitly create the profile in the Profiles table
    const profileResult = await supabase.from("Profiles").insert(profileData)
    const { error: profileError } = profileResult

    // Log the complete profile insert result
    console.log("Profile insert result:", JSON.stringify(profileResult, null, 2))

    if (profileError) {
      console.error("Error creating profile:", profileError)
      console.error("Error details:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      })
      // We don't throw here because the auth user was created successfully
      // The trigger might still create the profile later
      console.log("Relying on database trigger as fallback for profile creation")
    } else {
      console.log("Profile created successfully for user:", authData.user.id)
    }

    // Let's also check if the profile was actually created
    const { data: checkProfile, error: checkError } = await supabase
      .from("Profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (checkError) {
      console.error("Error checking if profile was created:", checkError)
    } else {
      console.log("Profile check result:", JSON.stringify(checkProfile, null, 2))
    }

    revalidatePath("/")
    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
      redirectUrl: "/", // Add this line to redirect to the login page
      debug: {
        profileInsert: profileResult,
        profileCheck: checkProfile || null,
      },
    }
  } catch (error: any) {
    console.error("Sign up process failed:", error)
    return {
      success: false,
      error: error.message || "An error occurred during sign up",
      debug: error,
    }
  }
}
