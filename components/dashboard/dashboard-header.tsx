"use client"

import { useState } from "react"
import { Plus, ChevronDown, Car, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { AddDeviceFlow } from "@/components/add-device/add-device-flow"
import { BluetoothNavButton } from "@/components/layout/bluetooth-nav-button"
import { VoiceControl } from "@/components/voice-control/voice-control"

interface DashboardHeaderProps {
  vehicleName: string
  vehicleType: string
  showFavorites: boolean
}

export function DashboardHeader({ vehicleName, vehicleType, showFavorites }: DashboardHeaderProps) {
  const [addDeviceOpen, setAddDeviceOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Gradient background with blur effect */}
        <div className="bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-sm border-b">
          <div className="container px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-primary">{vehicleName}</h1>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <button className="flex w-full items-center text-left" onClick={() => setAddDeviceOpen(true)}>
                            <Plus className="mr-2 h-4 w-4 text-primary" />
                            <span>Add Accessory</span>
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Edit Vehicle Information</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {vehicleType && <p className="text-xs text-muted-foreground">{vehicleType}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Voice Control Button */}
                <VoiceControl />
                <BluetoothNavButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add Device Flow */}
      <AddDeviceFlow open={addDeviceOpen} onClose={() => setAddDeviceOpen(false)} />
    </>
  )
}
