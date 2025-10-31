export interface TemplateMetadata {
  id: string
  name: string
  type: "motion" | "fcp" | "aep" | "generic"
  duration: number
  resolution: { width: number; height: number }
  frameRate: number
  layers: TemplateLayer[]
  effects: TemplateEffect[]
  text: TemplateText[]
  properties: Record<string, any>
}

export interface TemplateLayer {
  id: string
  name: string
  type: "video" | "image" | "text" | "shape" | "adjustment"
  startTime: number
  duration: number
  opacity: number
  blendMode: string
  properties: Record<string, any>
}

export interface TemplateEffect {
  id: string
  name: string
  type: string
  parameters: Record<string, any>
}

export interface TemplateText {
  id: string
  content: string
  fontFamily: string
  fontSize: number
  color: string
  position: { x: number; y: number }
  alignment: string
}

export async function parseFinalCutProXML(xmlContent: string): Promise<TemplateMetadata> {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      throw new Error("Invalid XML format")
    }

    const project = xmlDoc.getElementsByTagName("project")[0]
    const sequence = xmlDoc.getElementsByTagName("sequence")[0]

    const metadata: TemplateMetadata = {
      id: `fcp-${Date.now()}`,
      name: project?.getAttribute("name") || "Final Cut Pro Template",
      type: "fcp",
      duration: Number.parseFloat(sequence?.getAttribute("duration") || "0") / 30, // Convert frames to seconds
      resolution: {
        width: Number.parseInt(sequence?.getAttribute("width") || "1920"),
        height: Number.parseInt(sequence?.getAttribute("height") || "1080"),
      },
      frameRate: Number.parseInt(sequence?.getAttribute("framerate") || "30"),
      layers: [],
      effects: [],
      text: [],
      properties: {},
    }

    const clips = xmlDoc.getElementsByTagName("clip")
    Array.from(clips).forEach((clip, index) => {
      const layer: TemplateLayer = {
        id: `layer-${index}`,
        name: clip.getAttribute("name") || `Clip ${index}`,
        type: "video",
        startTime: Number.parseFloat(clip.getAttribute("start") || "0") / 30,
        duration: Number.parseFloat(clip.getAttribute("duration") || "0") / 30,
        opacity: 1,
        blendMode: "normal",
        properties: {
          offset: clip.getAttribute("offset"),
          retime: clip.getAttribute("retime"),
        },
      }
      metadata.layers.push(layer)
    })

    const effects = xmlDoc.getElementsByTagName("effect")
    Array.from(effects).forEach((effect, index) => {
      const templateEffect: TemplateEffect = {
        id: `effect-${index}`,
        name: effect.getAttribute("name") || "Effect",
        type: effect.getAttribute("type") || "unknown",
        parameters: {},
      }
      metadata.effects.push(templateEffect)
    })

    return metadata
  } catch (error) {
    console.error("[v0] FCP XML parsing error:", error)
    throw new Error(`Failed to parse Final Cut Pro template: ${error}`)
  }
}

export async function parseAppleMotionFile(file: File): Promise<TemplateMetadata> {
  try {
    const arrayBuffer = await file.arrayBuffer()

    const metadata: TemplateMetadata = {
      id: `motion-${Date.now()}`,
      name: file.name.replace(".motn", ""),
      type: "motion",
      duration: 5, // Default duration
      resolution: { width: 1920, height: 1080 },
      frameRate: 30,
      layers: [
        {
          id: "motion-layer-1",
          name: "Motion Template",
          type: "video",
          startTime: 0,
          duration: 5,
          opacity: 1,
          blendMode: "normal",
          properties: { source: file.name },
        },
      ],
      effects: [],
      text: [],
      properties: {
        fileSize: file.size,
        lastModified: new Date(file.lastModified),
      },
    }

    return metadata
  } catch (error) {
    console.error("[v0] Motion file parsing error:", error)
    throw new Error(`Failed to parse Apple Motion template: ${error}`)
  }
}

export async function parseAfterEffectsFile(jsonContent: string): Promise<TemplateMetadata> {
  try {
    const data = JSON.parse(jsonContent)

    const metadata: TemplateMetadata = {
      id: `aep-${Date.now()}`,
      name: data.name || "After Effects Template",
      type: "aep",
      duration: data.duration || 10,
      resolution: {
        width: data.width || 1920,
        height: data.height || 1080,
      },
      frameRate: data.frameRate || 30,
      layers: [],
      effects: [],
      text: [],
      properties: data.properties || {},
    }

    if (Array.isArray(data.layers)) {
      metadata.layers = data.layers.map((layer: any, index: number) => ({
        id: `layer-${index}`,
        name: layer.name || `Layer ${index}`,
        type: layer.type || "video",
        startTime: layer.startTime || 0,
        duration: layer.duration || 5,
        opacity: layer.opacity || 1,
        blendMode: layer.blendMode || "normal",
        properties: layer.properties || {},
      }))
    }

    if (Array.isArray(data.effects)) {
      metadata.effects = data.effects.map((effect: any, index: number) => ({
        id: `effect-${index}`,
        name: effect.name || "Effect",
        type: effect.type || "unknown",
        parameters: effect.parameters || {},
      }))
    }

    if (Array.isArray(data.text)) {
      metadata.text = data.text.map((text: any, index: number) => ({
        id: `text-${index}`,
        content: text.content || "",
        fontFamily: text.fontFamily || "Arial",
        fontSize: text.fontSize || 24,
        color: text.color || "#ffffff",
        position: text.position || { x: 0, y: 0 },
        alignment: text.alignment || "left",
      }))
    }

    return metadata
  } catch (error) {
    console.error("[v0] AE JSON parsing error:", error)
    throw new Error(`Failed to parse After Effects template: ${error}`)
  }
}

export async function parseTemplate(file: File): Promise<TemplateMetadata> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith(".motn")) {
    return parseAppleMotionFile(file)
  }

  if (fileName.endsWith(".fcp") || fileName.endsWith(".fcpxml")) {
    const content = await file.text()
    return parseFinalCutProXML(content)
  }

  if (fileName.endsWith(".aep.json")) {
    const content = await file.text()
    return parseAfterEffectsFile(content)
  }

  throw new Error(`Unsupported template format: ${file.type}`)
}

export async function extractVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
      URL.revokeObjectURL(url)
    }

    video.onerror = () => {
      reject(new Error("Failed to load video metadata"))
      URL.revokeObjectURL(url)
    }

    video.src = url
  })
}
