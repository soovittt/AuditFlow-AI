"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Mail, Trash2, Eye, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { TeamMember } from "@/lib/types"

interface TeamMemberCardProps {
  member: TeamMember
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          label: "Active",
        }
      case "pending":
        return {
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          label: "Pending",
        }
      case "inactive":
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          label: "Inactive",
        }
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          label: "Unknown",
        }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Auditor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Viewer":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const statusConfig = getStatusConfig(member.status)

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-white/20">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gray-400">{member.email}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-white/10" align="end">
                <DropdownMenuItem className="text-gray-300 hover:bg-white/10 hover:text-white">
                  <Eye className="mr-2 h-4 w-4" />
                  View Activity
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:bg-white/10 hover:text-white">
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Invite
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Role */}
          <div className="flex items-center space-x-2">
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Role</label>
            <Select value={member.role}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Auditor">Auditor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accessed Repos */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Accessed Repositories</label>
            <div className="flex flex-wrap gap-1">
              {member.accessedRepos.map((repo) => (
                <Badge key={repo} variant="outline" className="border-white/20 text-gray-300 text-xs">
                  {repo}
                </Badge>
              ))}
            </div>
          </div>

          {/* Last Login */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Last login: {member.lastLogin}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
