"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native"
import { useSupabase } from "../contexts/supabase-context"
import { useTheme } from "../contexts/theme-context"
import { SafeAreaView } from "react-native-safe-area-context"

const LoginScreen = ({ navigation }: any) => {
  const { signIn, signUp } = useSupabase()
  const { colors } = useTheme()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Additional signup form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [vehicleName, setVehicleName] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")

  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // Handle login
        const { error } = await signIn(email, password)
        if (error) throw error
        navigation.replace("Dashboard")
      } else {
        // Handle signup
        const userData = {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          vehicle_name: vehicleName,
          vehicle_type: vehicleType,
          vehicle_year: vehicleYear,
        }

        const { error } = await signUp(email, password, userData)
        if (error) throw error

        // Show success message but stay on login screen
        setError("Account created! Please check your email to verify your account.")
        setIsLogin(true)
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      marginTop: 5,
      textAlign: "center",
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: colors.text,
    },
    input: {
      backgroundColor: colors.muted,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonContainer: {
      marginTop: 10,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
    },
    buttonText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "bold",
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    switchText: {
      color: colors.mutedForeground,
    },
    switchButton: {
      marginLeft: 5,
    },
    switchButtonText: {
      color: colors.primary,
      fontWeight: "bold",
    },
    errorText: {
      color: colors.error,
      marginTop: 10,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Favicon-dark-TCRh0L4cFUo5bEkp6OVorSUlogaWFf.png",
                }}
                style={styles.logo}
              />
              <Text style={styles.title}>Geminize IO</Text>
              <Text style={styles.subtitle}>{isLogin ? "Sign in to your account" : "Create a new account"}</Text>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor={colors.mutedForeground}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor={colors.mutedForeground}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(123) 456-7890"
                    placeholderTextColor={colors.mutedForeground}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={styles.sectionTitle}>Vehicle Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Vehicle Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="My Jeep"
                    placeholderTextColor={colors.mutedForeground}
                    value={vehicleName}
                    onChangeText={setVehicleName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Vehicle Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jeep Wrangler"
                    placeholderTextColor={colors.mutedForeground}
                    value={vehicleType}
                    onChangeText={setVehicleType}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Vehicle Year</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2023"
                    placeholderTextColor={colors.mutedForeground}
                    value={vehicleYear}
                    onChangeText={setVehicleYear}
                    keyboardType="number-pad"
                  />
                </View>
              </>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={styles.buttonText}>{isLogin ? "Sign In" : "Create Account"}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>{isLogin ? "Don't have an account?" : "Already have an account?"}</Text>
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
              >
                <Text style={styles.switchButtonText}>{isLogin ? "Sign Up" : "Sign In"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginScreen

