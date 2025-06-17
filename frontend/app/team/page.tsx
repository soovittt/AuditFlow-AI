"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TeamMemberCard } from "@/components/team/team-member-card"
import { InviteForm } from "@/components/team/invite-form"
import { PermissionsInfo } from "@/components/team/permissions-info"
import { TeamSettings } from "@/components/team/team-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Search, Users, Settings, Shield } from "lucide-react"
import { mockTeamMembers } from "@/lib/mock-data"

export default function TeamPage() {
  const [teamMembers] = useState(mockTeamMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [showInviteForm, setShowInviteForm] = useState(false)

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || member.role === roleFilter

    return matchesSearch && matchesRole
  })

  const roles = ["Admin", "Auditor", "Viewer"]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-400 text-lg">Manage team members, roles, and permissions</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="members" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Invite Form */}
            {showInviteForm && <InviteForm onClose={() => setShowInviteForm(false)} />}

            {/* Search and Filters */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Team Members ({filteredMembers.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No team members found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsInfo />
          </TabsContent>

          <TabsContent value="settings">
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
