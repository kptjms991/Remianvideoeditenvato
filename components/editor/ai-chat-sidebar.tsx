"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, Sparkles, X } from "lucide-react"
import { useEditor } from "./editor-context"

interface AIChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
  })

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { state, setState } = useEditor()

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    sendMessage({ text: input })
    setInput("")
  }

  const handleToolCall = (toolName: string, toolInput: any) => {
    switch (toolName) {
      case "editText":
        setState({
          ...state,
          selectedClip: {
            ...state.selectedClip,
            text: toolInput.text,
            fontSize: toolInput.fontSize || 24,
            color: toolInput.color || "#ffffff",
          },
        })
        break
      case "applyEffect":
        setState({
          ...state,
          selectedClip: {
            ...state.selectedClip,
            effects: [
              ...(state.selectedClip?.effects || []),
              {
                type: toolInput.effectType,
                intensity: toolInput.intensity,
              },
            ],
          },
        })
        break
      case "adjustClip":
        setState({
          ...state,
          selectedClip: {
            ...state.selectedClip,
            [toolInput.property]: toolInput.value,
          },
        })
        break
      case "addTransition":
        setState({
          ...state,
          selectedClip: {
            ...state.selectedClip,
            transition: {
              type: toolInput.transitionType,
              duration: toolInput.duration,
            },
          },
        })
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background border-l border-border/40 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border/40 flex items-center justify-between px-4 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">AI Assistant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Welcome to AI Video Editing!</p>
            <p className="text-xs text-muted-foreground">
              Describe what you want to edit and I'll help you make it happen.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <Card
                  className={`max-w-xs px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm">
                    {message.parts
                      .filter((part) => part.type === "text")
                      .map((part) => (part as any).text)
                      .join("")}
                  </p>
                </Card>
              </div>
            ))}
            {status === "in_progress" && (
              <div className="flex justify-start">
                <Card className="bg-secondary text-foreground px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="h-20 border-t border-border/40 p-4 bg-secondary/30">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your edit..."
            disabled={status === "in_progress"}
            className="flex-1 bg-background"
          />
          <Button type="submit" size="icon" disabled={status === "in_progress" || !input.trim()} className="h-10 w-10">
            {status === "in_progress" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Try: "Add bold red text at the top" or "Apply a fade effect"
        </p>
      </div>
    </div>
  )
}
