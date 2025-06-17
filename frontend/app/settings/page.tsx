"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GitlabIcon as GitLab, Mail, User, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackWebhook, setSlackWebhook] = useState("")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your account and integration preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Notifications */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive compliance alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive compliance alerts via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <Separator className="bg-gray-700" />

              <div className="space-y-3">
                <Label className="text-white">Slack Webhook URL</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button variant="outline" className="border-gray-600">
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitLab Integration */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <GitLab className="mr-2 h-5 w-5" />
                GitLab Integration
              </CardTitle>
              <CardDescription>Manage your GitLab connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white font-medium">Connection Status</p>
                  <Badge className="bg-green-600 text-white">Connected</Badge>
                </div>
                <Button variant="outline" className="border-gray-600">
                  Re-authenticate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Username</Label>
                  <p className="text-white font-medium">john.doe</p>
                </div>
                <div>
                  <Label className="text-gray-400">Email</Label>
                  <p className="text-white font-medium">john.doe@company.com</p>
                </div>
                <div>
                  <Label className="text-gray-400">GitLab ID</Label>
                  <p className="text-white font-medium">12345678</p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex space-x-3">
                <Button variant="outline" className="border-gray-600">
                  Logout
                </Button>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
