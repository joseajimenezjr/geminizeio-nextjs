"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getPreviewToken } from "@/lib/preview-mode"

interface PreviewAuthLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
  [key: string]: any
}

export function PreviewAuthLink({ href, children, className, onClick, ...props }: PreviewAuthLinkProps) {
  const [authHref, setAuthHref] = useState(href)

  useEffect(() => {
    // Get token
    const token = getPreviewToken()

    if (token) {
      // Add token to the URL hash
      const url = new URL(href, window.location.origin)

      // Ensure preview_mode parameter is present
      if (!url.searchParams.has("preview_mode")) {
        url.searchParams.set("preview_mode", "true")
      }

      // Add token to hash
      url.hash = `token=${encodeURIComponent(token)}`

      // Get email from localStorage
      try {
        const email = localStorage.getItem("supabase_email")
        if (email) {
          url.hash += `&email=${encodeURIComponent(email)}`
        }
      } catch (e) {
        console.warn("Could not access localStorage:", e)
      }

      const fullUrl = url.toString()
      console.log(`PreviewAuthLink: Updated URL for ${href} to ${fullUrl}`)
      setAuthHref(fullUrl)
    }
  }, [href])

  const handleClick = (e: React.MouseEvent) => {
    // Log the full URL when clicked
    console.log(`Navigation clicked: ${authHref}`)

    // Call the original onClick if provided
    if (onClick) onClick(e)
  }

  return (
    <Link href={authHref} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
