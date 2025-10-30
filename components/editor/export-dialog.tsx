"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName?: string
}

const EXPORT_FORMATS = [
  { id: "mp4", name: "MP4 (H.264)", extension: ".mp4", description: "Best for web and social media" },
  { id: "webm", name: "WebM (VP9)", extension: ".webm", description: "Modern web format" },
  { id: "mov", name: "MOV (ProRes)", extension: ".mov", description: "Professional editing format" },
  { id: "gif", name: "GIF", extension: ".gif", description: "Animated GIF format" },
]

const QUALITY_PRESETS = [
  { id: "low", name: "Low (480p)", bitrate: "2000k", resolution: "854x480" },
  { id: "medium", name: "Medium (720p)", bitrate: "5000k", resolution: "1280x720" },
  { id: "high", name: "High (1080p)", bitrate: "8000k", resolution: "1920x1080" },
  { id: "4k", name: "4K (2160p)", bitrate: "15000k", resolution: "3840x2160" },
]

export default function ExportDialog({ open, onOpenChange, projectName = "project" }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState("mp4")
  const [selectedQuality, setSelectedQuality] = useState("high")
  const [fileName, setFileName] = useState(projectName)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStep, setExportStep] = useState("")

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export process with steps
      const steps = [
        { name: "Preparing project...", duration: 1000 },
        { name: "Encoding video...", duration: 3000 },
        { name: "Processing audio...", duration: 1500 },
        { name: "Applying effects...", duration: 2000 },
        { name: "Finalizing export...", duration: 1000 },
      ]

      let currentProgress = 0
      const progressPerStep = 100 / steps.length

      for (const step of steps) {
        setExportStep(step.name)
        const startProgress = currentProgress
        const startTime = Date.now()

        while (Date.now() - startTime < step.duration) {
          const elapsed = Date.now() - startTime
          const stepProgress = (elapsed / step.duration) * progressPerStep
          setExportProgress(Math.min(startProgress + stepProgress, currentProgress + progressPerStep))
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        currentProgress += progressPerStep
        setExportProgress(currentProgress)
      }

      // Simulate download
      setExportStep("Downloading file...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create a mock download
      const format = EXPORT_FORMATS.find((f) => f.id === selectedFormat)
      const quality = QUALITY_PRESETS.find((q) => q.id === selectedQuality)
      const fileContent = `Mock video file: ${fileName}${format?.extension}\nQuality: ${quality?.name}\nFormat: ${format?.name}`
      const blob = new Blob([fileContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${fileName}${format?.extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setExportProgress(100)
      setExportStep("Export complete!")

      setTimeout(() => {
        onOpenChange(false)
        setIsExporting(false)
        setExportProgress(0)
        setExportStep("")
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>Choose format, quality, and download your video</DialogDescription>
        </DialogHeader>

        {!isExporting ? (
          <div className="space-y-6">
            {/* File Name */}
            <div className="space-y-2">
              <Label htmlFor="filename" className="text-sm font-semibold">
                File Name
              </Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="bg-background border-border/40"
              />
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Export Format</Label>
              <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
                <div className="grid grid-cols-2 gap-3">
                  {EXPORT_FORMATS.map((format) => (
                    <div
                      key={format.id}
                      className="flex items-start space-x-2 p-3 border border-border/40 rounded-lg hover:bg-secondary/20 cursor-pointer"
                    >
                      <RadioGroupItem value={format.id} id={format.id} className="mt-1" />
                      <Label htmlFor={format.id} className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">{format.name}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Quality Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Quality</Label>
              <RadioGroup value={selectedQuality} onValueChange={setSelectedQuality}>
                <div className="grid grid-cols-2 gap-3">
                  {QUALITY_PRESETS.map((quality) => (
                    <div
                      key={quality.id}
                      className="flex items-start space-x-2 p-3 border border-border/40 rounded-lg hover:bg-secondary/20 cursor-pointer"
                    >
                      <RadioGroupItem value={quality.id} id={`quality-${quality.id}`} className="mt-1" />
                      <Label htmlFor={`quality-${quality.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">{quality.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {quality.resolution} • {quality.bitrate}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Export Info */}
            <div className="bg-secondary/20 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">{EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quality:</span>
                <span className="font-medium">{QUALITY_PRESETS.find((q) => q.id === selectedQuality)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">File Name:</span>
                <span className="font-medium">
                  {fileName}
                  {EXPORT_FORMATS.find((f) => f.id === selectedFormat)?.extension}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export & Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{exportStep}</span>
                <span className="text-sm text-muted-foreground">{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing your video...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
