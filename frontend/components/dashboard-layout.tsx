"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-72"}`}>
        <TopNav onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
