// This utility helps identify problematic imports at runtime
export function checkReactImports() {
  if (typeof window !== "undefined") {
    console.warn(
      "If you are seeing build errors related to React imports, " +
        "check for imports of experimental features like useEffectEvent. " +
        "Use the polyfill from utils/react-polyfills.ts instead.",
    )
  }
}
