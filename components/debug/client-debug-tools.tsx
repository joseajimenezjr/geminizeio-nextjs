"use client"

import { useDebugMode } from "@/hooks/use-debug-mode"
import { TokenRetriever } from "@/components/debug/token-retriever"
import { SessionTokenGetter } from "@/components/debug/session-token-getter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ClientDebugTools() {
  const isDebugMode = useDebugMode()

  if (!isDebugMode) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TokenRetriever />
        <SessionTokenGetter />
      </CardContent>
    </Card>
  )
}

