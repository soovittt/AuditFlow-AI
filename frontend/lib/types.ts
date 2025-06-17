export interface Violation {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  description: string
  suggestedFix: string
  date: string
  resolved: boolean
}

export interface Repo {
  id: string
  name: string
  complianceScore: number
  status: "healthy" | "at-risk" | "non-compliant" | "scanning"
  lastAudit: string
  violations: Violation[]
}

export interface Report {
  id: string
  title: string
  repository: string
  framework: string
  formats: string[]
  status: "completed" | "in-progress" | "failed"
  generatedDate: string
  preview?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "Admin" | "Auditor" | "Viewer"
  avatar?: string
  accessedRepos: string[]
  lastLogin: string
  status: "active" | "pending" | "inactive"
}
