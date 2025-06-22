import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Minus } from "lucide-react"
import type { RepoComplianceSummary } from "@/lib/types"

interface ScoringTabProps {
  summary: RepoComplianceSummary;
}

export function ScoringTab({ summary }: ScoringTabProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const latestScores = summary.compliance_history[summary.compliance_history.length - 1] ?? {
    overall_score: summary.overall_score,
    security_score: 0,
    compliance_score: 0,
    quality_score: 0,
    grade: summary.grade,
  };

  const scoreCards = [
    {
      title: "Overall Compliance Score",
      score: summary.overall_score,
      grade: summary.grade,
      description: "Comprehensive assessment of security, compliance, and code quality.",
    },
    {
      title: "Security Score",
      score: latestScores.security_score,
      grade: "F", // Replace with actual grade calculation
      description: "Vulnerabilities and security best practices.",
    },
    {
      title: "Compliance Score",
      score: latestScores.compliance_score,
      grade: "F", // Replace with actual grade calculation
      description: "SOC2, GDPR, and regulatory compliance.",
    },
    {
      title: "Code Quality Score",
      score: latestScores.quality_score,
      grade: "F", // Replace with actual grade calculation
      description: "Maintainability and best practices.",
    },
  ];

  const priorityBreakdown = [
      { priority: 'Critical', count: summary.critical_violations, color: 'bg-red-500', time: '1-2 days' },
      { priority: 'High', count: summary.high_violations, color: 'bg-orange-500', time: '3-5 days' },
      { priority: 'Medium', count: summary.medium_violations, color: 'bg-yellow-500', time: '1-2 weeks' },
      { priority: 'Low', count: summary.low_violations, color: 'bg-blue-500', time: '2-4 weeks' },
  ]

  return (
    <div className="space-y-8 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {scoreCards.map((card, index) => (
          <Card key={index} className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-300">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className={`text-5xl font-bold ${getScoreColor(card.score)}`}>
                  {card.score}
                </span>
                <span className="text-2xl text-gray-400">%</span>
              </div>
              <div className="text-gray-400 mt-2">Grade: {card.grade}</div>
              <p className="text-sm text-gray-500 mt-4">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Violations Breakdown</h3>
        <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6">
                 <div className="grid grid-cols-4 gap-4">
                    {priorityBreakdown.map(p => (
                        <div key={p.priority} className="p-4 bg-gray-900/60 rounded-lg text-center">
                            <div className="text-3xl font-bold">{p.count}</div>
                            <div className={`text-sm font-semibold ${p.color.replace('bg','text')}-400`}>{p.priority}</div>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
      </div>

       <div>
        <h3 className="text-xl font-semibold text-white mb-4">Recommended Fix Timeline</h3>
        <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="pt-6 space-y-4">
                 {priorityBreakdown.map(p => (
                     <div key={p.priority} className="flex items-center justify-between">
                         <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${p.color}`}></span>
                            <span className="text-gray-300">{p.priority} Priority Issues</span>
                         </div>
                         <span className="font-semibold text-white">{p.time}</span>
                     </div>
                 ))}
            </CardContent>
        </Card>
      </div>

    </div>
  );
} 