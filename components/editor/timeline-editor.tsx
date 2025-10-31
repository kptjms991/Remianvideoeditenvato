"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react"

interface TimelineClip {
  id: string
  name: string
  startTime: number
  duration: number
  trackId: string
}

interface TimelineTrack {
  id: string
  name: string
  type: "video" | "audio"
}

interface TimelineEditorProps {
  selectedTemplate?: any
  uploadedFiles?: any[]
  isPlaying?: boolean
  onPlayStateChange?: (playing: boolean) => void
  currentTime?: number
  onTimeChange?: (time: number) => void
}

export default function TimelineEditor({
  selectedTemplate,
  uploadedFiles = [],
  isPlaying = false,
  onPlayStateChange,
  currentTime = 0,
  onTimeChange,
}: TimelineEditorProps) {
  const [duration] = useState(60)
  const [zoom, setZoom] = useState(1)
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: "video-1", name: "Video Track", type: "video" },
    { id: "audio-1", name: "Audio Track", type: "audio" },
  ])
  const [clips, setClips] = useState<TimelineClip[]>(
    [
      selectedTemplate
        ? {
            id: "clip-1",
            name: selectedTemplate.name,
            startTime: 0,
            duration: 10,
            trackId: "video-1",
          }
        : null,
    ].filter(Boolean),
  )
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [draggingClip, setDraggingClip] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const pixelsPerSecond = 50 * zoom

  const addTrack = (type: "video" | "audio") => {
    const newTrack: TimelineTrack = {
      id: `${type}-${Date.now()}`,
      name: `${type === "video" ? "Video" : "Audio"} Track ${tracks.filter((t) => t.type === type).length + 1}`,
      type,
    }
    setTracks([...tracks, newTrack])
  }

  const removeTrack = (trackId: string) => {
    setTracks(tracks.filter((t) => t.id !== trackId))
    setClips(clips.filter((c) => c.trackId !== trackId))
  }

  const handleClipMouseDown = (clipId: string, e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedClip(clipId)
    setDraggingClip(clipId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingClip || !timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const newStartTime = Math.max(0, (e.clientX - rect.left) / pixelsPerSecond)

    setClips(
      clips.map((clip) =>
        clip.id === draggingClip ? { ...clip, startTime: Math.round(newStartTime * 10) / 10 } : clip,
      ),
    )
  }

  const handleMouseUp = () => {
    setDraggingClip(null)
  }

  const deleteClip = (clipId: string) => {
    setClips(clips.filter((c) => c.id !== clipId))
    setSelectedClip(null)
  }

  const handleAddClip = () => {
    if (!selectedTemplate) return
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      name: selectedTemplate.name,
      startTime: currentTime,
      duration: 10,
      trackId: "video-1",
    }
    setClips([...clips, newClip])
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const newTime = (e.clientX - rect.left) / pixelsPerSecond
    onTimeChange?.(Math.max(0, Math.min(newTime, duration)))
  }

  return (
    <div className="flex flex-col gap-2 h-48" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Timeline Tracks */}
      <Card className="bg-secondary/20 border-border/40 p-3 rounded-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 border-r border-border/40 pr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="h-7 w-7"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-muted-foreground w-6 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="h-7 w-7">
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={() => addTrack("video")} className="h-6 text-xs px-2">
              <Plus className="w-3 h-3 mr-1" />
              Video
            </Button>
            <Button size="sm" variant="outline" onClick={() => addTrack("audio")} className="h-6 text-xs px-2">
              <Plus className="w-3 h-3 mr-1" />
              Audio
            </Button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-1">
            {tracks.map((track) => (
              <div key={track.id} className="flex gap-2">
                {/* Track Label */}
                <div className="w-28 flex-shrink-0 flex items-center justify-between px-2 py-1 bg-background rounded border border-border/40">
                  <span className="text-xs font-medium text-foreground truncate">{track.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeTrack(track.id)} className="h-4 w-4 -mr-1">
                    <Trash2 className="w-2 h-2 text-destructive" />
                  </Button>
                </div>

                {/* Track Timeline */}
                <div
                  ref={timelineRef}
                  className="flex-1 h-12 bg-background rounded border border-border/40 relative overflow-x-auto cursor-pointer"
                  style={{ minWidth: `${duration * pixelsPerSecond}px` }}
                  onClick={handleTimelineClick}
                >
                  {/* Grid Lines */}
                  {Array.from({ length: Math.ceil(duration / 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-border/20"
                      style={{ left: `${i * 5 * pixelsPerSecond}px` }}
                    >
                      <span className="text-xs text-muted-foreground px-1">{i * 5}s</span>
                    </div>
                  ))}

                  {/* Clips */}
                  {clips
                    .filter((clip) => clip.trackId === track.id)
                    .map((clip) => (
                      <div
                        key={clip.id}
                        className={`absolute top-0.5 bottom-0.5 rounded cursor-move transition-all ${
                          selectedClip === clip.id
                            ? "bg-primary/80 ring-2 ring-primary"
                            : "bg-primary/60 hover:bg-primary/70"
                        }`}
                        style={{
                          left: `${clip.startTime * pixelsPerSecond}px`,
                          width: `${clip.duration * pixelsPerSecond}px`,
                          minWidth: "30px",
                        }}
                        onMouseDown={(e) => handleClipMouseDown(clip.id, e)}
                        onClick={() => setSelectedClip(clip.id)}
                      >
                        <div className="px-1 py-0.5 text-xs font-medium text-primary-foreground truncate">
                          {clip.name}
                        </div>
                      </div>
                    ))}

                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
                    style={{ left: `${currentTime * pixelsPerSecond}px` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
