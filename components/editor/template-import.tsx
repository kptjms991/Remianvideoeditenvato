"use client"

import type React from "react"

import { useState } from "react"
import { FileJson, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { parseTemplate, type TemplateMetadata } from "@/lib/template-parser"

interface TemplateImportProps {
  onTemplateImport?: (template: TemplateMetadata) => void
}

export default function TemplateImport({ onTemplateImport }: TemplateImportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [importedTemplate, setImportedTemplate] = useState<TemplateMetadata | null>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const template = await parseTemplate(file)
      setImportedTemplate(template)
      toast({
        description: `Template "${template.name}" imported successfully`,
      })
      if (onTemplateImport) {
        onTemplateImport(template)
      }
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Failed to import template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Professional Templates</CardTitle>
          <CardDescription>
            Import templates from Apple Motion (.motn), Final Cut Pro (.fcp), or After Effects (.aep)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <FileJson className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Click to select template file</span>
              <span className="text-xs text-muted-foreground">.motn, .fcp, .fcpxml, or .aep.json</span>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".motn,.fcp,.fcpxml,.aep.json"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-foreground">Parsing template...</span>
            </div>
          )}

          {importedTemplate && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-foreground">Template Imported</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Name: {importedTemplate.name}</p>
                <p>Type: {importedTemplate.type.toUpperCase()}</p>
                <p>Duration: {importedTemplate.duration.toFixed(2)}s</p>
                <p>
                  Resolution: {importedTemplate.resolution.width}x{importedTemplate.resolution.height}
                </p>
                <p>Layers: {importedTemplate.layers.length}</p>
                <p>Effects: {importedTemplate.effects.length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
