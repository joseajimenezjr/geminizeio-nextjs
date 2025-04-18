import { redirect } from "next/navigation"

export default function PreviewPage() {
  // Redirect to the login page with the preview tab active
  redirect("/?tab=preview")
}
