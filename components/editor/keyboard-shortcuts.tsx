"use client"

import { useEffect } from "react"
import { useEditor } from "./editor-context"
import { useToast } from "@/hooks/use-toast"

export function KeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useEditor()
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) {
          undo()
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        e.preventDefault()
        if (canRedo) {
          redo()
        }
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        toast({
          description: "Project saved",
          duration: 2000,
        })
      }

      // Space: Play/Pause
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault()
        // Dispatch custom event for play/pause
        window.dispatchEvent(new CustomEvent("togglePlayback"))
      }

      // Delete: Delete selected clip
      if (e.key === "Delete") {
        window.dispatchEvent(new CustomEvent("deleteSelected"))
      }

      // ?: Show shortcuts
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        window.dispatchEvent(new CustomEvent("showShortcuts"))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, canUndo, canRedo, toast])

  return null
}
