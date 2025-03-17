"use client"

import { Card, CardContent } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Dynamically import the BluetoothConnectionCard component with no SSR
const BluetoothConnectionCard = dynamic(() => import("@/components/dashboard/bluetooth-connection-card"), {
  ssr: false,
  loading: () => (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-none shadow-md h-full">
      <CardContent className="p-4 flex items-center justify-between h-full">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">BLUETOOTH CONNECTION</p>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
        <div className="h-8 w-24 bg-muted/50 rounded-md animate-pulse"></div>
      </CardContent>
    </Card>
  ),
})

export function BluetoothCardWrapper() {
  return <BluetoothConnectionCard />
}

