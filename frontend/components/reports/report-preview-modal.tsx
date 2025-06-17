"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, X } from "lucide-react"
import type { Report } from "@/lib/types"

interface ReportPreviewModalProps {
  report: Report | null
  onClose: () => void
}

export function ReportPreviewModal({ report, onClose }: ReportPreviewModalProps) {
  if (!report) return null

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-white/10 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">{report.title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{report.framework}</Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Metadata */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Repository:</span>
                <div className="text-white font-medium">{report.repository}</div>
              </div>
              <div>
                <span className="text-gray-400">Generated:</span>
                <div className="text-white font-medium">{report.generatedDate}</div>
              </div>
              <div>
                <span className="text-gray-400">Framework:</span>
                <div className="text-white font-medium">{report.framework}</div>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <div className="text-white font-medium">{report.status}</div>
              </div>
            </div>
          </div>

          {/* Report Preview Content */}
          <div className="bg-white/5 rounded-lg p-6 max-h-96 overflow-y-auto">
            <div className="prose prose-invert max-w-none">
              <h1>Compliance Report - {report.framework}</h1>

              <h2>Executive Summary</h2>
              <p>
                This report provides a comprehensive analysis of the compliance status for the{" "}
                <strong>{report.repository}</strong> repository against the {report.framework} framework. The assessment
                was conducted on {report.generatedDate} and covers all relevant compliance controls and requirements.
              </p>

              <h2>Compliance Overview</h2>
              <ul>
                <li>
                  Overall Compliance Score: <strong>87%</strong>
                </li>
                <li>
                  Total Controls Assessed: <strong>45</strong>
                </li>
                <li>
                  Controls Passed: <strong>39</strong>
                </li>
                <li>
                  Controls Failed: <strong>6</strong>
                </li>
                <li>
                  Critical Issues: <strong>2</strong>
                </li>
              </ul>

              <h2>Key Findings</h2>
              <h3>✅ Strengths</h3>
              <ul>
                <li>Strong access control implementation</li>
                <li>Comprehensive logging and monitoring</li>
                <li>Regular security updates and patches</li>
                <li>Proper data encryption in transit and at rest</li>
              </ul>

              <h3>⚠️ Areas for Improvement</h3>
              <ul>
                <li>Missing code review requirements for critical changes</li>
                <li>Insufficient backup and recovery procedures</li>
                <li>Incomplete incident response documentation</li>
              </ul>

              <h2>Recommendations</h2>
              <ol>
                <li>Implement mandatory code reviews for all production deployments</li>
                <li>Establish automated backup procedures with regular testing</li>
                <li>Update incident response playbooks and conduct training</li>
                <li>Review and update access control policies quarterly</li>
              </ol>

              <h2>Conclusion</h2>
              <p>
                The {report.repository} repository demonstrates a strong foundation for {report.framework} compliance
                with an overall score of 87%. The identified issues are manageable and can be addressed through the
                recommended actions outlined in this report.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex space-x-2">
              {report.formats.map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-gray-300 hover:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {format}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="border-white/20 text-gray-300 hover:text-white">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Full Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
