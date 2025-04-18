"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bug, X } from "lucide-react"

interface DebugContainerProps {
  children: React.ReactNode
}

export function DebugContainer({ children }: DebugContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-8 border border-amber-500 rounded-lg overflow-hidden bg-background">
      <div className="bg-amber-500/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-600 font-medium">
          <Bug className="h-4 w-4" />
          <span>Debug Tools</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
        >
          {isExpanded ? <X className="h-4 w-4" /> : "Expand"}
        </Button>
      </div>

      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  )
}
