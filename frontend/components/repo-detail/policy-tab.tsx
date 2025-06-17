"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Code, Eye } from "lucide-react"
import type { Repo } from "@/lib/types"

interface PolicyTabProps {
  repo: Repo
}

export function PolicyTab({ repo }: PolicyTabProps) {
  const [requireReviewers, setRequireReviewers] = useState(true)
  const [reviewerCount, setReviewerCount] = useState("2")
  const [ciLogging, setCiLogging] = useState(true)
  const [secretScanning, setSecretScanning] = useState(true)
  const [yamlContent, setYamlContent] = useState(`# Compliance Policy Configuration
compliance:
  reviewers:
    required: true
    minimum_count: 2
  ci:
    logging_required: true
  security:
    secret_scanning: true
    dependency_scanning: true
  quality:
    code_coverage_threshold: 80
    test_required: true`)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Policy Configuration</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Save & Apply
        </Button>
      </div>

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="visual" className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="yaml" className="flex items-center">
            <Code className="mr-2 h-4 w-4" />
            YAML Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Code Review Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Require Code Reviews</Label>
                  <p className="text-sm text-gray-400">All pull requests must be reviewed before merging</p>
                </div>
                <Switch checked={requireReviewers} onCheckedChange={setRequireReviewers} />
              </div>

              {requireReviewers && (
                <div className="space-y-2">
                  <Label className="text-white">Minimum Reviewers</Label>
                  <Select value={reviewerCount} onValueChange={setReviewerCount}>
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="1">1 Reviewer</SelectItem>
                      <SelectItem value="2">2 Reviewers</SelectItem>
                      <SelectItem value="3">3 Reviewers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">CI/CD Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">CI Logging Required</Label>
                  <p className="text-sm text-gray-400">All CI pipelines must have comprehensive logging</p>
                </div>
                <Switch checked={ciLogging} onCheckedChange={setCiLogging} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Scanning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Secret Scanning</Label>
                  <p className="text-sm text-gray-400">Automatically scan for secrets in commits</p>
                </div>
                <Switch checked={secretScanning} onCheckedChange={setSecretScanning} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yaml" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Policy YAML Configuration</CardTitle>
              <Badge className="bg-green-600 text-white">Valid</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={yamlContent}
                  onChange={(e) => setYamlContent(e.target.value)}
                  className="w-full h-96 bg-gray-900 border border-gray-600 rounded-md p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  spellCheck={false}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">Use YAML syntax to define compliance policies</p>
                  <Button variant="outline" size="sm" className="border-gray-600">
                    Validate YAML
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
