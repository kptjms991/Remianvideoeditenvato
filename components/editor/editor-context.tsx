"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface EditorState {
  selectedTemplate: any
  selectedClip: string | null
  currentTime: number
  isPlaying: boolean
  zoom: number
}

interface EditorContextType {
  state: EditorState
  setState: (state: EditorState) => void
  history: EditorState[]
  historyIndex: number
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  saveState: (newState: EditorState) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [state, setStateInternal] = useState<EditorState>({
    selectedTemplate: null,
    selectedClip: null,
    currentTime: 0,
    isPlaying: false,
    zoom: 1,
  })
  const [history, setHistory] = useState<EditorState[]>([state])
  const [historyIndex, setHistoryIndex] = useState(0)

  const saveState = useCallback(
    (newState: EditorState) => {
      setStateInternal(newState)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newState)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setStateInternal(history[newIndex])
      setHistoryIndex(newIndex)
      toast({
        description: "Undo",
        duration: 1000,
      })
    }
  }, [history, historyIndex, toast])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setStateInternal(history[newIndex])
      setHistoryIndex(newIndex)
      toast({
        description: "Redo",
        duration: 1000,
      })
    }
  }, [history, historyIndex, toast])

  const setState = useCallback(
    (newState: EditorState) => {
      saveState(newState)
    },
    [saveState],
  )

  return (
    <EditorContext.Provider
      value={{
        state,
        setState,
        history,
        historyIndex,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        saveState,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}
