"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated (either Envato or Admin)
    const envatoToken = localStorage.getItem("envato_token")
    const adminToken = localStorage.getItem("admin_token")
    setIsAuthenticated(!!(envatoToken || adminToken))
    setIsLoading(false)
  }, [])

  const handleEnvatoLogin = () => {
    // Redirect to Envato OAuth
    const clientId = process.env.NEXT_PUBLIC_ENVATO_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback`
    const authUrl = `https://api.envato.com/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`
    window.location.href = authUrl
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Remian Video Editor</CardTitle>
            <CardDescription>Professional video editing with Envato templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're authenticated and ready to start editing. Click below to access the editor.
            </p>
            <Button onClick={() => router.push("/editor")} className="w-full" size="lg">
              Open Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RV</span>
            </div>
            <span className="font-bold text-lg text-foreground">Remian Video</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition">
              Templates
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Professional Video Editing Made Simple
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Access thousands of premium templates from Envato. Edit, customize, and export in minutes with our intuitive
          timeline editor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleEnvatoLogin} size="lg" className="px-8 py-6 text-base">
            Sign in with Envato
          </Button>
          <Button
            onClick={() => router.push("/admin/login")}
            size="lg"
            variant="outline"
            className="px-8 py-6 text-base"
          >
            Admin Access
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Envato Templates",
              description: "Access millions of premium video, photo, and graphics templates",
            },
            {
              title: "Timeline Editor",
              description: "Professional-grade timeline with drag-and-drop editing",
            },
            {
              title: "Real-time Preview",
              description: "See changes instantly as you edit your projects",
            },
            {
              title: "Text & Effects",
              description: "Add text, animations, and visual effects with ease",
            },
            {
              title: "Licensed Downloads",
              description: "Export with proper licensing from Envato",
            },
            {
              title: "Motion & Premiere",
              description: "Support for Apple Motion and Premiere Pro templates",
            },
          ].map((feature, i) => (
            <Card key={i} className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Ready to Create?</CardTitle>
            <CardDescription>Start editing with Envato templates today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleEnvatoLogin} size="lg" className="px-8 py-6 text-base">
                Get Started Now
              </Button>
              <Button
                onClick={() => router.push("/admin/login")}
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base"
              >
                Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>Remian Video Editor - Professional video editing powered by Envato</p>
        </div>
      </footer>
    </div>
  )
}
