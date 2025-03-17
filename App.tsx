import type React from "react"
import { SafeAreaView, StatusBar, StyleSheet } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SupabaseProvider } from "./src/contexts/supabase-context"
import { BluetoothProvider } from "./src/contexts/bluetooth-context"
import { AccessoriesProvider } from "./src/contexts/accessories-context"
import { ThemeProvider } from "./src/contexts/theme-context"
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import AccessoriesScreen from "./src/screens/AccessoriesScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import NewAccessoryScreen from "./src/screens/NewAccessoryScreen"

const Stack = createNativeStackNavigator()

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SupabaseProvider>
        <ThemeProvider>
          <BluetoothProvider>
            <AccessoriesProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Accessories" component={AccessoriesScreen} options={{ title: "Accessories" }} />
                  <Stack.Screen
                    name="NewAccessory"
                    component={NewAccessoryScreen}
                    options={{ title: "Add New Accessory" }}
                  />
                  <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
                </Stack.Navigator>
              </NavigationContainer>
            </AccessoriesProvider>
          </BluetoothProvider>
        </ThemeProvider>
      </SupabaseProvider>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default App

