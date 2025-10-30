"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], description: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
  { keys: ["Ctrl", "S"], description: "Save project" },
  { keys: ["Space"], description: "Play/Pause" },
  { keys: ["Delete"], description: "Delete selected clip" },
  { keys: ["?"], description: "Show shortcuts" },
]

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleShowShortcuts = () => setOpen(true)
    window.addEventListener("showShortcuts", handleShowShortcuts)
    return () => window.removeEventListener("showShortcuts", handleShowShortcuts)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      {key}
                    </Badge>
                    {j < shortcut.keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
