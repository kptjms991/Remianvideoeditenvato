"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react"

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

export default function TimelineEditor({ selectedTemplate }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
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

  return (
    <div className="flex flex-col gap-4 h-full" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Preview Area */}
      <Card className="flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center border-border/40">
        <div className="text-center">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="w-96 h-56 bg-secondary/30 rounded-lg flex items-center justify-center">
                <img
                  src={selectedTemplate.thumbnail || "/placeholder.svg"}
                  alt={selectedTemplate.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-foreground font-medium">{selectedTemplate.name}</p>
              <p className="text-xs text-muted-foreground">Current time: {currentTime.toFixed(1)}s</p>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <p className="text-lg">Select a template to preview</p>
            </div>
          )}
        </div>
      </Card>

      {/* Playback Controls */}
      <div className="flex items-center gap-4 px-4 py-3 bg-secondary/20 rounded-lg border border-border/40">
        <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        {/* Timeline Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12">{Math.floor(currentTime)}s</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-12">{duration}s</span>
        </div>

        <Button variant="ghost" size="icon">
          <Volume2 className="w-5 h-5" />
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l border-border/40 pl-4">
          <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="h-8 w-8">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-8 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="h-8 w-8">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Tracks */}
      <Card className="bg-secondary/20 border-border/40 p-4 rounded-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => addTrack("video")} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Video
            </Button>
            <Button size="sm" variant="outline" onClick={() => addTrack("audio")} className="h-7 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Audio
            </Button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="flex gap-2">
                {/* Track Label */}
                <div className="w-32 flex-shrink-0 flex items-center justify-between px-3 py-2 bg-background rounded border border-border/40">
                  <span className="text-xs font-medium text-foreground truncate">{track.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeTrack(track.id)} className="h-5 w-5 -mr-2">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>

                {/* Track Timeline */}
                <div
                  ref={timelineRef}
                  className="flex-1 h-16 bg-background rounded border border-border/40 relative overflow-x-auto"
                  style={{ minWidth: `${duration * pixelsPerSecond}px` }}
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
                        className={`absolute top-1 bottom-1 rounded cursor-move transition-all ${
                          selectedClip === clip.id
                            ? "bg-primary/80 ring-2 ring-primary"
                            : "bg-primary/60 hover:bg-primary/70"
                        }`}
                        style={{
                          left: `${clip.startTime * pixelsPerSecond}px`,
                          width: `${clip.duration * pixelsPerSecond}px`,
                          minWidth: "40px",
                        }}
                        onMouseDown={(e) => handleClipMouseDown(clip.id, e)}
                        onClick={() => setSelectedClip(clip.id)}
                      >
                        <div className="px-2 py-1 text-xs font-medium text-primary-foreground truncate">
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

        {/* Clip Controls */}
        {selectedClip && (
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{clips.find((c) => c.id === selectedClip)?.name}</span>
            <Button variant="destructive" size="sm" onClick={() => deleteClip(selectedClip)} className="h-7 text-xs">
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Clip
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
