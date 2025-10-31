"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface CanvasPreviewProps {
  selectedTemplate?: any
  uploadedFiles?: any[]
  isPlaying?: boolean
  onPlayStateChange?: (playing: boolean) => void
  currentTime?: number
  onTimeChange?: (time: number) => void
}

export default function CanvasPreview({
  selectedTemplate,
  uploadedFiles = [],
  isPlaying = false,
  onPlayStateChange,
  currentTime = 0,
  onTimeChange,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number>()
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 1920
    canvas.height = 1080

    renderFrame(ctx, canvas.width, canvas.height)
  }, [selectedTemplate, uploadedFiles])

  const renderFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#0f0f0f"
    ctx.fillRect(0, 0, width, height)

    if (selectedTemplate) {
      ctx.fillStyle = "#6366f1"
      ctx.font = "48px Arial"
      ctx.textAlign = "center"
      ctx.fillText(selectedTemplate.name || "Template Preview", width / 2, height / 2)

      ctx.font = "24px Arial"
      ctx.fillStyle = "#a3a3a3"
      ctx.fillText(
        `${selectedTemplate.duration || 5}s • ${selectedTemplate.resolution?.width || 1920}x${selectedTemplate.resolution?.height || 1080}`,
        width / 2,
        height / 2 + 60,
      )
    }

    if (uploadedFiles.length > 0) {
      ctx.fillStyle = "#404040"
      ctx.fillRect(20, 20, width - 40, 100)

      ctx.fillStyle = "#ffffff"
      ctx.font = "16px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`Loaded: ${uploadedFiles.length} file(s)`, 40, 50)

      uploadedFiles.slice(0, 3).forEach((file, index) => {
        ctx.fillStyle = "#a3a3a3"
        ctx.font = "12px Arial"
        ctx.fillText(`• ${file.name}`, 40, 75 + index * 20)
      })
    }

    ctx.strokeStyle = "#ec4899"
    ctx.lineWidth = 3
    const playheadX = (currentTime / (duration || 5)) * width
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, height)
    ctx.stroke()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const animate = () => {
      renderFrame(ctx, canvas.width, canvas.height)

      if (isPlaying) {
        const newTime = currentTime + 0.016 // ~60fps
        if (newTime >= (duration || 5)) {
          onPlayStateChange?.(false)
        } else {
          onTimeChange?.(newTime)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, currentTime, duration, selectedTemplate, uploadedFiles])

  const handlePlayPause = () => {
    onPlayStateChange?.(!isPlaying)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (videoRef.current) {
      videoRef.current.volume = value[0]
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * (duration || 5)

    onTimeChange?.(Math.max(0, Math.min(newTime, duration || 5)))
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Canvas Preview */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-border/40 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onClick={handleTimelineClick}
          className="w-full h-full object-contain cursor-pointer"
          style={{ aspectRatio: "16/9" }}
        />
      </div>

      {/* Hidden video element for audio playback */}
      <video ref={videoRef} className="hidden" />

      {/* Playback Controls */}
      <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-border/40">
        {/* Play/Pause and Time Display */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePlayPause} className="h-10 w-10 bg-transparent">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <div className="flex-1">
            <Slider
              value={[currentTime]}
              max={duration || 5}
              step={0.016}
              onValueChange={(value) => onTimeChange?.(value[0])}
              className="w-full"
            />
          </div>

          <div className="text-sm text-muted-foreground font-mono min-w-24 text-right">
            {Math.floor(currentTime)}s / {Math.floor(duration || 5)}s
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="h-8 w-8">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-32"
          />
        </div>
      </div>
    </div>
  )
}
