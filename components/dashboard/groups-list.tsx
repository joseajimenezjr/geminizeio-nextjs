"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, Plus, ChevronRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { type Group, updateGroupStatus } from "@/app/actions/user-data"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GroupsListProps {
  initialGroups: Group[]
}

export function GroupsList({ initialGroups }: GroupsListProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Update groups when initialGroups changes
  useEffect(() => {
    console.log("GroupsList received initialGroups:", initialGroups)
    setGroups(initialGroups)
  }, [initialGroups])

  const handleToggle = async (id: string, active: boolean) => {
    setLoading((prev) => ({ ...prev, [id]: true }))

    try {
      // Update local state immediately for better UX
      setGroups((prev) => prev.map((group) => (group.id === id ? { ...group, active } : group)))

      // Try to update on the server
      const result = await updateGroupStatus(id, active)

      if (!result.success) {
        toast({
          title: "Warning",
          description: result.error || "Changes saved locally but not synced to server",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error toggling group:", error)
      toast({
        title: "Warning",
        description: "Changes saved locally but not synced to server",
        variant: "default",
      })
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="bg-background/50 backdrop-blur-sm border-b pb-3">
        <CardTitle className="text-sm font-medium">GROUPS</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {groups && groups.length > 0 ? (
          <div className="divide-y divide-border/50">
            {groups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "flex items-center justify-between p-4 transition-colors",
                  group.active ? "bg-primary/5" : "",
                )}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "rounded-md p-2 transition-colors",
                      group.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.devices?.length || 0} devices</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={group.active}
                    onCheckedChange={(checked) => handleToggle(group.id, checked)}
                    disabled={loading[group.id]}
                  />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="mb-4 text-muted-foreground">No groups found</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
