"use client"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { useTheme } from "../contexts/theme-context"
import { useBluetooth } from "../contexts/bluetooth-context"

const BluetoothCard = () => {
  const { colors } = useTheme()
  const { isConnected, isConnecting, connectToDevice, disconnectDevice, scanForDevices } = useBluetooth()

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: isConnected ? colors.primary + "40" : colors.border,
    },
    cardTitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    cardValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: isConnected ? colors.primary : colors.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: isConnected ? colors.muted : colors.primary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: isConnected ? colors.text : colors.primaryForeground,
      fontSize: 12,
      fontWeight: "bold",
      marginLeft: 4,
    },
  })

  const handlePress = () => {
    if (isConnected) {
      disconnectDevice()
    } else {
      scanForDevices().then(() => {
        connectToDevice("YOUR_DEVICE_ID") // You'll need to implement device selection
      })
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>BLUETOOTH</Text>
      <Text style={styles.cardValue}>{isConnected ? "Connected" : "Not Connected"}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={isConnecting}>
        {isConnecting ? (
          <ActivityIndicator size="small" color={colors.primaryForeground} />
        ) : (
          <>
            <Icon
              name={isConnected ? "bluetooth-off" : "bluetooth"}
              size={12}
              color={isConnected ? colors.text : colors.primaryForeground}
            />
            <Text style={styles.buttonText}>{isConnected ? "Disconnect" : "Connect"}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default BluetoothCard

