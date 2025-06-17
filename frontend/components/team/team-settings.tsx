"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, Save, TestTube } from "lucide-react"

export function TeamSettings() {
  const [slackAlerts, setSlackAlerts] = useState(true)
  const [weeklyEmails, setWeeklyEmails] = useState(true)
  const [customPolicies, setCustomPolicies] = useState(false)
  const [slackWebhook, setSlackWebhook] = useState("")

  const handleSave = () => {
    // Handle settings save
    console.log({
      slackAlerts,
      weeklyEmails,
      customPolicies,
      slackWebhook,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Team Settings</h2>
        <p className="text-gray-400">Configure team-wide preferences and notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Team-wide Slack Alerts</Label>
                <p className="text-sm text-gray-400">Send compliance alerts to team Slack channel</p>
              </div>
              <Switch checked={slackAlerts} onCheckedChange={setSlackAlerts} />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Weekly Summary Emails</Label>
                <p className="text-sm text-gray-400">Send weekly compliance summaries to admins</p>
              </div>
              <Switch checked={weeklyEmails} onCheckedChange={setWeeklyEmails} />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <Label className="text-white">Slack Webhook URL</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                  <TestTube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Permissions */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Team Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Custom Policy Upload</Label>
                <p className="text-sm text-gray-400">Allow team members to upload custom policies</p>
              </div>
              <Switch checked={customPolicies} onCheckedChange={setCustomPolicies} />
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-4">
              <h4 className="text-white font-medium">Default Repository Access</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">New Auditors</span>
                  <span className="text-gray-400">Read-only access</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">New Viewers</span>
                  <span className="text-gray-400">No access by default</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
