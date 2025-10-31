export interface EnvatoTemplate {
  id: string
  name: string
  category: "video" | "photo" | "graphics" | "audio"
  thumbnail: string
  preview: string
  duration?: string
  resolution?: string
  tags: string[]
  downloads: number
  rating: number
  price: number
  url: string
  author: string
}

export interface EnvatoSearchParams {
  query?: string
  category?: string
  page?: number
  per_page?: number
}

const ENVATO_API_BASE = "https://api.elements.envato.com/v2"

export async function searchEnvatoTemplates(params: EnvatoSearchParams): Promise<EnvatoTemplate[]> {
  const token = process.env.ENVATO_API_TOKEN

  if (!token) {
    console.warn("ENVATO_API_TOKEN not configured, returning mock templates")
    return getMockTemplates(params)
  }

  try {
    const queryParams = new URLSearchParams({
      query: params.query || "",
      category: params.category || "videohive",
      page: String(params.page || 1),
      per_page: String(params.per_page || 12),
    })

    const response = await fetch(`${ENVATO_API_BASE}/search/search?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Envato API error: ${response.status}`)
    }

    const data = await response.json()
    return parseEnvatoResponse(data, params.category || "videohive")
  } catch (error) {
    console.error("Envato API error:", error)
    return getMockTemplates(params)
  }
}

export async function getTemplateDetails(templateId: string): Promise<EnvatoTemplate | null> {
  const token = process.env.ENVATO_API_TOKEN

  if (!token) {
    return getMockTemplates({ query: templateId })[0] || null
  }

  try {
    const response = await fetch(`${ENVATO_API_BASE}/market/item:videohive:${templateId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return parseTemplateDetail(data)
  } catch (error) {
    console.error("Failed to fetch template details:", error)
    return null
  }
}

function parseEnvatoResponse(data: any, category: string): EnvatoTemplate[] {
  const categoryMap = {
    videohive: "video",
    photodune: "photo",
    graphicriver: "graphics",
    audiojungle: "audio",
  }

  const type = categoryMap[category as keyof typeof categoryMap] || "video"

  return (data.results || []).map((item: any) => ({
    id: item.id.toString(),
    name: item.name || item.title,
    category: type,
    thumbnail: item.thumbnail_url,
    preview: item.preview_url || item.thumbnail_url,
    duration: item.duration || "10s",
    resolution: item.resolution || "1080p",
    tags: item.tags || [],
    downloads: item.number_of_purchases || 0,
    rating: item.rating?.rating || 4.5,
    price: item.price_cents ? item.price_cents / 100 : 0,
    url: item.url,
    author: item.author_username || "Unknown",
  }))
}

function parseTemplateDetail(data: any): EnvatoTemplate {
  return {
    id: data.id.toString(),
    name: data.name || data.title,
    category: "video",
    thumbnail: data.thumbnail_url,
    preview: data.preview_url || data.thumbnail_url,
    duration: data.duration || "10s",
    resolution: data.resolution || "1080p",
    tags: data.tags || [],
    downloads: data.number_of_purchases || 0,
    rating: data.rating?.rating || 4.5,
    price: data.price_cents ? data.price_cents / 100 : 0,
    url: data.url,
    author: data.author_username || "Unknown",
  }
}

function getMockTemplates(params: EnvatoSearchParams): EnvatoTemplate[] {
  const templates: EnvatoTemplate[] = [
    {
      id: "1",
      name: "Modern Intro Pack",
      category: "video",
      thumbnail: "/placeholder.svg?height=120&width=160",
      preview: "/placeholder.svg?height=720&width=1280",
      duration: "5s",
      resolution: "4K",
      tags: ["intro", "modern", "animation"],
      downloads: 1250,
      rating: 4.8,
      price: 29,
      url: "https://videohive.net/item/1",
      author: "Premium Creator",
    },
    {
      id: "2",
      name: "Cinematic Transitions",
      category: "video",
      thumbnail: "/placeholder.svg?height=120&width=160",
      preview: "/placeholder.svg?height=720&width=1280",
      duration: "2s",
      resolution: "4K",
      tags: ["transition", "cinematic", "smooth"],
      downloads: 890,
      rating: 4.9,
      price: 19,
      url: "https://videohive.net/item/2",
      author: "Motion Designer",
    },
    {
      id: "3",
      name: "Social Media Pack",
      category: "video",
      thumbnail: "/placeholder.svg?height=120&width=160",
      preview: "/placeholder.svg?height=720&width=1280",
      duration: "15s",
      resolution: "1080p",
      tags: ["social", "pack", "trending"],
      downloads: 2100,
      rating: 4.7,
      price: 39,
      url: "https://videohive.net/item/3",
      author: "Content Creator",
    },
  ]

  if (params.query) {
    return templates.filter((t) => t.name.toLowerCase().includes(params.query!.toLowerCase()))
  }

  return templates
}
