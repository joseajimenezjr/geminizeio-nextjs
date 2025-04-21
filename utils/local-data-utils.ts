// Local data utility functions to update userData without making additional API calls

/**
 * Updates the accessory status in the local userData state
 * @param userData Current user data
 * @param accessoryId ID of the accessory to update
 * @param isOn New status of the accessory
 * @returns Updated user data object
 */
export function updateLocalAccessoryStatus(userData: any, accessoryId: string, isOn: boolean): any {
  if (!userData || typeof userData !== "object" || !userData.accessories || !Array.isArray(userData.accessories)) {
    console.warn("Invalid userData format. Returning original userData.")
    return userData
  }

  // Create a deep copy of userData to avoid mutation
  const updatedUserData = JSON.parse(JSON.stringify(userData))

  // Update the specific accessory in the accessories array
  updatedUserData.accessories = updatedUserData.accessories.map((accessory: any) => {
    if (accessory.accessoryID === accessoryId) {
      return {
        ...accessory,
        accessoryConnectionStatus: isOn,
      }
    }
    return accessory
  })

  return updatedUserData
}

/**
 * Updates an accessory attribute in the local userData state
 * @param userData Current user data
 * @param accessoryId ID of the accessory to update
 * @param attributeName Name of the attribute to update
 * @param value New value for the attribute
 * @returns Updated user data object
 */
export function updateLocalAccessoryAttribute(
  userData: any,
  accessoryId: string,
  attributeName: string,
  value: any,
): any {
  if (!userData || !userData.accessories) {
    return userData
  }

  // Create a deep copy of userData to avoid mutation
  const updatedUserData = JSON.parse(JSON.stringify(userData))

  // Update the specific accessory in the accessories array
  updatedUserData.accessories = updatedUserData.accessories.map((accessory: any) => {
    if (accessory.accessoryID === accessoryId) {
      return {
        ...accessory,
        [attributeName]: value,
      }
    }
    return accessory
  })

  return updatedUserData
}
