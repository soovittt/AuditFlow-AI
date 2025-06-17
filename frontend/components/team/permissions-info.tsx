"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Settings, FileText } from "lucide-react"

export function PermissionsInfo() {
  const permissions = [
    {
      role: "Admin",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: Shield,
      description: "Full access to all features and settings",
      capabilities: [
        "Manage team members and roles",
        "Edit compliance policies",
        "Trigger scans on all repositories",
        "Generate and download reports",
        "Configure integrations and settings",
        "View all analytics and insights",
      ],
    },
    {
      role: "Auditor",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: FileText,
      description: "Can audit repositories and generate reports",
      capabilities: [
        "View assigned repositories",
        "Trigger scans on assigned repos",
        "Generate compliance reports",
        "View violations and analytics",
        "Mark violations as resolved",
        "Export audit data",
      ],
    },
    {
      role: "Viewer",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: Eye,
      description: "Read-only access to compliance data",
      capabilities: [
        "View assigned repositories",
        "View compliance scores",
        "View violation reports",
        "Download existing reports",
        "View basic analytics",
        "Receive notifications",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Role Permissions</h2>
        <p className="text-gray-400">Understanding what each role can do in AuditFlow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {permissions.map((permission) => (
          <Card key={permission.role} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${permission.color}`}>
                  <permission.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">{permission.role}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{permission.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Capabilities:</h4>
                <ul className="space-y-2">
                  {permission.capabilities.map((capability, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Permission Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Assign Admin role only to trusted team leads</li>
                <li>• Use Auditor role for compliance specialists</li>
                <li>• Viewer role is perfect for stakeholders</li>
                <li>• Regularly review and update permissions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Security Notes</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• All actions are logged and auditable</li>
                <li>• Repository access is role-based</li>
                <li>• Sensitive operations require Admin role</li>
                <li>• Session timeout applies to all users</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
