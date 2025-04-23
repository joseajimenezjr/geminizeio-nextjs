export enum AccessoryType {
  LIGHT = "light",
  UTILITY = "utility",
  COMMUNICATION = "communication",
  SENSOR = "sensor",
  POWER = "power",
  GAUGE = "gauge",
  OBDII = "obd2",
  CHASELIGHT = "chaseLight",
  TURNSIGNAL = "turnSignal", // Add the new TURN_SIGNAL accessory type
}

export const accessoryTypeNames: Record<AccessoryType, string> = {
  [AccessoryType.LIGHT]: "Light",
  [AccessoryType.UTILITY]: "Utility",
  [AccessoryType.COMMUNICATION]: "Communication",
  [AccessoryType.SENSOR]: "Sensor",
  [AccessoryType.POWER]: "Power",
  [AccessoryType.GAUGE]: "Gauge",
  [AccessoryType.OBDII]: "OBD2",
  [AccessoryType.CHASELIGHT]: "Chase Light",
  [AccessoryType.TURNSIGNAL]: "Turn Signal", // Add the name for TURN_SIGNAL
}

export const accessoryTypeDescriptions: Record<AccessoryType, string> = {
  [AccessoryType.LIGHT]: "Light accessories like light bars, spot lights, etc.",
  [AccessoryType.UTILITY]: "Utility accessories like winches, air compressors, etc.",
  [AccessoryType.COMMUNICATION]: "Communication accessories like radios, intercoms, etc.",
  [AccessoryType.SENSOR]: "Sensor accessories like temperature sensors, pressure sensors, etc.",
  [AccessoryType.POWER]: "Power accessories like power inverters, battery monitors, etc.",
  [AccessoryType.GAUGE]: "Gauge accessories like fuel gauges, temperature gauges, etc.",
  [AccessoryType.OBDII]: "OBD2 accessories like speedometers, RPM gauges, etc.", // Add description for OBD2
  [AccessoryType.CHASELIGHT]: "Chase Light accessories with strobe patterns",
  [AccessoryType.TURNSIGNAL]: "Turn Signal accessories with left and right indicators", // Add description for TURN_SIGNAL
}

export const accessoryTypeIcons: Record<AccessoryType, string> = {
  [AccessoryType.LIGHT]: "lightbulb",
  [AccessoryType.UTILITY]: "tool",
  [AccessoryType.COMMUNICATION]: "radio",
  [AccessoryType.SENSOR]: "activity",
  [AccessoryType.POWER]: "zap",
  [AccessoryType.GAUGE]: "gauge",
  [AccessoryType.OBDII]: "speedometer", // Add icon for OBD2
  [AccessoryType.CHASELIGHT]: "lightbulb",
  [AccessoryType.TURNSIGNAL]: "arrow-right", // Add icon for TURN_SIGNAL
}
