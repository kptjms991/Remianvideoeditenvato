import { type NextRequest, NextResponse } from "next/server"

interface ProcessRequest {
  clips: Array<{
    id: string
    url: string
    startTime: number
    duration: number
    effects: Array<{
      type: string
      parameters: Record<string, any>
    }>
  }>
  resolution: { width: number; height: number }
  frameRate: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessRequest = await request.json()

    if (!Array.isArray(body.clips) || body.clips.length === 0) {
      return NextResponse.json({ error: "No clips provided" }, { status: 400 })
    }

    const processedClips = body.clips.map((clip) => ({
      id: clip.id,
      url: clip.url,
      startTime: clip.startTime,
      duration: clip.duration,
      effects: processEffects(clip.effects),
      metadata: {
        processed: true,
        timestamp: new Date(),
      },
    }))

    const resolution = body.resolution || { width: 1920, height: 1080 }
    const frameRate = body.frameRate || 30

    console.log("[v0] Processing clips:", {
      clipCount: processedClips.length,
      resolution,
      frameRate,
    })

    return NextResponse.json({
      success: true,
      clips: processedClips,
      composition: {
        resolution,
        frameRate,
        duration: calculateTotalDuration(processedClips),
      },
    })
  } catch (error) {
    console.error("[v0] Processing error:", error)
    return NextResponse.json({ error: "Failed to process clips" }, { status: 500 })
  }
}

function processEffects(effects: Array<{ type: string; parameters: Record<string, any> }>) {
  return effects.map((effect) => ({
    type: effect.type,
    parameters: effect.parameters,
    applied: true,
  }))
}

function calculateTotalDuration(clips: any[]): number {
  if (clips.length === 0) return 0
  const maxEnd = Math.max(...clips.map((c) => c.startTime + c.duration))
  return maxEnd
}
