import { V0PreviewHelper } from "@/components/v0-preview-helper"

export default function V0PreviewPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold">V0 Preview Mode</h1>
        <p className="text-muted-foreground">
          This page is only accessible in the V0 environment for testing preview mode.
        </p>
        <V0PreviewHelper />
      </div>
    </div>
  )
}
