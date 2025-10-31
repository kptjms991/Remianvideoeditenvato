import { searchEnvatoTemplates } from "@/lib/envato-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category") || "video"
    const page = Number.parseInt(searchParams.get("page") || "1")

    const templates = await searchEnvatoTemplates({
      query,
      category: category === "video" ? "videohive" : category === "photo" ? "photodune" : "graphicriver",
      page,
      per_page: 12,
    })

    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length,
    })
  } catch (error) {
    console.error("Template search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search templates",
      },
      { status: 500 },
    )
  }
}
