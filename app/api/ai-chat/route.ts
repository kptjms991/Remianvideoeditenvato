import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Define editing tools that AI can use
const editTextTool = tool({
  description: "Edit text content in the video (add, change, or update text)",
  inputSchema: z.object({
    text: z.string().describe("The text content to add or modify"),
    fontSize: z.number().optional().describe("Font size in pixels"),
    color: z.string().optional().describe("Text color in hex format"),
    position: z.enum(["top", "center", "bottom"]).optional().describe("Position on screen"),
  }),
})

const applyEffectTool = tool({
  description: "Apply visual effects to the video",
  inputSchema: z.object({
    effectType: z
      .enum([
        "blur",
        "brightness",
        "contrast",
        "grayscale",
        "sepia",
        "saturate",
        "hue-rotate",
        "invert",
        "fade",
        "zoom",
        "slide",
        "glow",
      ])
      .describe("Type of effect to apply"),
    intensity: z.number().min(0).max(100).describe("Effect intensity (0-100)"),
    duration: z.number().optional().describe("Duration in seconds"),
  }),
})

const adjustClipTool = tool({
  description: "Adjust clip properties like duration, speed, or opacity",
  inputSchema: z.object({
    property: z.enum(["duration", "speed", "opacity", "rotation", "scale"]).describe("Property to adjust"),
    value: z.number().describe("New value for the property"),
  }),
})

const addTransitionTool = tool({
  description: "Add transition effects between clips",
  inputSchema: z.object({
    transitionType: z.enum(["fade", "slide", "wipe", "dissolve", "zoom"]).describe("Type of transition"),
    duration: z.number().describe("Transition duration in seconds"),
  }),
})

const tools = {
  editText: editTextTool,
  applyEffect: applyEffectTool,
  adjustClip: adjustClipTool,
  addTransition: addTransitionTool,
} as const

export async function POST(req: Request) {
  const body = await req.json()
  const messages: UIMessage[] = body.messages

  const systemPrompt = `You are an expert video editing assistant for a professional video editing platform. 
Your role is to help users edit their videos by:
1. Understanding their editing requests in natural language
2. Suggesting specific edits using the available tools
3. Providing real-time feedback on changes
4. Offering creative suggestions for improvements

When a user asks for edits, use the appropriate tools to make changes. Be proactive in suggesting improvements and explain what you're doing.
Always confirm changes and ask if the user wants further adjustments.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    tools,
    maxOutputTokens: 1024,
  })

  return result.toUIMessageStreamResponse()
}
