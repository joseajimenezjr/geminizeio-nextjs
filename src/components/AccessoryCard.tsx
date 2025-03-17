"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { useTheme } from "../contexts/theme-context"
import type { Accessory } from "../contexts/accessories-context"
import ToggleSwitch from "./ToggleSwitch"

interface AccessoryCardProps {
  accessory: Accessory
  onPress: () => void
}

const AccessoryCard = ({ accessory, onPress }: AccessoryCardProps) => {
  const { colors } = useTheme()

  // Get the appropriate icon based on accessory type
  const getAccessoryIcon = () => {
    const type = accessory.accessoryType.toLowerCase()
    if (type.includes("light")) return "zap"
    if (type.includes("utility")) return "tool"
    if (type.includes("communication")) return "radio"
    if (type.includes("sensor")) return "thermometer"
    if (type.includes("power")) return "battery"
    return "box"
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: accessory.accessoryConnectionStatus ? colors.primary + "40" : colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: accessory.accessoryConnectionStatus ? colors.primary + "20" : colors.muted,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    icon: {
      color: accessory.accessoryConnectionStatus ? colors.primary : colors.mutedForeground,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    location: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    status: {
      fontSize: 14,
      color: accessory.accessoryConnectionStatus ? colors.primary : colors.mutedForeground,
    },
    favorite: {
      position: "absolute",
      top: 12,
      right: 12,
      color: accessory.isFavorite ? "#F59E0B" : colors.mutedForeground,
    },
  })

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {accessory.isFavorite && <Icon name="star" size={16} style={styles.favorite} />}

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Icon name={getAccessoryIcon()} size={20} style={styles.icon} />
          </View>
          <View>
            <Text style={styles.title}>{accessory.accessoryName}</Text>
            <Text style={styles.location}>{accessory.location || "No location set"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.status}>{accessory.accessoryConnectionStatus ? "Connected" : "Not Connected"}</Text>
        <ToggleSwitch accessoryId={accessory.accessoryID} initialValue={accessory.accessoryConnectionStatus} />
      </View>
    </TouchableOpacity>
  )
}

export default AccessoryCard

