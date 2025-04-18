"use client"

import { useCallback, useRef } from "react"

/**
 * A custom implementation of the experimental React useEffectEvent hook
 * This provides the same functionality using stable React hooks
 *
 * @param callback The function to be called
 * @returns A stable function reference that always calls the latest callback
 */
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  // Update the ref whenever the callback changes
  callbackRef.current = callback

  // Return a stable function that calls the latest callback
  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return callbackRef.current(...args)
  }, []) as T
}
