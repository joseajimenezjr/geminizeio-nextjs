"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { useTheme } from "../contexts/theme-context"
import { useAccessories } from "../contexts/accessories-context"
import { useBluetooth } from "../contexts/bluetooth-context"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/Feather"
import AccessoryCard from "../components/AccessoryCard"
import BluetoothCard from "../components/BluetoothCard"
import BottomTabBar from "../components/BottomTabBar"

const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme()
  const { accessories, refreshAccessories, isLoading } = useAccessories()
  const { isConnected } = useBluetooth()
  const [refreshing, setRefreshing] = useState(false)

  // Calculate active accessories count
  const activeAccessories = accessories.filter((acc) => acc.accessoryConnectionStatus).length

  // Filter favorite accessories
  const favoriteAccessories = accessories.filter((acc) => acc.isFavorite)

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await refreshAccessories()
    setRefreshing(false)
  }

  useEffect(() => {
    refreshAccessories()
  }, [])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    cardsContainer: {
      flexDirection: "row",
      marginBottom: 24,
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 4,
    },
    cardValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    accessoriesContainer: {
      marginBottom: 24,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.muted,
      borderRadius: 12,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 12,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 12,
    },
    addButtonText: {
      color: colors.primaryForeground,
      fontWeight: "bold",
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Control your accessories</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Cards */}
        <View style={styles.cardsContainer}>
          {/* Active Accessories Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACTIVE ACCESSORIES</Text>
            <Text style={styles.cardValue}>
              {activeAccessories}{" "}
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>/ {accessories.length}</Text>
            </Text>
          </View>

          {/* Bluetooth Card */}
          <BluetoothCard />
        </View>

        {/* Favorites Section */}
        <Text style={styles.sectionTitle}>Favorites</Text>
        <View style={styles.accessoriesContainer}>
          {favoriteAccessories.length > 0 ? (
            favoriteAccessories.map((accessory) => (
              <AccessoryCard
                key={accessory.accessoryID}
                accessory={accessory}
                onPress={() => navigation.navigate("AccessoryDetails", { accessoryId: accessory.accessoryID })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="star" size={32} color={colors.mutedForeground} />
              <Text style={styles.emptyStateText}>You haven't added any favorites yet.</Text>
            </View>
          )}
        </View>

        {/* Recent Accessories Section */}
        <Text style={styles.sectionTitle}>Recent Accessories</Text>
        <View style={styles.accessoriesContainer}>
          {accessories.length > 0 ? (
            accessories
              .slice(0, 3)
              .map((accessory) => (
                <AccessoryCard
                  key={accessory.accessoryID}
                  accessory={accessory}
                  onPress={() => navigation.navigate("AccessoryDetails", { accessoryId: accessory.accessoryID })}
                />
              ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="package" size={32} color={colors.mutedForeground} />
              <Text style={styles.emptyStateText}>You haven't added any accessories yet.</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("NewAccessory")}>
                <Text style={styles.addButtonText}>Add Accessory</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomTabBar navigation={navigation} currentRoute="Dashboard" />
    </SafeAreaView>
  )
}

export default DashboardScreen

