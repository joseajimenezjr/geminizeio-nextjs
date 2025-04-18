import type React from "react"
export default function ControlCenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex min-h-screen flex-col bg-background">{children}</div>
}
