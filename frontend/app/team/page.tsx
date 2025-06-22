"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TeamMemberCard } from "@/components/team/team-member-card"
import { Frown, Loader2, Users } from "lucide-react"
import { CurrentUser } from "@/lib/types"
import { getToken } from "@/lib/auth"
import { BACKEND_BASE_URL } from "@/lib/config"

export default function TeamPage() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const token = getToken()
        if (!token) {
          setError("Authentication token not found.")
          setLoading(false)
          return
        }

        const res = await fetch(`${BACKEND_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data: CurrentUser = await res.json()
        // The backend returns a user object. We need to adapt it for the TeamMemberCard.
        setUser({ ...data, role: "Admin" }) // Assign a default role for now
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Frown className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Error loading user data</h3>
          <p>{error}</p>
        </div>
      )
    }
    
    if (user) {
        // Adapt the user object to the format expected by TeamMemberCard
        const member = {
            id: user.id,
            name: user.username,
            email: user.email,
            avatar: user.avatar_url,
            role: user.role as "Admin" | "Auditor" | "Viewer",
            status: "active" as const,
            accessedRepos: [], // Placeholder
            lastLogin: new Date().toLocaleDateString() // Placeholder
        }
        return (
            <div className="max-w-sm">
                <TeamMemberCard member={member} />
            </div>
        )
    }

    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No user data found</h3>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400 text-lg">Your user account details</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Your Information</h2>
            {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}
