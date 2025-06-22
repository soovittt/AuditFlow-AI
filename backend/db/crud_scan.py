# db/crud_scan.py
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from db.init import db
from models.scan import Violation, ComplianceScore, ScanResult, ScanSummary, RepoComplianceSummary

logger = logging.getLogger(__name__)

class ScanCRUD:
    """CRUD operations for scan-related data"""
    
    @staticmethod
    async def save_scan_result(repo_id: int, user_id: str, results: Dict[str, Any]) -> str:
        """Save scan results and return scan ID"""
        try:
            scan_doc = {
                "repo_id": repo_id,
                "user_id": user_id,
                "results": results,
                "created_at": datetime.utcnow()
            }
            
            scan_result = await db.get_collection("scan_results").insert_one(scan_doc)
            scan_id = str(scan_result.inserted_id)
            logger.info(f"Saved scan results for repo {repo_id}, scan_id: {scan_id}")
            return scan_id
            
        except Exception as e:
            logger.error(f"Failed to save scan results: {str(e)}")
            raise
    
    @staticmethod
    async def save_violations(repo_id: int, user_id: str, scan_id: str, violations: List[Dict[str, Any]]) -> None:
        """Save violations to database"""
        try:
            violations_collection = db.get_collection("violations")
            violations_to_insert = []
            
            for violation in violations:
                violation_doc = {
                    "violation_id": violation.get("violation_id"),
                    "repo_id": repo_id,
                    "user_id": user_id,
                    "scan_id": scan_id,
                    "type": violation.get("type"),
                    "severity": violation.get("severity"),
                    "description": violation.get("description"),
                    "location": violation.get("location"),
                    "status": violation.get("status", "open"),
                    "assigned_priority": violation.get("assigned_priority"),
                    "category": violation.get("category"),
                    "estimated_fix_time": violation.get("estimated_fix_time"),
                    "compliance_impact": violation.get("compliance_impact"),
                    "risk_level": violation.get("risk_level"),
                    "discovered_date": violation.get("discovered_date"),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                violations_to_insert.append(violation_doc)
            
            if violations_to_insert:
                await violations_collection.insert_many(violations_to_insert)
                logger.info(f"Saved {len(violations_to_insert)} violations for repo {repo_id}")
                
        except Exception as e:
            logger.error(f"Failed to save violations: {str(e)}")
            raise
    
    @staticmethod
    async def save_compliance_score(repo_id: int, user_id: str, scan_id: str, scores: Dict[str, Any]) -> None:
        """Save compliance scores to database"""
        try:
            compliance_scores_collection = db.get_collection("compliance_scores")
            score_doc = {
                "repo_id": repo_id,
                "user_id": user_id,
                "scan_id": scan_id,
                "overall_score": scores.get("overall_score"),
                "security_score": scores.get("security_score"),
                "compliance_score": scores.get("compliance_score"),
                "quality_score": scores.get("quality_score"),
                "performance_score": scores.get("performance_score"),
                "maintainability_score": scores.get("maintainability_score"),
                "total_violations": scores.get("total_violations"),
                "critical_violations": scores.get("critical_violations"),
                "high_violations": scores.get("high_violations"),
                "medium_violations": scores.get("medium_violations"),
                "low_violations": scores.get("low_violations"),
                "info_violations": scores.get("info_violations", 0),
                "scan_date": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            await compliance_scores_collection.insert_one(score_doc)
            logger.info(f"Saved compliance scores for repo {repo_id}: {score_doc}")
            
        except Exception as e:
            logger.error(f"Failed to save compliance scores: {str(e)}")
            raise
    
    @staticmethod
    async def get_latest_scan(repo_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the latest scan result for a repository"""
        try:
            scan_results_collection = db.get_collection("scan_results")
            latest_scan = await scan_results_collection.find_one(
                {"repo_id": repo_id, "user_id": user_id},
                sort=[("created_at", -1)]
            )
            return latest_scan
        except Exception as e:
            logger.error(f"Failed to get latest scan: {str(e)}")
            return None
    
    @staticmethod
    async def get_scan_history(repo_id: int, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get scan history for a repository"""
        try:
            scan_results_collection = db.get_collection("scan_results")
            cursor = scan_results_collection.find(
                {"repo_id": repo_id, "user_id": user_id}
            ).sort("created_at", -1).limit(limit)
            
            scans = []
            async for scan in cursor:
                scans.append(scan)
            return scans
        except Exception as e:
            logger.error(f"Failed to get scan history: {str(e)}")
            return []
    
    @staticmethod
    async def get_violations(repo_id: int, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get violations for a repository"""
        try:
            violations_collection = db.get_collection("violations")
            query = {"repo_id": repo_id, "user_id": user_id}
            if status:
                query["status"] = status
            
            cursor = violations_collection.find(query).sort("discovered_date", -1)
            violations = []
            async for violation in cursor:
                violations.append(violation)
            return violations
        except Exception as e:
            logger.error(f"Failed to get violations: {str(e)}")
            return []
    
    @staticmethod
    async def get_compliance_trends(repo_id: int, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get compliance score trends over time"""
        try:
            compliance_scores_collection = db.get_collection("compliance_scores")
            start_date = datetime.utcnow() - timedelta(days=days)
            
            cursor = compliance_scores_collection.find({
                "repo_id": repo_id,
                "user_id": user_id,
                "scan_date": {"$gte": start_date}
            }).sort("scan_date", 1)
            
            trends = []
            async for score in cursor:
                trends.append({
                    "date": score.get("scan_date").isoformat(),
                    "overall_score": score.get("overall_score", 0),
                    "security_score": score.get("security_score", 0),
                    "compliance_score": score.get("compliance_score", 0),
                    "quality_score": score.get("quality_score", 0),
                    "grade": ScanCRUD._get_grade_from_score(score.get("overall_score", 0))
                })
            return trends
        except Exception as e:
            logger.error(f"Failed to get compliance trends: {str(e)}")
            return []
    
    @staticmethod
    async def get_violation_trends(repo_id: int, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get violation trends over time."""
        try:
            violations_collection = db.get_collection("violations")
            start_date = datetime.utcnow() - timedelta(days=days)
            
            pipeline = [
                {"$match": {
                    "repo_id": repo_id,
                    "user_id": user_id,
                    "discovered_date": {"$gte": start_date.isoformat()}
                }},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": {"$toDate": "$discovered_date"}}},
                    "total_violations": {"$sum": 1},
                    "critical": {"$sum": {"$cond": [{"$eq": ["$severity", "critical"]}, 1, 0]}},
                    "high": {"$sum": {"$cond": [{"$eq": ["$severity", "high"]}, 1, 0]}},
                    "medium": {"$sum": {"$cond": [{"$eq": ["$severity", "medium"]}, 1, 0]}},
                    "low": {"$sum": {"$cond": [{"$eq": ["$severity", "low"]}, 1, 0]}},
                }},
                {"$sort": {"_id": 1}}
            ]
            
            trends = []
            async for doc in violations_collection.aggregate(pipeline):
                trends.append({
                    "date": doc["_id"],
                    "total_violations": doc["total_violations"],
                    "critical_violations": doc["critical"],
                    "high_violations": doc["high"],
                    "medium_violations": doc["medium"],
                    "low_violations": doc["low"]
                })
            return trends
        except Exception as e:
            logger.error(f"Failed to get violation trends: {str(e)}")
            return []
    
    @staticmethod
    async def get_repo_summary(repo_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive repository compliance summary"""
        try:
            # Get latest completed scan for historical data
            latest_completed_scan = await db.get_collection("scans").find_one(
                {"repo_id": repo_id, "user_id": user_id, "status": "completed"},
                sort=[("updated_at", -1)]
            )
            
            # Check for an active scan (queued or in_progress)
            active_scan = await db.get_collection("scans").find_one(
                {"repo_id": repo_id, "user_id": user_id, "status": {"$in": ["queued", "in_progress"]}},
                sort=[("created_at", -1)]
            )

            if not latest_completed_scan and not active_scan:
                return None # No scans at all for this repo
            
            summary_data = {
                "repo_id": repo_id,
                "repo_name": "N/A", # Will be fetched from repo details later
                "last_scan_date": None,
                "overall_score": 0,
                "grade": "N/A",
                "status": "N/A",
                "trend": "stable",
                "open_violations_count": 0,
                "critical_violations_count": 0,
                "high_violations_count": 0,
                "medium_violations_count": 0,
                "low_violations_count": 0,
                "compliance_history": [],
                "violation_history": [],
                "active_scan_id": None
            }

            scan_to_process = latest_completed_scan
            
            # If there's an active scan, its status takes precedence
            if active_scan:
                summary_data["active_scan_id"] = str(active_scan["_id"])
                summary_data["status"] = active_scan["status"]
            
            if scan_to_process:
                results = scan_to_process.get("results", {})
                scores = results.get("scores", {})
                findings = results.get("findings", [])
                
                # Correctly calculate violation counts from the findings list
                critical_count = 0
                high_count = 0
                medium_count = 0
                low_count = 0
                for finding in findings:
                    severity = finding.get("severity", "info").lower()
                    if severity == "critical":
                        critical_count += 1
                    elif severity == "high":
                        high_count += 1
                    elif severity == "medium":
                        medium_count += 1
                    elif severity == "low":
                        low_count += 1
                
                summary_data.update({
                    "last_scan_date": scan_to_process.get("updated_at").isoformat(),
                    "overall_score": scores.get("overall_score", 0),
                    "grade": ScanCRUD._get_grade_from_score(scores.get("overall_score", 0)),
                    "open_violations_count": len(findings),
                    "critical_violations_count": critical_count,
                    "high_violations_count": high_count,
                    "medium_violations_count": medium_count,
                    "low_violations_count": low_count,
                    "status": active_scan["status"] if active_scan else scan_to_process.get("status", "completed"),
                })
            
            # Determine trend based on historical data
            summary_data["trend"] = await ScanCRUD._determine_trend(repo_id, user_id)
            
            # Fetch compliance history regardless of current scan status
            summary_data["compliance_history"] = await ScanCRUD.get_compliance_trends(repo_id, user_id, days=30)

            return summary_data
        
        except Exception as e:
            logger.error(f"Failed to get repo summary for {repo_id}: {e}")
            return None
    
    @staticmethod
    async def create_scan(repo_id: int, user_id: str, repo_name: str) -> str:
        """Create a new scan record in the database"""
        scan_doc = {
            "repo_id": repo_id,
            "user_id": user_id,
            "repo_name": repo_name,
            "status": "queued",
            "progress": 0,
            "summary": "Scan has been queued for processing.",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = await db.get_collection("scans").insert_one(scan_doc)
        return str(result.inserted_id)

    @staticmethod
    async def update_scan_status(scan_id: str, status: str, progress: int, summary: str, results: Optional[Dict] = None):
        """Update the status of an existing scan"""
        update_doc = {
            "status": status,
            "progress": progress,
            "summary": summary,
            "updated_at": datetime.utcnow(),
        }
        if results:
            update_doc["results"] = results

        await db.get_collection("scans").update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": update_doc},
        )
    
    @staticmethod
    def _determine_status(score: float, critical: int, high: int) -> str:
        """Determine repository status based on score and violations"""
        if critical > 0:
            return "critical"
        if high > 0 or score < 70:
            return "at-risk"
        if score < 90:
            return "needs-improvement"
        return "healthy"
    
    @staticmethod
    async def _determine_trend(repo_id: int, user_id: str) -> str:
        """Determine score trend by comparing the last two scans"""
        try:
            scores_collection = db.get_collection("compliance_scores")
            # Get the last two scores, most recent first
            cursor = scores_collection.find(
                {"repo_id": repo_id, "user_id": user_id},
                sort=[("scan_date", -1)]
            ).limit(2)
            
            scores = await cursor.to_list(length=2)
            
            if len(scores) < 2:
                return "stable"  # Not enough data for a trend
            
            latest_score = scores[0].get("overall_score", 0)
            previous_score = scores[1].get("overall_score", 0)
            
            if latest_score > previous_score:
                return "improving"
            elif latest_score < previous_score:
                return "declining"
            else:
                return "stable"
        except Exception:
            return "stable" # Default to stable if any error occurs
    
    @staticmethod
    def _get_grade_from_score(score: float) -> str:
        """Converts a numerical score to a letter grade."""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    @staticmethod
    async def get_all_scan_history(user_id: str) -> List[Dict[str, Any]]:
        """Get scan history across all repos for a user."""
        try:
            scans_collection = db.get_collection("scans")
            
            pipeline = [
                {"$match": {"user_id": user_id, "status": "completed"}},
                {"$sort": {"updated_at": -1}},
                {
                    "$project": {
                        "_id": 0,
                        "scan_id": {"$toString": "$_id"},
                        "repo_id": "$repo_id",
                        "repo_name": {"$ifNull": ["$repo_name", "Unknown Repo"]},
                        "status": "$status",
                        "scan_date": "$updated_at",
                        "overall_score": "$results.scores.overall_score",
                        "grade": {
                            "$let": {
                                "vars": {"score": {"$ifNull": ["$results.scores.overall_score", 0]}},
                                "in": {
                                    "$switch": {
                                        "branches": [
                                            {"case": {"$gte": ["$$score", 90]}, "then": "A"},
                                            {"case": {"$gte": ["$$score", 80]}, "then": "B"},
                                            {"case": {"$gte": ["$$score", 70]}, "then": "C"},
                                            {"case": {"$gte": ["$$score", 60]}, "then": "D"}
                                        ],
                                        "default": "F"
                                    }
                                }
                            }
                        }
                    }
                }
            ]
            
            history = await scans_collection.aggregate(pipeline).to_list(length=None)
            return history
        except Exception as e:
            logger.error(f"Failed to get all scan history for user {user_id}: {e}")
            return []
    
    @staticmethod
    async def update_violation_status(violation_id: str, status: str, resolved_by: Optional[str] = None, notes: Optional[str] = None) -> bool:
        """Update violation status"""
        try:
            violations_collection = db.get_collection("violations")
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            
            if status == "resolved":
                update_data["resolved_date"] = datetime.utcnow()
                update_data["resolved_by"] = resolved_by
                update_data["resolution_notes"] = notes
            
            result = await violations_collection.update_one(
                {"violation_id": violation_id},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update violation status: {str(e)}")
            return False
    
    @staticmethod
    async def get_analytics_summary(user_id: str) -> Dict[str, Any]:
        """Get aggregated analytics summary across all repositories for a user."""
        try:
            scans_collection = db.get_collection("scans")
            
            # 1. Get the latest completed scan for each repository
            latest_scans_pipeline = [
                {"$match": {"user_id": user_id, "status": "completed"}},
                {"$sort": {"repo_id": 1, "updated_at": -1}},
                {
                    "$group": {
                        "_id": "$repo_id",
                        "latest_scan": {"$first": "$$ROOT"}
                    }
                },
                {"$replaceRoot": {"newRoot": "$latest_scan"}}
            ]
            
            latest_scans = await scans_collection.aggregate(latest_scans_pipeline).to_list(length=None)
            
            if not latest_scans:
                return {
                    "average_compliance_score": 0, "active_violations": 0, 
                    "compliance_trend": [], "top_violation_categories": []
                }

            # 2. Calculate overall summary stats
            total_score = sum(s['results']['scores']['overall_score'] for s in latest_scans if s.get('results'))
            total_violations = sum(s['results']['scores']['total_violations'] for s in latest_scans if s.get('results'))
            avg_score = total_score / len(latest_scans) if latest_scans else 0

            # 3. Get compliance trend for the last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            trend_pipeline = [
                {"$match": {"user_id": user_id, "status": "completed", "updated_at": {"$gte": thirty_days_ago}}},
                {
                    "$group": {
                        "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$updated_at"}},
                        "avg_score": {"$avg": "$results.scores.overall_score"}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            trend_data = await scans_collection.aggregate(trend_pipeline).to_list(length=None)
            compliance_trend = [{"date": doc["_id"], "score": round(doc["avg_score"], 1)} for doc in trend_data]

            # 4. Get top violation categories
            all_findings = []
            for scan in latest_scans:
                if scan.get('results', {}).get('findings'):
                    all_findings.extend(scan['results']['findings'])

            category_counts = {}
            for finding in all_findings:
                cat = finding.get("category", "unknown").replace('_', ' ').title()
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            top_violation_categories = [{"category": k, "count": v} for k, v in sorted(category_counts.items(), key=lambda item: item[1], reverse=True)][:10]

            return {
                "average_compliance_score": round(avg_score, 1),
                "active_violations": total_violations,
                "compliance_trend": compliance_trend,
                "top_violation_categories": top_violation_categories
            }

        except Exception as e:
            logger.error(f"Failed to get analytics summary for user {user_id}: {e}")
            # Return a default empty state on error
            return {
                "average_compliance_score": 0, "active_violations": 0, 
                "compliance_trend": [], "top_violation_categories": []
            } 