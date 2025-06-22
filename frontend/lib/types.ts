export interface Violation {
  violation_id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  location: string
  status: string
  discovered_date: string
  [key: string]: any // Allow other properties
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

export interface ComplianceTrend {
  date: string;
  overall_score: number;
  security_score: number;
  compliance_score: number;
  quality_score: number;
  grade: string;
}

export interface ViolationTrend {
    date: string;
    total_violations: number;
    critical_violations: number;
    high_violations: number;
    medium_violations: number;
    low_violations: number;
}

export interface ViolationsData {
  repo_id: number;
  scan_id: string;
  scan_date: string;
  violations: any[];
  summary: {
    total_violations: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
  };
  scores: {
    overall_score: number;
    security_score: number;
    compliance_score: number;
    quality_score: number;
  };
  violation_categories: any;
  priority_breakdown: any;
}

export interface RepoComplianceSummary {
    repo_id: number;
    repo_name: string;
    last_scan_date?: string | null;
    overall_score: number;
    grade: string;
    status: string;
    trend: string;
    open_violations_count: number;
    critical_violations_count: number;
    high_violations_count: number;
    medium_violations_count: number;
    low_violations_count: number;
    compliance_history: ComplianceTrend[];
    violation_history: ViolationTrend[];
    active_scan_id?: string | null;
}

export interface ScanSummary {
  scan_id: string;
  repo_id: number;
  status: string;
  progress: number;
  summary: string;
  scan_date: string;
  total_violations: number;
}

export interface ScanUpdateMessage {
  type: "scan_progress" | "scan_completed" | "scan_failed" | "scan_started";
  status: string;
  progress?: number;
  summary?: string;
  results?: any; // Consider defining a more specific type for results
  scan_id?: string;
}

export interface AnalyticsComplianceTrendPoint {
  date: string;
  score: number;
}

export interface AnalyticsTopCategory {
  category: string;
  count: number;
}

export interface AnalyticsSummary {
  average_compliance_score: number;
  active_violations: number;
  compliance_trend: AnalyticsComplianceTrendPoint[];
  top_violation_categories: AnalyticsTopCategory[];
}

export type ReportHistoryItem = {
  scan_id: string;
  repo_id: number;
  repo_name: string;
  status: string;
  scan_date: string;
  overall_score: number;
  grade: string;
};

export type CurrentUser = {
  id: string;
  gitlab_id: number;
  username: string;
  email: string;
  avatar_url: string;
  role: string; // Assuming a default role
};

export type GlobalSummary = {
  total_repos: number;
  healthy_repos: number;
  // ... existing code ...
};
