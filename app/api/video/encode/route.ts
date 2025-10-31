import { type NextRequest, NextResponse } from "next/server"

interface EncodeRequest {
  projectId: string
  format: "mp4" | "webm" | "mov" | "gif"
  quality: "480p" | "720p" | "1080p" | "2k" | "4k"
  clips: Array<{
    id: string
    url: string
    startTime: number
    duration: number
    effects: any[]
  }>
}

const QUALITY_SETTINGS = {
  "480p": { width: 854, height: 480, bitrate: "1000k" },
  "720p": { width: 1280, height: 720, bitrate: "2500k" },
  "1080p": { width: 1920, height: 1080, bitrate: "5000k" },
  "2k": { width: 2560, height: 1440, bitrate: "8000k" },
  "4k": { width: 3840, height: 2160, bitrate: "15000k" },
}

const FORMAT_CODECS = {
  mp4: { video: "libx264", audio: "aac", ext: "mp4" },
  webm: { video: "libvpx-vp9", audio: "libopus", ext: "webm" },
  mov: { video: "prores", audio: "aac", ext: "mov" },
  gif: { video: "gif", audio: "none", ext: "gif" },
}

export async function POST(request: NextRequest) {
  try {
    const body: EncodeRequest = await request.json()

    if (!body.projectId || !body.format || !body.quality || !body.clips) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!FORMAT_CODECS[body.format] || !QUALITY_SETTINGS[body.quality]) {
      return NextResponse.json({ error: "Invalid format or quality" }, { status: 400 })
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const settings = QUALITY_SETTINGS[body.quality]
    const codec = FORMAT_CODECS[body.format]

    const jobMetadata = {
      jobId,
      projectId: body.projectId,
      format: body.format,
      quality: body.quality,
      settings,
      codec,
      clips: body.clips,
      status: "queued",
      progress: 0,
      createdAt: new Date(),
      estimatedDuration: calculateEstimatedDuration(body.clips),
    }

    console.log("[v0] Encoding job created:", jobMetadata)

    // For now, we return the job metadata and simulate processing
    return NextResponse.json({
      success: true,
      jobId,
      message: "Video encoding job queued",
      estimatedTime: jobMetadata.estimatedDuration,
      format: body.format,
      quality: body.quality,
    })
  } catch (error) {
    console.error("[v0] Encoding error:", error)
    return NextResponse.json({ error: "Failed to process encoding request" }, { status: 500 })
  }
}

function calculateEstimatedDuration(clips: any[]): number {
  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0)
  // Rough estimate: 1 second of video takes ~2-5 seconds to encode depending on quality
  return Math.ceil(totalDuration * 3)
}
