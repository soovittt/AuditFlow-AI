# utils/pdf_generator.py
import io
from datetime import datetime
from typing import Dict, List, Any
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.legends import Legend
import json

class ComplianceReportGenerator:
    def __init__(self, scan_data: Dict[str, Any], repo_info: Dict[str, Any]):
        self.scan_data = scan_data
        self.repo_info = repo_info
        self.results = self.scan_data.get("results", {})
        self.scores = self.results.get("scores", {})
        self.findings = self.results.get("findings", [])
        
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the report, checking if they already exist."""
        
        styles_to_add = {
            'CustomTitle': ParagraphStyle(
                name='CustomTitle', parent=self.styles['Heading1'], fontSize=24,
                spaceAfter=30, alignment=TA_CENTER, textColor=colors.darkblue
            ),
            'SectionHeader': ParagraphStyle(
                name='SectionHeader', parent=self.styles['Heading2'], fontSize=16,
                spaceAfter=12, spaceBefore=20, textColor=colors.darkblue
            ),
            'SubsectionHeader': ParagraphStyle(
                name='SubsectionHeader', parent=self.styles['Heading3'], fontSize=14,
                spaceAfter=8, spaceBefore=12, textColor=colors.darkgreen
            ),
            'BodyText': ParagraphStyle(
                name='BodyText', parent=self.styles['Normal'], fontSize=10,
                spaceAfter=6, leading=14
            ),
            'ScoreText': ParagraphStyle(
                name='ScoreText', parent=self.styles['Normal'], fontSize=12,
                spaceAfter=6, leading=16, textColor=colors.darkred
            )
        }

        for name, style in styles_to_add.items():
            if name not in self.styles:
                self.styles.add(style)

    def generate_report(self) -> bytes:
        """Generate a comprehensive PDF compliance report."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, 
                              topMargin=72, bottomMargin=18)
        
        story = []
        
        # Add report header
        story.extend(self._create_header())
        
        # Add executive summary
        story.extend(self._create_executive_summary())
        
        # Add scores section
        story.extend(self._create_scores_section())
        
        # Add violations breakdown
        story.extend(self._create_violations_breakdown())
        
        # Add detailed findings
        story.extend(self._create_detailed_findings())
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def _create_header(self) -> List:
        """Create the report header."""
        elements = []
        
        # Title
        title = Paragraph("AuditFlow AI Compliance Report", self.styles['CustomTitle'])
        elements.append(title)
        
        # Repository information table
        scan_date = self.scan_data.get("updated_at")
        scan_date_str = scan_date.strftime("%B %d, %Y at %H:%M UTC") if scan_date else "N/A"

        repo_table_data = [
            ["Repository Name:", Paragraph(self.repo_info.get("name", "N/A"), self.styles['BodyText'])],
            ["Repository URL:", Paragraph(self.repo_info.get("web_url", "N/A"), self.styles['BodyText'])],
            ["Report Generated:", Paragraph(datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC"), self.styles['BodyText'])],
            ["Scan Date:", Paragraph(scan_date_str, self.styles['BodyText'])],
        ]
        
        repo_table = Table(repo_table_data, colWidths=[1.5*inch, 4.5*inch])
        repo_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEBELOW', (0, 0), (-1, -1), 1, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        elements.append(repo_table)
        elements.append(Spacer(1, 20))
        
        return elements

    def _create_executive_summary(self) -> List:
        """Create executive summary section."""
        elements = []
        
        # Section header
        elements.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        
        # Overall grade and score
        grade = self._get_grade_from_score(self.scores.get("overall_score", 0))
        overall_score = self.scores.get("overall_score", 0)
        
        summary_text = f"""
            This report summarizes the findings of an automated compliance and security scan conducted on the
            <b>{self.repo_info.get("name", "N/A")}</b> repository. The scan identified a total of 
            <b>{self.scores.get("total_violations", 0)}</b> issues. The repository achieved an overall compliance score of 
            <b>{overall_score:.1f}%</b>, resulting in a grade of <b>{grade}</b>.
        """
        elements.append(Paragraph(summary_text, self.styles['BodyText']))
        elements.append(Spacer(1, 20))
        
        return elements

    def _create_scores_section(self) -> List:
        """Create detailed scores section."""
        elements = []
        
        elements.append(Paragraph("Detailed Scores", self.styles['SectionHeader']))
        
        scores_data = [
            ["Category", "Score", "Grade"],
            ["Security", f"{self.scores.get('security_score', 0):.1f}%", self._get_grade_from_score(self.scores.get('security_score', 0))],
            ["Compliance", f"{self.scores.get('compliance_score', 0):.1f}%", self._get_grade_from_score(self.scores.get('compliance_score', 0))],
            ["Code Quality", f"{self.scores.get('quality_score', 0):.1f}%", self._get_grade_from_score(self.scores.get('quality_score', 0))],
            ["Overall", f"{self.scores.get('overall_score', 0):.1f}%", self._get_grade_from_score(self.scores.get('overall_score', 0))]
        ]
        
        scores_table = Table(scores_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey)
        ]))
        
        elements.append(scores_table)
        elements.append(Spacer(1, 20))
        
        return elements

    def _create_violations_breakdown(self) -> List:
        """Create violations breakdown section with a pie chart."""
        elements = []
        
        elements.append(Paragraph("Violations Breakdown", self.styles['SectionHeader']))
        
        # Data for table and pie chart
        severities = {
            "critical": self.scores.get("critical_violations", 0),
            "high": self.scores.get("high_violations", 0),
            "medium": self.scores.get("medium_violations", 0),
            "low": self.scores.get("low_violations", 0)
        }
        
        # Table
        priority_data = [
            ["Severity", "Count"],
            ["Critical", severities["critical"]],
            ["High", severities["high"]],
            ["Medium", severities["medium"]],
            ["Low", severities["low"]],
            ["Total", self.scores.get("total_violations", 0)]
        ]
        
        priority_table = Table(priority_data, colWidths=[2*inch, 1*inch])
        priority_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 5), (-1, 5), colors.grey),
            ('TEXTCOLOR', (0, 5), (-1, 5), colors.whitesmoke),
        ]))
        
        # Pie Chart
        drawing = Drawing(width=3.5*inch, height=1.5*inch)
        pie_data = [v for k, v in severities.items() if v > 0]
        pie_labels = [k.capitalize() for k, v in severities.items() if v > 0]
        
        if pie_data:
            pie = Pie()
            pie.x = 0
            pie.y = -20
            pie.width = 1.5 * inch
            pie.height = 1.5 * inch
            pie.data = pie_data
            pie.labels = pie_labels
            pie.slices.strokeWidth = 0.5
            
            # Dynamically assign colors to existing slices
            color_map = {
                'Critical': colors.red, 
                'High': colors.orange, 
                'Medium': colors.gold, 
                'Low': colors.green
            }
            for i, label in enumerate(pie_labels):
                if i < len(pie.slices):
                    pie.slices[i].fillColor = color_map.get(label, colors.grey)

            drawing.add(pie)

            legend = Legend()
            legend.x = 2 * inch
            legend.y = 1.2 * inch
            legend.alignment = 'right'
            legend.colorNamePairs = [
                (colors.red, 'Critical'), (colors.orange, 'High'), 
                (colors.gold, 'Medium'), (colors.green, 'Low')
            ]
            drawing.add(legend)

        # Combine table and chart
        combined_table = Table([[priority_table, drawing]], colWidths=[3.2*inch, 3.5*inch])
        combined_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        
        elements.append(combined_table)
        elements.append(Spacer(1, 20))

        return elements

    def _create_detailed_findings(self) -> List:
        """Create detailed findings section."""
        elements = []
        elements.append(PageBreak())
        elements.append(Paragraph("Detailed Findings", self.styles['SectionHeader']))
        
        if not self.findings:
            elements.append(Paragraph("No violations were found in this scan.", self.styles['BodyText']))
            return elements

        # Create a table for the findings
        findings_data = [["Severity", "Category", "Description", "Location"]]
        
        # Sort findings by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        sorted_findings = sorted(self.findings, key=lambda x: severity_order.get(x.get('severity', 'low').lower(), 4))
        
        for finding in sorted_findings:
            # Wrap text in paragraphs for better formatting in table cells
            desc = Paragraph(finding.get('description', 'N/A'), self.styles['BodyText'])
            loc = Paragraph(f"{finding.get('location', 'N/A')}", self.styles['BodyText'])
            sev = finding.get('severity', 'N/A').capitalize()
            cat = finding.get('category', 'N/A').replace('_', ' ').title()
            
            findings_data.append([sev, cat, desc, loc])
        
        findings_table = Table(findings_data, colWidths=[0.7*inch, 1*inch, 3*inch, 2*inch], repeatRows=1)
        findings_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(findings_table)
        elements.append(Spacer(1, 20))
        
        return elements

    def _get_grade_from_score(self, score: float) -> str:
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

    def _get_status_from_score(self, score: float) -> str:
        """Determines the compliance status from a score."""
        if score >= 80:
            return "Compliant"
        elif score >= 60:
            return "Needs Improvement"
        else:
            return "Non-Compliant"