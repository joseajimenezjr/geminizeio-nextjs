"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Power } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WinchLibrary() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isPowered, setIsPowered] = useState(false)

  const togglePower = () => {
    setIsPowered(!isPowered)
  }

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="rounded-lg bg-black text-white p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 w-full text-center">Winch</h2>

      <div className="grid grid-cols-3 gap-4 flex-grow">
        <Button
          variant="outline"
          className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 h-full flex items-center justify-center"
          onClick={prevPage}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          variant="outline"
          className={`${isPowered ? "bg-green-900 border-green-800 hover:bg-green-800" : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"} h-full flex items-center justify-center`}
          onClick={togglePower}
        >
          <Power className={`h-8 w-8 ${isPowered ? "text-green-400" : "text-white"}`} />
        </Button>

        <Button
          variant="outline"
          className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 h-full flex items-center justify-center"
          onClick={nextPage}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}
