"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBottomSheet } from "@/components/ui/bottom-sheet"

interface SafeSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  className?: string
  id?: string
  disabled?: boolean
}

export function SafeSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  id,
  disabled = false,
}: SafeSelectProps) {
  const { setDisableOutsideClicks } = useBottomSheet()

  // Handle open state to disable outside clicks
  const handleOpenChange = (open: boolean) => {
    setDisableOutsideClicks(open)
  }

  return (
    <Select value={value} onValueChange={onValueChange} onOpenChange={handleOpenChange} disabled={disabled}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
