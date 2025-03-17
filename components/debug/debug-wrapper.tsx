"use client"

import { useDebugMode } from "@/hooks/use-debug-mode"
import { DebugContainer } from "./debug-container"
import { Card, CardContent } from "@/components/ui/card"
import { SessionChecker } from "./session-checker"
import { DatabaseChecker } from "./database-checker"

export function DebugWrapper({ userData }: { userData: any }) {
  const isDebugMode = useDebugMode()

  if (!isDebugMode) return null

  return (
    <DebugContainer>
      <SessionChecker />
      <DatabaseChecker />

      {/* Debug Data Display */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          <details>
            <summary className="cursor-pointer font-medium">User Data</summary>
            <pre className="mt-2 bg-muted p-2 rounded-md overflow-auto text-xs">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </DebugContainer>
  )
}

