interface Device {
  accessoryID: string
  accessoryName: string
  accessoryType: string
  accessoryConnectionStatus: boolean
  isFavorite: boolean
}

const defaultDevices: Device[] = [
  {
    accessoryID: "D001",
    accessoryName: "Light Bar",
    accessoryType: "light",
    accessoryConnectionStatus: false,
    isFavorite: false,
  },
  {
    accessoryID: "D002",
    accessoryName: "Spot Lights",
    accessoryType: "light",
    accessoryConnectionStatus: false,
    isFavorite: false,
  },
  {
    accessoryID: "D003",
    accessoryName: "Rock Lights",
    accessoryType: "light",
    accessoryConnectionStatus: false,
    isFavorite: false,
  },
  {
    accessoryID: "D004",
    accessoryName: "Winch",
    accessoryType: "utility",
    accessoryConnectionStatus: false,
    isFavorite: false,
  },
]
