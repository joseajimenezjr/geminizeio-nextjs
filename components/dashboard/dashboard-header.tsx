"use client"
import { Plus, ChevronDown, Car, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  vehicleName: string
  vehicleType: string
  showFavorites: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardHeader({
  vehicleName,
  vehicleType,
  showFavorites,
  activeTab,
  setActiveTab,
}: DashboardHeaderProps) {
  return (
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
              className="gap-2 rounded-full shadow-md hover:shadow-lg transition-all"
              asChild
            >
              <Link href="/accessories/new">
                <Plus className="h-4 w-4" />
                <span>Add Device</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="container px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative -mb-px">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="dashboard"
                className={cn(
                  "relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-all data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  activeTab === "dashboard" && "text-primary",
                )}
              >
                Dashboard
              </TabsTrigger>
              {showFavorites && (
                <TabsTrigger
                  value="favorites"
                  className={cn(
                    "relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-all data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    activeTab === "favorites" && "text-primary",
                  )}
                >
                  Favorites
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  )
}

