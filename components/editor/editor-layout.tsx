"use client"

import { useState, useEffect } from "react"
import TemplateLibrary from "./template-library"
import TimelineEditor from "./timeline-editor"
import EditingPanel from "./editing-panel"
import ExportDialog from "./export-dialog"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { ShortcutsHelp } from "./shortcuts-help"
import { useEditor } from "./editor-context"
import { Button } from "@/components/ui/button"
import { Menu, X, Undo2, Redo2, HelpCircle, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AIChatSidebar from "./ai-chat-sidebar"

export default function EditorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const { state, setState, undo, redo, canUndo, canRedo } = useEditor()
  const { toast } = useToast()

  useEffect(() => {
    setState({
      ...state,
      selectedTemplate,
    })
  }, [selectedTemplate])

  const handleSave = () => {
    toast({
      description: "Project saved successfully",
      duration: 2000,
    })
  }

  return (
    <>
      <KeyboardShortcuts />
      <ShortcutsHelp />
      <AIChatSidebar isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - Template Library */}
        <div
          className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 border-r border-border/40 overflow-hidden flex flex-col`}
        >
          <TemplateLibrary onSelectTemplate={setSelectedTemplate} />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-secondary/30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="transition-transform hover:scale-110"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h1 className="text-lg font-semibold text-foreground">Remian Video Editor</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-r border-border/40 pr-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={undo}
                  disabled={!canUndo}
                  className="h-8 w-8 transition-all hover:scale-110"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={redo}
                  disabled={!canRedo}
                  className="h-8 w-8 transition-all hover:scale-110"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiChatOpen(!aiChatOpen)}
                className="transition-all hover:scale-105 bg-transparent gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="transition-all hover:scale-105 bg-transparent"
              >
                Save
              </Button>
              <Button size="sm" onClick={() => setExportOpen(true)} className="transition-all hover:scale-105">
                Export
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.dispatchEvent(new CustomEvent("showShortcuts"))}
                title="Show shortcuts (?)"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden gap-4 p-4">
            {/* Timeline and Preview */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <TimelineEditor selectedTemplate={selectedTemplate} />
            </div>

            {/* Right Panel - Editing Tools */}
            <div className="w-80 border-l border-border/40 overflow-hidden">
              <EditingPanel />
            </div>
          </div>
        </div>

        {/* Export Dialog */}
        <ExportDialog open={exportOpen} onOpenChange={setExportOpen} projectName="my-video" />
      </div>
    </>
  )
}
