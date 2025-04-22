export enum AccessoryType {
  LIGHT = "light",
  UTILITY = "utility",
  COMMUNICATION = "communication",
  SENSOR = "sensor",
  POWER = "power",
  GAUGE = "gauge",
  OBDII = "obd2", // Add the new OBD2 accessory type
  CHASELIGHT = "chaseLight",
  TURN_SIGNAL = "turn-signal",
  HAZARD_LIGHT = "hazard-light",
}

export const accessoryTypeNames: Record<AccessoryType, string> = {
  [AccessoryType.LIGHT]: "Light",
  [AccessoryType.UTILITY]: "Utility",
  [AccessoryType.COMMUNICATION]: "Communication",
  [AccessoryType.SENSOR]: "Sensor",
  [AccessoryType.POWER]: "Power",
  [AccessoryType.GAUGE]: "Gauge",
  [AccessoryType.OBDII]: "OBD2", // Add the name for OBD2
  [AccessoryType.CHASELIGHT]: "Chase Light",
  [AccessoryType.TURN_SIGNAL]: "Turn Signal",
  [AccessoryType.HAZARD_LIGHT]: "Hazard Light",
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
  [AccessoryType.TURN_SIGNAL]: "Turn Signal accessories with left and right indicators",
  [AccessoryType.HAZARD_LIGHT]: "Hazard Light accessories with simultaneous flashing",
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
  [AccessoryType.TURN_SIGNAL]: "navigation",
  [AccessoryType.HAZARD_LIGHT]: "alert-triangle",
}
