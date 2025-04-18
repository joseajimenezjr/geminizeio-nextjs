import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Header } from "@/components/layout/header"
import { NewAccessoryForm } from "@/components/accessories/new-accessory-form"

export default async function NewAccessoryPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Add New Accessory</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <NewAccessoryForm />
        </div>
      </main>
    </div>
  )
}
