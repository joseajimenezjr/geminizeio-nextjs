"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { useTheme } from "../contexts/theme-context"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface BottomTabBarProps {
  navigation: any
  currentRoute: string
}

const BottomTabBar = ({ navigation, currentRoute }: BottomTabBarProps) => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const tabs = [
    { name: "Dashboard", icon: "home" },
    { name: "Accessories", icon: "package" },
    { name: "Settings", icon: "settings" },
  ]

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
    },
    activeTab: {
      color: colors.primary,
    },
    inactiveTab: {
      color: colors.mutedForeground,
    },
    tabText: {
      fontSize: 12,
      marginTop: 4,
    },
  })

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.name
        const textStyle = [styles.tabText, isActive ? styles.activeTab : styles.inactiveTab]
        const iconStyle = isActive ? styles.activeTab : styles.inactiveTab

        return (
          <TouchableOpacity key={tab.name} style={styles.tab} onPress={() => navigation.navigate(tab.name)}>
            <Icon name={tab.icon} size={20} color={iconStyle.color} />
            <Text style={textStyle}>{tab.name}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default BottomTabBar

