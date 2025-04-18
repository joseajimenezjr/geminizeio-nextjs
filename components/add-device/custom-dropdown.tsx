"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDropdownProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  className?: string
  id?: string
  disabled?: boolean
}

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
  className,
  id,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Get the selected option label
  const selectedOption = options.find((option) => option.value === value)
  const displayText = selectedOption ? selectedOption.label : placeholder

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-red-500 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-700 bg-gray-900 text-white shadow-md">
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-800",
                  option.value === value && "bg-red-900 text-white",
                )}
                onClick={() => handleSelect(option.value)}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && <Check className="h-4 w-4" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
