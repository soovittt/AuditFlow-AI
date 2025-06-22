"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RepoCard } from "@/components/repo-card"
import { GlobalSummary } from "@/components/global-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Grid3X3, List } from "lucide-react"
import { getToken, refreshToken } from "@/lib/auth"
import { BACKEND_BASE_URL } from "@/lib/config"

export default function DashboardPage() {
  const [repos, setRepos] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchRepos = async () => {
      let token = getToken()
      if (!token) return
      try {
        let res = await fetch(`${BACKEND_BASE_URL}/api/repos/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) {
          // Try to refresh the token
          token = await refreshToken()
          if (token) {
            res = await fetch(`${BACKEND_BASE_URL}/api/repos/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          }
        }
        if (res.ok) {
          setRepos(await res.json())
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchRepos()
  }, [])

  const normalizedRepos = repos.map((repo) => ({
    ...repo,
    complianceScore: repo.complianceScore ?? 100,
    violations: repo.violations ?? [],
    status: repo.status ?? "healthy",
  }))

  const filteredRepos = normalizedRepos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Monitor compliance across all your repositories</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
          </div>
        </div>

        {/* Global Summary */}
        <GlobalSummary repos={normalizedRepos} />

        {/* Repository Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Repositories ({filteredRepos.length})</h2>
            <Button variant="outline" size="sm" className="border-white/10 text-gray-400">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} variant="list" />
              ))}
            </div>
          )}

          {filteredRepos.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No repositories found</h3>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
