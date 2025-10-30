"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Type, Sparkles, Palette, Copy, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface TextStyle {
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: "normal" | "bold" | "lighter"
  color: string
  alignment: "left" | "center" | "right"
  shadowColor: string
  shadowBlur: number
}

interface VisualStyle {
  opacity: number
  rotation: number
  scale: number
  positionX: number
  positionY: number
}

const EFFECTS = [
  { name: "Fade In", duration: 0.5, category: "transition" },
  { name: "Fade Out", duration: 0.5, category: "transition" },
  { name: "Slide Left", duration: 0.6, category: "transition" },
  { name: "Slide Right", duration: 0.6, category: "transition" },
  { name: "Zoom In", duration: 0.5, category: "transition" },
  { name: "Zoom Out", duration: 0.5, category: "transition" },
  { name: "Blur", duration: 0.3, category: "effect" },
  { name: "Glow", duration: 0.4, category: "effect" },
  { name: "Shake", duration: 0.5, category: "effect" },
  { name: "Bounce", duration: 0.6, category: "effect" },
  { name: "Flip", duration: 0.4, category: "effect" },
  { name: "Rotate", duration: 0.5, category: "effect" },
]

const FONT_FAMILIES = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"]

export default function EditingPanel() {
  const [textStyle, setTextStyle] = useState<TextStyle>({
    content: "Add your text here",
    fontSize: 24,
    fontFamily: "Arial",
    fontWeight: "normal",
    color: "#ffffff",
    alignment: "center",
    shadowColor: "#000000",
    shadowBlur: 0,
  })

  const [visualStyle, setVisualStyle] = useState<VisualStyle>({
    opacity: 100,
    rotation: 0,
    scale: 100,
    positionX: 0,
    positionY: 0,
  })

  const [appliedEffects, setAppliedEffects] = useState<string[]>([])
  const [textExpanded, setTextExpanded] = useState(true)
  const [visualExpanded, setVisualExpanded] = useState(true)

  const addEffect = (effectName: string) => {
    setAppliedEffects([...appliedEffects, effectName])
  }

  const removeEffect = (index: number) => {
    setAppliedEffects(appliedEffects.filter((_, i) => i !== index))
  }

  const duplicateEffect = (index: number) => {
    const effect = appliedEffects[index]
    setAppliedEffects([...appliedEffects.slice(0, index + 1), effect, ...appliedEffects.slice(index + 1)])
  }

  return (
    <div className="flex flex-col h-full bg-secondary/20 overflow-y-auto">
      <Tabs defaultValue="text" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border/40 bg-transparent p-0 h-auto">
          <TabsTrigger
            value="text"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-1"
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger
            value="effects"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Effects
          </TabsTrigger>
          <TabsTrigger
            value="visual"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-1"
          >
            <Palette className="w-4 h-4 mr-2" />
            Visual
          </TabsTrigger>
        </TabsList>

        {/* Text Tab */}
        <TabsContent value="text" className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Text Content */}
          <Collapsible open={textExpanded} onOpenChange={setTextExpanded}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-secondary/30 px-2 rounded">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Text Content</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${textExpanded ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <Input
                value={textStyle.content}
                onChange={(e) => setTextStyle({ ...textStyle, content: e.target.value })}
                className="bg-background border-border/40"
                placeholder="Enter text..."
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Font Settings */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-secondary/30 px-2 rounded">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Font</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Font Family</label>
                <select
                  value={textStyle.fontFamily}
                  onChange={(e) => setTextStyle({ ...textStyle, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border/40 rounded text-sm text-foreground"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Font Size</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="96"
                    value={textStyle.fontSize}
                    onChange={(e) => setTextStyle({ ...textStyle, fontSize: Number(e.target.value) })}
                    className="flex-1 h-2 bg-secondary rounded-lg"
                  />
                  <span className="text-sm text-foreground w-12">{textStyle.fontSize}px</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Font Weight</label>
                <div className="flex gap-2">
                  {(["lighter", "normal", "bold"] as const).map((weight) => (
                    <Button
                      key={weight}
                      variant={textStyle.fontWeight === weight ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextStyle({ ...textStyle, fontWeight: weight })}
                      className="flex-1 text-xs capitalize"
                    >
                      {weight}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Alignment</label>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((align) => (
                    <Button
                      key={align}
                      variant={textStyle.alignment === align ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTextStyle({ ...textStyle, alignment: align })}
                      className="flex-1 text-xs capitalize"
                    >
                      {align}
                    </Button>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Color Settings */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-secondary/30 px-2 rounded">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Colors</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textStyle.color}
                    onChange={(e) => setTextStyle({ ...textStyle, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-foreground flex-1">{textStyle.color}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Shadow Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textStyle.shadowColor}
                    onChange={(e) => setTextStyle({ ...textStyle, shadowColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-foreground flex-1">{textStyle.shadowColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Shadow Blur</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={textStyle.shadowBlur}
                  onChange={(e) => setTextStyle({ ...textStyle, shadowBlur: Number(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Applied Effects */}
          {appliedEffects.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Applied Effects</label>
              <div className="space-y-2">
                {appliedEffects.map((effect, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-background rounded border border-border/40"
                  >
                    <span className="text-sm text-foreground">{effect}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => duplicateEffect(index)} className="h-6 w-6">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeEffect(index)} className="h-6 w-6">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effect Categories */}
          {["transition", "effect"].map((category) => (
            <div key={category}>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block capitalize">
                {category}s
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EFFECTS.filter((e) => e.category === category).map((effect) => (
                  <Button
                    key={effect.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addEffect(effect.name)}
                    className="text-xs justify-start"
                  >
                    {effect.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Visual Tab */}
        <TabsContent value="visual" className="flex-1 p-4 space-y-4 overflow-y-auto">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-secondary/30 px-2 rounded">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Transform</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Opacity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={visualStyle.opacity}
                    onChange={(e) => setVisualStyle({ ...visualStyle, opacity: Number(e.target.value) })}
                    className="flex-1 h-2 bg-secondary rounded-lg"
                  />
                  <span className="text-sm text-foreground w-12">{visualStyle.opacity}%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Rotation</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={visualStyle.rotation}
                    onChange={(e) => setVisualStyle({ ...visualStyle, rotation: Number(e.target.value) })}
                    className="flex-1 h-2 bg-secondary rounded-lg"
                  />
                  <span className="text-sm text-foreground w-12">{visualStyle.rotation}°</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Scale</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={visualStyle.scale}
                    onChange={(e) => setVisualStyle({ ...visualStyle, scale: Number(e.target.value) })}
                    className="flex-1 h-2 bg-secondary rounded-lg"
                  />
                  <span className="text-sm text-foreground w-12">{visualStyle.scale}%</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-secondary/30 px-2 rounded">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Position</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">X Position</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={visualStyle.positionX}
                  onChange={(e) => setVisualStyle({ ...visualStyle, positionX: Number(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Y Position</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={visualStyle.positionY}
                  onChange={(e) => setVisualStyle({ ...visualStyle, positionY: Number(e.target.value) })}
                  className="w-full h-2 bg-secondary rounded-lg"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="p-4 border-t border-border/40 flex-shrink-0">
        <Button className="w-full">Export Project</Button>
      </div>
    </div>
  )
}
