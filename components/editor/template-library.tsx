"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, Download, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const MOCK_TEMPLATES = [
  {
    id: 1,
    name: "Modern Intro",
    category: "video",
    thumbnail: "/placeholder.svg?height=120&width=160",
    duration: "5s",
    resolution: "4K",
    tags: ["intro", "modern", "animation"],
    downloads: 1250,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Cinematic Transition",
    category: "video",
    thumbnail: "/placeholder.svg?height=120&width=160",
    duration: "2s",
    resolution: "4K",
    tags: ["transition", "cinematic", "smooth"],
    downloads: 890,
    rating: 4.9,
  },
  {
    id: 3,
    name: "Social Media Pack",
    category: "video",
    thumbnail: "/placeholder.svg?height=120&width=160",
    duration: "15s",
    resolution: "1080p",
    tags: ["social", "pack", "trending"],
    downloads: 2100,
    rating: 4.7,
  },
  {
    id: 4,
    name: "Photo Slideshow",
    category: "photo",
    thumbnail: "/placeholder.svg?height=120&width=160",
    duration: "30s",
    resolution: "4K",
    tags: ["slideshow", "photo", "elegant"],
    downloads: 1560,
    rating: 4.6,
  },
  {
    id: 5,
    name: "Graphic Overlay",
    category: "graphics",
    thumbnail: "/placeholder.svg?height=120&width=160",
    duration: "3s",
    resolution: "1080p",
    tags: ["overlay", "graphic", "modern"],
    downloads: 945,
    rating: 4.5,
  },
  {
    id: 6,
    name: "Title Animation",
    category: "graphics",
    thumbnail: "/placeholder.svg?height=120&width=160",
    duration: "4s",
    resolution: "4K",
    tags: ["title", "text", "animation"],
    downloads: 1780,
    rating: 4.8,
  },
]

export default function TemplateLibrary({ onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState(new Set())
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const filteredTemplates = MOCK_TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template)
    setSelectedTemplate(null)
  }

  return (
    <div className="flex flex-col h-full bg-secondary/20">
      {/* Header */}
      <div className="p-4 border-b border-border/40 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Templates</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border/40"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "video", "photo", "graphics"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-xs text-muted-foreground">{filteredTemplates.length} templates found</p>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden group">
                  <img
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTemplate(template)
                        setPreviewOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectTemplate(template)
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {template.resolution}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {template.duration}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(template.id)
                      }}
                      className="flex-shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          favorites.has(template.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 flex-wrap">
                    {template.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>{template.downloads.toLocaleString()} downloads</span>
                    <span>⭐ {template.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No templates found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedTemplate.thumbnail || "/placeholder.svg"}
                  alt={selectedTemplate.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">{selectedTemplate.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resolution</p>
                  <p className="font-medium text-foreground">{selectedTemplate.resolution}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Downloads</p>
                  <p className="font-medium text-foreground">{selectedTemplate.downloads.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-medium text-foreground">⭐ {selectedTemplate.rating}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Tags</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  handleSelectTemplate(selectedTemplate)
                  setPreviewOpen(false)
                }}
              >
                Use This Template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
