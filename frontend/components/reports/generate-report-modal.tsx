"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, File, X } from "lucide-react"
import { mockRepos } from "@/lib/mock-data"

interface GenerateReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateReportModal({ open, onOpenChange }: GenerateReportModalProps) {
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["PDF"])

  const frameworks = [
    { id: "soc2", label: "SOC 2", description: "Service Organization Control 2" },
    { id: "hipaa", label: "HIPAA", description: "Health Insurance Portability and Accountability Act" },
    { id: "iso27001", label: "ISO 27001", description: "Information Security Management" },
    { id: "custom", label: "Custom", description: "Custom compliance framework" },
  ]

  const formats = [
    { id: "PDF", label: "PDF", icon: FileText },
    { id: "Markdown", label: "Markdown", icon: File },
    { id: "Google Doc", label: "Google Doc", icon: FileText },
  ]

  const handleFrameworkToggle = (frameworkId: string) => {
    setSelectedFrameworks((prev) =>
      prev.includes(frameworkId) ? prev.filter((id) => id !== frameworkId) : [...prev, frameworkId],
    )
  }

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats((prev) => (prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId]))
  }

  const handleGenerate = () => {
    // Handle report generation
    console.log({
      repo: selectedRepo,
      frameworks: selectedFrameworks,
      formats: selectedFormats,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Generate New Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Repository Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Repository</Label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                {mockRepos.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Framework Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Compliance Frameworks</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {frameworks.map((framework) => (
                <div
                  key={framework.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedFrameworks.includes(framework.id)
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => handleFrameworkToggle(framework.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedFrameworks.includes(framework.id)}
                      onChange={() => handleFrameworkToggle(framework.id)}
                    />
                    <div>
                      <div className="font-medium text-white">{framework.label}</div>
                      <div className="text-sm text-gray-400">{framework.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selectedFrameworks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFrameworks.map((frameworkId) => {
                  const framework = frameworks.find((f) => f.id === frameworkId)
                  return (
                    <Badge key={frameworkId} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {framework?.label}
                      <button
                        onClick={() => handleFrameworkToggle(frameworkId)}
                        className="ml-2 hover:bg-purple-500/30 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Output Formats</Label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((format) => (
                <div
                  key={format.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedFormats.includes(format.id)
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => handleFormatToggle(format.id)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <format.icon className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-medium text-white">{format.label}</span>
                    <Checkbox
                      checked={selectedFormats.includes(format.id)}
                      onChange={() => handleFormatToggle(format.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-gray-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedRepo || selectedFrameworks.length === 0 || selectedFormats.length === 0}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            <Play className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
