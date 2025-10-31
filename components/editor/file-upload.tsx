"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  id: string
  name: string
  type: "video" | "image" | "audio"
  size: number
  duration?: number
  url: string
  uploadedAt: Date
  status: "uploading" | "completed" | "error"
  progress: number
}

interface FileUploadProps {
  onFileUpload?: (file: UploadedFile) => void
  onFilesUpload?: (files: UploadedFile[]) => void
}

export default function FileUpload({ onFileUpload, onFilesUpload }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const SUPPORTED_TYPES = {
    video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
    image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    audio: ["audio/mpeg", "audio/wav", "audio/webm", "audio/aac"],
  }

  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

  const getFileType = (mimeType: string): "video" | "image" | "audio" | null => {
    if (SUPPORTED_TYPES.video.includes(mimeType)) return "video"
    if (SUPPORTED_TYPES.image.includes(mimeType)) return "image"
    if (SUPPORTED_TYPES.audio.includes(mimeType)) return "audio"
    return null
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds 500MB limit` }
    }

    const fileType = getFileType(file.type)
    if (!fileType) {
      return { valid: false, error: `Unsupported file type: ${file.type}` }
    }

    return { valid: true }
  }

  const uploadFile = async (file: File) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      toast({
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    const fileType = getFileType(file.type)!
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: fileType,
      size: file.size,
      url: URL.createObjectURL(file), // Using blob URL for now, will integrate Vercel Blob
      uploadedAt: new Date(),
      status: "uploading",
      progress: 0,
    }

    setUploadedFiles((prev) => [...prev, newFile])

    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
      }

      if (fileType === "video") {
        const video = document.createElement("video")
        video.src = newFile.url
        video.onloadedmetadata = () => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, duration: video.duration, status: "completed", progress: 100 } : f,
            ),
          )
        }
      } else {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "completed", progress: 100 } : f)),
        )
      }

      toast({
        description: `${file.name} uploaded successfully`,
      })

      if (onFileUpload) {
        onFileUpload(newFile)
      }
    } catch (error) {
      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error", progress: 0 } : f)))
      toast({
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach((file) => uploadFile(file))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => uploadFile(file))
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Drag and drop your files here</p>
              <p className="text-sm text-muted-foreground">or click to browse (Max 500MB)</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Supported: MP4, WebM, MOV, AVI, JPEG, PNG, WebP, GIF, MP3, WAV
            </div>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="video/*,image/*,audio/*"
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                      {file.type.toUpperCase()}
                    </span>
                    {file.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {file.status === "uploading" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                      {file.duration && ` • ${Math.round(file.duration)}s`}
                    </p>
                    <p className="text-xs text-muted-foreground">{file.progress}%</p>
                  </div>
                  {file.status === "uploading" && (
                    <div className="w-full h-1 bg-border/40 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${file.progress}%` }} />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
