"use client"

import { Card } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function AIInstructions() {
  const examples = [
    {
      title: "Text Editing",
      examples: [
        'Add "Welcome" text at the top in large font',
        "Change the text color to red",
        "Add a subtitle at the bottom",
      ],
    },
    {
      title: "Effects",
      examples: [
        "Apply a blur effect to the background",
        "Add a fade transition between clips",
        "Make the video brighter",
      ],
    },
    {
      title: "Clip Adjustments",
      examples: ["Speed up the video by 2x", "Make the clip semi-transparent", "Rotate the video 90 degrees"],
    },
    {
      title: "Transitions",
      examples: ["Add a slide transition", "Create a zoom effect between clips", "Add a dissolve transition"],
    },
  ]

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Editing Tips</h3>
      </div>

      {examples.map((category) => (
        <Card key={category.title} className="p-3 bg-secondary/50">
          <p className="text-sm font-medium text-foreground mb-2">{category.title}</p>
          <ul className="space-y-1">
            {category.examples.map((example, idx) => (
              <li key={idx} className="text-xs text-muted-foreground">
                • {example}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}
