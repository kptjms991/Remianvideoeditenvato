"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("Auth error:", error)
      router.push("/")
      return
    }

    if (code) {
      // Store the auth code and redirect to editor
      localStorage.setItem("envato_auth_code", code)
      localStorage.setItem("envato_token", "authenticated")
      router.push("/editor")
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Authenticating...</p>
      </div>
    </div>
  )
}
