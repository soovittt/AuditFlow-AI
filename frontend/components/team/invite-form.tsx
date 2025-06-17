"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Send } from "lucide-react"
import { mockRepos } from "@/lib/mock-data"

interface InviteFormProps {
  onClose: () => void
}

export function InviteForm({ onClose }: InviteFormProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("")
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])

  const handleRepoToggle = (repoId: string) => {
    setSelectedRepos((prev) => (prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle invite submission
    console.log({ email, role, repos: selectedRepos })
    onClose()
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Invite Team Member</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-white">Repository Access</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mockRepos.map((repo) => (
                <div
                  key={repo.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedRepos.includes(repo.id)
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() => handleRepoToggle(repo.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{repo.name}</span>
                    {selectedRepos.includes(repo.id) && <div className="w-2 h-2 bg-purple-400 rounded-full" />}
                  </div>
                </div>
              ))}
            </div>

            {selectedRepos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRepos.map((repoId) => {
                  const repo = mockRepos.find((r) => r.id === repoId)
                  return (
                    <Badge key={repoId} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {repo?.name}
                      <button
                        type="button"
                        onClick={() => handleRepoToggle(repoId)}
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

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email || !role || selectedRepos.length === 0}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Invite
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
