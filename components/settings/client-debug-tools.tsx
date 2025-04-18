"use client"

import { useDebugMode } from "@/hooks/use-debug-mode"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SessionTokenGetter } from "@/components/debug/session-token-getter"
import { TokenRetriever } from "@/components/debug/token-retriever"

export function ClientDebugTools() {
  const isDebugMode = useDebugMode()

  if (!isDebugMode) return null

  return (
    <div>
      <CardHeader>
        <CardTitle>Developer Tools</CardTitle>
        <CardDescription>Tools for developers and preview mode</CardDescription>
      </CardHeader>

      {/* Add the session token getter first - this is the most reliable method */}
      <SessionTokenGetter />

      {/* Keep the original token retriever as a fallback */}
      <TokenRetriever />
    </div>
  )
}
