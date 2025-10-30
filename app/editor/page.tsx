"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EditorProvider } from "@/components/editor/editor-context"
import EditorLayout from "@/components/editor/editor-layout"

export default function EditorPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const envatoToken = localStorage.getItem("envato_token")
    const adminToken = localStorage.getItem("admin_token")
    const role = localStorage.getItem("user_role")

    if (!envatoToken && !adminToken) {
      router.push("/")
      return
    }

    setUserRole(role || "user")
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <EditorProvider>
      <EditorLayout userRole={userRole} />
    </EditorProvider>
  )
}
