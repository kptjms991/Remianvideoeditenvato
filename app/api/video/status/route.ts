import { type NextRequest, NextResponse } from "next/server"

interface StatusRequest {
  jobId: string
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // In production, this would query a job queue database
    const simulatedProgress = Math.min(100, Math.floor(Math.random() * 100) + 20)
    const status = simulatedProgress === 100 ? "completed" : "processing"

    console.log("[v0] Job status check:", { jobId, progress: simulatedProgress })

    return NextResponse.json({
      jobId,
      status,
      progress: simulatedProgress,
      message:
        status === "completed"
          ? "Video encoding completed successfully"
          : `Encoding in progress: ${simulatedProgress}%`,
      estimatedTimeRemaining: status === "completed" ? 0 : Math.ceil((100 - simulatedProgress) / 10),
    })
  } catch (error) {
    console.error("[v0] Status check error:", error)
    return NextResponse.json({ error: "Failed to check job status" }, { status: 500 })
  }
}
