import * as React from "react"
import NextLink from "next/link"

import { cn } from "@/lib/utils"

export const Link = React.forwardRef<
  React.ElementRef<typeof NextLink>,
  React.ComponentPropsWithoutRef<typeof NextLink>
>(({ className, children, ...props }, ref) => {
  return (
    <NextLink className={cn("underline-offset-4 hover:underline text-primary", className)} {...props} ref={ref}>
      {children}
    </NextLink>
  )
})
Link.displayName = "Link"
