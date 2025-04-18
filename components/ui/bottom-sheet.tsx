"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const bottomSheetVariants = cva(
  "fixed inset-x-0 bottom-0 z-[100] bg-background rounded-t-xl shadow-lg transform transition-transform duration-500 ease-in-out",
  {
    variants: {
      size: {
        default: "max-h-[85vh]",
        sm: "max-h-[35vh]",
        lg: "h-[95vh]",
        compact: "max-h-[auto]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export interface BottomSheetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bottomSheetVariants> {
  open: boolean
  onClose: () => void
  showCloseButton?: boolean
  showHandle?: boolean
  compact?: boolean
}

export function BottomSheet({
  className,
  children,
  open,
  onClose,
  size,
  showCloseButton = true,
  showHandle = true,
  compact = false,
  ...props
}: BottomSheetProps) {
  // Handle click outside
  const sheetRef = React.useRef<HTMLDivElement>(null)

  // Create a context to disable outside clicks when needed
  const [disableOutsideClicks, setDisableOutsideClicks] = React.useState(false)

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Skip if outside clicks are disabled
      if (disableOutsideClicks) return

      // Only close if clicking outside the sheet
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (open) {
      // Use capture phase to handle the event before it reaches other handlers
      document.addEventListener("mousedown", handleOutsideClick, true)
      // Prevent body scrolling when sheet is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true)
      document.body.style.overflow = ""
    }
  }, [open, onClose, disableOutsideClicks])

  // Handle swipe down to close
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchEnd - touchStart
    const isDownSwipe = distance > 100
    if (isDownSwipe) {
      onClose()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  if (!open) return null

  // Use compact size if compact prop is true
  const effectiveSize = compact ? "compact" : size

  return (
    <BottomSheetContext.Provider value={{ setDisableOutsideClicks }}>
      <div className="fixed inset-0 z-[99] bg-black/50">
        <div
          ref={sheetRef}
          className={cn(
            bottomSheetVariants({ size: effectiveSize }),
            open ? "translate-y-0" : "translate-y-full",
            compact ? "fit-content" : "",
            className,
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          {...props}
        >
          {showHandle && (
            <div className={cn("flex justify-center", compact ? "pt-1 pb-0.5" : "pt-2 pb-1")}>
              <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
            </div>
          )}

          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                "absolute right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted",
                compact ? "top-2" : "top-4",
              )}
            >
              <X className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
              <span className="sr-only">Close</span>
            </button>
          )}

          <div className={cn("overflow-auto", compact ? "p-3 pb-4" : "p-4 pb-8", compact ? "max-h-[70vh]" : "h-full")}>
            {children}
          </div>
        </div>
      </div>
    </BottomSheetContext.Provider>
  )
}

// Create a context to control outside click behavior
type BottomSheetContextType = {
  setDisableOutsideClicks: React.Dispatch<React.SetStateAction<boolean>>
}

export const BottomSheetContext = React.createContext<BottomSheetContextType>({
  setDisableOutsideClicks: () => {},
})

// Hook to use the bottom sheet context
export const useBottomSheet = () => React.useContext(BottomSheetContext)
