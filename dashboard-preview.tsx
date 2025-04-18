"use client"

import { Header } from "./components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Lightbulb, Layers } from "lucide-react"

export default function DashboardPreview() {
  // Sample data for preview
  const accessoryGroups = [
    { id: 1, name: "Exterior Lights", count: 5 },
    { id: 2, name: "Interior Lights", count: 3 },
    { id: 3, name: "Utility", count: 2 },
  ]

  const recentAccessories = [
    { id: 1, name: "Light Bar", type: "Light", location: "Relay 1" },
    { id: 2, name: "Spot Lights", type: "Light", location: "Relay 2" },
    { id: 3, name: "Winch", type: "Utility", location: "Relay 3" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accessory Groups</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessoryGroups.length}</div>
              <p className="text-xs text-muted-foreground">Manage your accessory groups</p>
              <div className="mt-4 space-y-2">
                {accessoryGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between">
                    <span>{group.name}</span>
                    <span className="text-sm text-muted-foreground">{group.count} items</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/groups/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Group
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Accessories</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentAccessories.length}</div>
              <p className="text-xs text-muted-foreground">Your most recently added accessories</p>
              <div className="mt-4 space-y-2">
                {recentAccessories.map((accessory) => (
                  <div key={accessory.id} className="flex items-center justify-between">
                    <span>{accessory.name}</span>
                    <span className="text-sm text-muted-foreground">{accessory.location}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/accessories/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Accessory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your off-road accessories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href="/accessories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Accessory
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/accessories">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  View All Accessories
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/groups/new">
                  <Layers className="mr-2 h-4 w-4" />
                  Create Accessory Group
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
