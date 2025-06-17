"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Users,
  Bell,
} from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: (collapsed: boolean) => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AuditFlow
                </h1>
                <p className="text-xs text-gray-400">Compliance Platform</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(!collapsed)}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-600/20 text-white border border-purple-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                  collapsed && "justify-center px-2",
                )}
              >
                <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-gray-400 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-2",
            )}
          >
            <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  )
}
