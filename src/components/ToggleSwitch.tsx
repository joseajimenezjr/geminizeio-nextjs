"use client"

import { useState, useEffect } from "react"
import { View, Switch, ActivityIndicator, StyleSheet } from "react-native"
import { useAccessories } from "../contexts/accessories-context"
import { useTheme } from "../contexts/theme-context"

interface ToggleSwitchProps {
  accessoryId: string
  initialValue: boolean
}

const ToggleSwitch = ({ accessoryId, initialValue }: ToggleSwitchProps) => {
  const [isEnabled, setIsEnabled] = useState(initialValue)
  const { toggleAccessoryStatus, isLoading } = useAccessories()
  const { colors } = useTheme()

  // Update local state when prop changes
  useEffect(() => {
    setIsEnabled(initialValue)
  }, [initialValue])

  const loading = isLoading[`status-${accessoryId}`] || false

  const toggleSwitch = async () => {
    if (loading) return

    const newValue = !isEnabled
    setIsEnabled(newValue)

    const success = await toggleAccessoryStatus(accessoryId, newValue)

    // Revert if failed
    if (!success) {
      setIsEnabled(!newValue)
    }
  }

  const styles = StyleSheet.create({
    container: {
      position: "relative",
    },
    loader: {
      position: "absolute",
      right: 0,
      alignItems: "center",
      justifyContent: "center",
    },
  })

  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: colors.muted, true: colors.primary + "70" }}
        thumbColor={isEnabled ? colors.primary : colors.mutedForeground}
        ios_backgroundColor={colors.muted}
        onValueChange={toggleSwitch}
        value={isEnabled}
        disabled={loading}
      />
      {loading && (
        <View style={[styles.loader, { width: 40, height: 40 }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  )
}

export default ToggleSwitch

