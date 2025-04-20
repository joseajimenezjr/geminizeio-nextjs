"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Clock, Trophy, Star, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  updateBestTime,
  saveTopTime,
  editTopTimeDescription,
  deleteTopTime,
  getUserData,
} from "@/app/actions/user-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TopTimeEntry {
  time: number
  date: string
  description: string
}

interface TimerWidgetProps {
  title?: string
  bestTime?: number | null
  topTimes?: TopTimeEntry[] | null
  isEditing?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function TimerWidget({
  title = "Timer",
  bestTime: initialBestTime = null,
  topTimes: initialTopTimes = null,
  isEditing = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: TimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(initialBestTime)
  const [topTimes, setTopTimes] = useState<TopTimeEntry[] | null>(initialTopTimes)
  const [showNewBest, setShowNewBest] = useState(false)
  const [showTopTime, setShowTopTime] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showTopTimesDialog, setShowTopTimesDialog] = useState(false)
  const [description, setDescription] = useState("")
  const [isNewBestTime, setIsNewBestTime] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const { toast } = useToast()

  // Edit time state
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  // Delete time state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [isWidgetEditing, setIsWidgetEditing] = useState(isEditing)

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData()
        if (userData) {
          if (userData.bestTimeCaptured !== undefined) {
            setBestTime(userData.bestTimeCaptured)
          }
          if (userData.topTimesCaptured) {
            setTopTimes(userData.topTimesCaptured)
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      }
    }

    loadUserData()
  }, [])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle the timer flashing effect
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (isRunning) {
      const flashInterval = setInterval(() => {
        setFlash((prev) => !prev)
      }, 500) // Toggle flash every 500ms

      return () => clearInterval(flashInterval)
    } else {
      setFlash(false)
    }
  }, [isRunning])

  // Handle the new best time animation
  useEffect(() => {
    if (showNewBest) {
      const timer = setTimeout(() => {
        setShowNewBest(false)
      }, 3000) // Show animation for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [showNewBest])

  // Handle the top time animation
  useEffect(() => {
    if (showTopTime) {
      const timer = setTimeout(() => {
        setShowTopTime(false)
      }, 3000) // Show animation for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [showTopTime])

  // Reset to default message after showing result
  useEffect(() => {
    if (showResult && !isRunning) {
      const timer = setTimeout(() => {
        setShowResult(false)
      }, 5000) // Show result for 5 seconds before resetting

      return () => clearTimeout(timer)
    }
  }, [showResult, isRunning])

  // Check if a time is within the top 10
  const isWithinTopTen = (time: number): boolean => {
    if (!topTimes || topTimes.length < 10) {
      return true // Automatically in top 10 if we have fewer than 10 times
    }

    // Check if this time is better than the slowest time in our top 10
    const slowestTopTime = Math.max(...topTimes.map((t) => t.time))
    return time < slowestTopTime
  }

  const handleClick = async () => {
    if (isWidgetEditing) return // Don't respond to clicks in edit mode

    if (!isRunning) {
      // Start the timer
      startTimeRef.current = Date.now()
      setIsRunning(true)
      setTime(0)
      setShowResult(false)

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current
          setTime(elapsed)
        }
      }, 10) // Update every 10ms for smooth display
    } else {
      // Stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setIsRunning(false)
      setShowResult(true)

      // Check if this is a new best time
      const isNewBest = bestTime === null || time < bestTime

      if (isNewBest) {
        // Save the new best time to Supabase
        try {
          const result = await updateBestTime(time)
          if (result.success) {
            setBestTime(time)
            setShowNewBest(true)
            setIsNewBestTime(true)

            toast({
              title: "New Best Time!",
              description: `You beat your previous record with ${formatTime(time)}`,
            })

            // Show dialog for new best time
            setShowDescriptionDialog(true)
          }
        } catch (error) {
          console.error("Failed to update best time:", error)
        }
      } else {
        // Check if this time is within the top 10 times
        const isTopTen = isWithinTopTen(time)

        if (isTopTen) {
          setShowTopTime(true)
          setIsNewBestTime(false)

          toast({
            title: "Top 10 Time!",
            description: `This time is within your top 10 best times!`,
          })

          // Show dialog for top 10 time
          setShowDescriptionDialog(true)
        }
      }
    }
  }

  const handleSaveDescription = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your achievement",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await saveTopTime(time, description)
      if (result.success) {
        setShowDescriptionDialog(false)
        setDescription("")

        // Update local state with the new top times
        if (result.topTimes) {
          setTopTimes(result.topTimes)
        }

        toast({
          title: "Achievement Saved!",
          description: "Your time has been recorded",
        })
      }
    } catch (error) {
      console.error("Failed to save top time:", error)
      toast({
        title: "Error",
        description: "Failed to save your achievement",
        variant: "destructive",
      })
    }
  }

  // Format time as mm:ss.ms
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent the timer from starting/stopping
    setShowTopTimesDialog(true)
  }

  // Load top times when the dialog is opened
  useEffect(() => {
    const loadTopTimes = async () => {
      if (showTopTimesDialog) {
        try {
          // Fetch user data to get the latest top times
          const userDataResult = await getUserData()

          if (userDataResult && userDataResult.topTimesCaptured) {
            setTopTimes(userDataResult.topTimesCaptured)
          } else {
            setTopTimes([]) // Initialize with an empty array if no top times are found
          }
        } catch (error) {
          console.error("Error fetching top times:", error)
          toast({
            title: "Error",
            description: "Failed to load top times",
            variant: "destructive",
          })
          setTopTimes([]) // Ensure topTimes is an empty array in case of error
        }
      }
    }

    loadTopTimes()
  }, [showTopTimesDialog, toast])

  // Handle edit time
  const handleEditTime = (index: number) => {
    if (topTimes && index >= 0 && index < topTimes.length) {
      setEditIndex(index)
      setEditDescription(topTimes[index].description)
      setShowEditDialog(true)
    }
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (editIndex === null) return

    if (!editDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your achievement",
        variant: "destructive",
      })
      return
    }

    setIsEditingDescription(true)

    try {
      const result = await editTopTimeDescription(editIndex, editDescription)
      if (result.success) {
        setShowEditDialog(false)
        setEditIndex(null)
        setEditDescription("")

        // Update local state with the updated top times
        if (result.topTimes) {
          setTopTimes(result.topTimes)
        }

        toast({
          title: "Description Updated",
          description: "Your achievement description has been updated",
        })
      }
    } catch (error) {
      console.error("Failed to update description:", error)
      toast({
        title: "Error",
        description: "Failed to update your achievement description",
        variant: "destructive",
      })
    } finally {
      setIsEditingDescription(false)
    }
  }

  // Handle delete time
  const handleDeleteTime = (index: number) => {
    if (topTimes && index >= 0 && index < topTimes.length) {
      setDeleteIndex(index)
      setShowDeleteDialog(true)
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (deleteIndex === null) return

    setIsDeleting(true)

    try {
      const result = await deleteTopTime(deleteIndex)
      if (result.success) {
        setShowDeleteDialog(false)
        setDeleteIndex(null)

        // Update local state with the updated top times
        if (result.topTimes) {
          setTopTimes(result.topTimes)
        }

        toast({
          title: "Achievement Deleted",
          description: "Your achievement has been removed",
        })
      }
    } catch (error) {
      console.error("Failed to delete time:", error)
      toast({
        title: "Error",
        description: "Failed to delete your achievement",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        className={`h-full w-full flex flex-col items-center justify-center p-2 cursor-pointer transition-colors relative ${
          isRunning && flash ? "bg-green-500/20" : ""
        }`}
        onClick={handleClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        {/* Star icon in top right */}
        <div
          className="absolute top-2 right-2 text-yellow-500 cursor-pointer hover:text-yellow-400 transition-colors z-10"
          onClick={handleStarClick}
        >
          <Star className="h-5 w-5" />
        </div>

        <div className="text-sm font-medium mb-1">{title}</div>

        {isRunning ? (
          <div className="text-3xl font-bold tabular-nums">{formatTime(time)}</div>
        ) : showResult ? (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold tabular-nums">{formatTime(time)}</div>
            {bestTime !== null && (
              <div className="flex items-center mt-1 text-xs">
                <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                <span className="tabular-nums">{formatTime(bestTime)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-sm text-center mb-1">Tap to start timer!</div>
            <Clock className="h-12 w-12 mb-1 text-primary" />
            {bestTime !== null && (
              <div className="flex items-center mt-1 text-xs">
                <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                <span className="tabular-nums">{formatTime(bestTime)}</span>
              </div>
            )}
          </div>
        )}

        {/* New best time animation */}
        {showNewBest && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping absolute h-full w-full rounded-lg bg-yellow-500 opacity-20"></div>
            <div className="relative bg-yellow-500/80 text-black font-bold px-2 py-1 rounded-md animate-bounce">
              NEW BEST!
            </div>
          </div>
        )}

        {/* Top 10 time animation */}
        {showTopTime && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping absolute h-full w-full rounded-lg bg-blue-500 opacity-20"></div>
            <div className="relative bg-blue-500/80 text-white font-bold px-2 py-1 rounded-md animate-bounce">
              TOP 10!
            </div>
          </div>
        )}
      </div>

      {/* Top Times Dialog */}
      <Dialog open={showTopTimesDialog} onOpenChange={setShowTopTimesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Top Times</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {topTimes && topTimes.length > 0 ? (
              <div className="space-y-2">
                {topTimes.map((entry, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 flex items-center justify-between ${index === 0 ? "bg-yellow-500/10 border-yellow-500/50" : "bg-muted/30"}`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span className="font-bold text-lg tabular-nums">{formatTime(entry.time)}</span>
                      <span className="text-sm ml-2">{entry.description}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">{formatDate(entry.date)}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTime(index)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTime(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No top times recorded yet.</p>
                <p className="text-sm mt-2">Complete a timer run to set your first record!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Description Input Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewBestTime ? "New Best Time!" : "Top 10 Time!"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              {isNewBestTime
                ? `Congratulations on your new best time: ${formatTime(time)}`
                : `Great job! This time (${formatTime(time)}) is in your top 10.`}
            </p>
            <p className="mb-2 text-sm">Add a description for this achievement:</p>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Off-road trail run, Rock crawling session..."
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDescriptionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDescription}>Save Achievement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Description Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2 text-sm">Update the description for this achievement:</p>
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="e.g., Off-road trail run, Rock crawling session..."
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isEditingDescription}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isEditingDescription}>
                {isEditingDescription ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this achievement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
