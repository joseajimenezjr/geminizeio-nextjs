"use client"
import { Plus, ChevronDown, Car, Settings, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState } from "react"
import { AddDeviceFlow } from "@/components/add-device/add-device-flow"

interface AccessoriesHeaderProps {
  vehicleName: string
  vehicleType: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function AccessoriesHeader({
  vehicleName,
  vehicleType,
  onRefresh,
  isRefreshing = false,
}: AccessoriesHeaderProps) {
  const [addDeviceOpen, setAddDeviceOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Dark background for header */}
        <div className="bg-black border-b border-gray-800">
          <div className="container px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-red-900/20 flex items-center justify-center">
                  <Car className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-red-500">{vehicleName}</h1>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Vehicle Settings</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {vehicleType && <p className="text-xs text-muted-foreground">{vehicleType}</p>}
                </div>
              </div>

              <Button
                variant="default"
                size="sm"
                className="gap-2 rounded-full bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                onClick={() => setAddDeviceOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Device</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page title and refresh button */}
      <div className="bg-black px-4 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">All Accessories</h2>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2 border-gray-700 text-gray-300"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        )}
      </div>

      {/* Add Device Flow */}
      <AddDeviceFlow open={addDeviceOpen} onClose={() => setAddDeviceOpen(false)} />
    </>
  )
}
