"use client"

import { useState } from "react"
import { Loader2, CheckCircle, AlertCircle, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface EncodingJob {
  jobId: string
  status: "queued" | "processing" | "completed" | "error"
  progress: number
  format: string
  quality: string
  estimatedTime: number
  downloadUrl?: string
}

interface VideoEncoderProps {
  clips?: any[]
  onEncodingStart?: () => void
  onEncodingComplete?: (jobId: string) => void
}

export default function VideoEncoder({ clips = [], onEncodingStart, onEncodingComplete }: VideoEncoderProps) {
  const [encodingJobs, setEncodingJobs] = useState<EncodingJob[]>([])
  const [isEncoding, setIsEncoding] = useState(false)
  const { toast } = useToast()

  const startEncoding = async (format: string, quality: string) => {
    if (clips.length === 0) {
      toast({
        description: "No clips to encode",
        variant: "destructive",
      })
      return
    }

    setIsEncoding(true)
    onEncodingStart?.()

    try {
      const response = await fetch("/api/video/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: `project-${Date.now()}`,
          format,
          quality,
          clips,
        }),
      })

      if (!response.ok) throw new Error("Encoding request failed")

      const data = await response.json()

      const newJob: EncodingJob = {
        jobId: data.jobId,
        status: "queued",
        progress: 0,
        format,
        quality,
        estimatedTime: data.estimatedTime,
      }

      setEncodingJobs((prev) => [...prev, newJob])
      toast({
        description: `Encoding started: ${format.toUpperCase()} @ ${quality}`,
      })

      simulateProgress(data.jobId)
    } catch (error) {
      toast({
        description: "Failed to start encoding",
        variant: "destructive",
      })
    } finally {
      setIsEncoding(false)
    }
  }

  const simulateProgress = async (jobId: string) => {
    let progress = 0
    const interval = setInterval(async () => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        setEncodingJobs((prev) =>
          prev.map((job) =>
            job.jobId === jobId
              ? {
                  ...job,
                  status: "completed",
                  progress: 100,
                  downloadUrl: `/downloads/${jobId}.${job.format}`,
                }
              : job,
          ),
        )

        onEncodingComplete?.(jobId)
        toast({
          description: "Video encoding completed successfully",
        })
      } else {
        setEncodingJobs((prev) =>
          prev.map((job) =>
            job.jobId === jobId ? { ...job, status: "processing", progress: Math.floor(progress) } : job,
          ),
        )
      }
    }, 1000)
  }

  return (
    <div className="space-y-4">
      {/* Encoding Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Video</CardTitle>
          <CardDescription>Choose format and quality for encoding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {["mp4", "webm", "mov", "gif"].map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  onClick={() => startEncoding(format, "1080p")}
                  disabled={isEncoding || clips.length === 0}
                  className="text-xs"
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {["480p", "720p", "1080p", "2k", "4k"].map((quality) => (
                <Button
                  key={quality}
                  variant="outline"
                  onClick={() => startEncoding("mp4", quality)}
                  disabled={isEncoding || clips.length === 0}
                  className="text-xs"
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {encodingJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Encoding Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {encodingJobs.map((job) => (
              <div key={job.jobId} className="p-3 bg-secondary/30 rounded-lg border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.status === "processing" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {job.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {job.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                    <span className="text-sm font-medium text-foreground">
                      {job.format.toUpperCase()} @ {job.quality}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{job.progress}%</span>
                </div>

                <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                </div>

                {job.status === "completed" && job.downloadUrl && (
                  <Button
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => {
                      toast({
                        description: "Download started",
                      })
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
