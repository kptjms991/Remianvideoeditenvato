import { getTemplateDetails } from "@/lib/envato-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("id")

    if (!templateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Template ID is required",
        },
        { status: 400 },
      )
    }

    const template = await getTemplateDetails(templateId)

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error("Template details error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch template details",
      },
      { status: 500 },
    )
  }
}
