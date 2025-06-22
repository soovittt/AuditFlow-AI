# models/scan.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ViolationSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class ViolationStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    WONT_FIX = "wont_fix"
    FALSE_POSITIVE = "false_positive"

class ViolationPriority(str, Enum):
    P1 = "P1"  # Critical - Fix immediately
    P2 = "P2"  # High - Fix within 1 week
    P3 = "P3"  # Medium - Fix within 1 month
    P4 = "P4"  # Low - Fix when convenient

class ViolationCategory(str, Enum):
    SECURITY = "security"
    COMPLIANCE = "compliance"
    QUALITY = "quality"
    BEST_PRACTICE = "best_practice"
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"

class Violation(BaseModel):
    violation_id: str
    repo_id: int
    user_id: str
    scan_id: str
    type: str
    severity: ViolationSeverity
    description: str
    location: str
    status: ViolationStatus = ViolationStatus.OPEN
    assigned_priority: ViolationPriority
    category: ViolationCategory
    estimated_fix_time: str
    compliance_impact: List[str]
    risk_level: str
    discovered_date: datetime
    resolved_date: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ComplianceScore(BaseModel):
    repo_id: int
    user_id: str
    scan_id: str
    overall_score: float
    security_score: float
    compliance_score: float
    quality_score: float
    performance_score: Optional[float] = None
    maintainability_score: Optional[float] = None
    total_violations: int
    critical_violations: int
    high_violations: int
    medium_violations: int
    low_violations: int
    info_violations: int
    scan_date: datetime
    created_at: datetime

class ScanResult(BaseModel):
    repo_id: int
    user_id: str
    results: Dict[str, Any]
    created_at: datetime

class ScanSummary(BaseModel):
    scan_id: str
    repo_id: int
    scan_date: datetime
    overall_score: float
    total_violations: int
    critical_violations: int
    high_violations: int
    medium_violations: int
    low_violations: int
    grade: str
    status: str

class ViolationTrend(BaseModel):
    date: str
    total_violations: int
    new_violations: int
    resolved_violations: int
    critical_violations: int
    high_violations: int
    medium_violations: int
    low_violations: int

class ComplianceTrend(BaseModel):
    date: str
    overall_score: float
    security_score: float
    compliance_score: float
    quality_score: float
    grade: str

class ScanStatus(str, Enum):
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class Scan(BaseModel):
    id: str = Field(..., alias="_id")
    repo_id: int
    user_id: str
    status: ScanStatus = ScanStatus.QUEUED
    progress: int = 0
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RepoComplianceSummary(BaseModel):
    repo_id: int
    repo_name: str
    last_scan_date: Optional[datetime]
    overall_score: float
    grade: str
    open_violations_count: int
    critical_violations_count: int
    high_violations_count: int
    medium_violations_count: int
    low_violations_count: int
    status: str
    trend: str
    active_scan_id: Optional[str] = None
    compliance_history: List[ComplianceTrend]
    violation_history: List[ViolationTrend] 