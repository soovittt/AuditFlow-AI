# AuditFlow AI - Violation Codes

This document lists all predefined violation codes used in the AuditFlow AI system. These codes provide consistent categorization and tracking of compliance, security, and quality issues.

## 🔒 Security Violations (SEC)

### SEC001 - Hardcoded Secrets
- **Severity**: High
- **Category**: Security
- **Description**: Hardcoded secrets detected in code
- **Patterns**: 
  - `password = "value"`
  - `secret = "value"`
  - `token = "value"`
  - `api_key = "value"`
  - `private_key = "value"`
- **Impact**: Exposes sensitive credentials in source code
- **Fix**: Use environment variables or secure secret management

### SEC002 - Eval Usage
- **Severity**: High
- **Category**: Security
- **Description**: Use of eval() function detected - potential security risk
- **Patterns**: `eval(...)`
- **Impact**: Code injection vulnerabilities
- **Fix**: Use safer alternatives like JSON.parse() or direct function calls

### SEC003 - SQL Injection Risk
- **Severity**: High
- **Category**: Security
- **Description**: Potential SQL injection vulnerability detected
- **Patterns**:
  - `execute("...${variable}...")`
  - `query("...${variable}...")`
  - `cursor.execute("...%s...", % variable)`
- **Impact**: Database compromise, data theft
- **Fix**: Use parameterized queries or ORM

## 📋 Compliance Violations (COMP)

### COMP001 - Hardcoded URLs
- **Severity**: Medium
- **Category**: Compliance
- **Description**: Hardcoded URL found - consider using environment variables
- **Patterns**: `http://...`, `https://...`
- **Impact**: Environment coupling, deployment issues
- **Fix**: Use environment variables or configuration files

### COMP002 - No Input Validation
- **Severity**: High
- **Category**: Compliance
- **Description**: User input used without validation
- **Patterns**:
  - `request.form[...]`
  - `request.args[...]`
  - `request.json[...]`
- **Impact**: Data corruption, security vulnerabilities
- **Fix**: Implement input validation and sanitization

### COMP003 - Insecure Random
- **Severity**: Medium
- **Category**: Compliance
- **Description**: Insecure random number generation detected
- **Patterns**:
  - `random.randint(...)`
  - `Math.random(...)`
- **Impact**: Predictable values, security vulnerabilities
- **Fix**: Use cryptographically secure random generators

## 🛠️ Quality Violations (QUAL)

### QUAL001 - Long Function
- **Severity**: Medium
- **Category**: Quality
- **Description**: Function exceeds recommended length (>50 lines)
- **Detection**: Python functions with >50 lines
- **Impact**: Reduced maintainability, complexity
- **Fix**: Break into smaller, focused functions

### QUAL002 - TODO Comment
- **Severity**: Info
- **Category**: Quality
- **Description**: TODO/FIXME comment found in code
- **Patterns**: `# TODO:`, `# FIXME:`
- **Impact**: Technical debt, incomplete features
- **Fix**: Address the TODO or create a proper ticket

### QUAL003 - Print Statement
- **Severity**: Low
- **Category**: Quality
- **Description**: Print statement found in production code - consider using proper logging
- **Patterns**: `print(...)`
- **Impact**: Poor logging, debugging difficulties
- **Fix**: Use proper logging framework

### QUAL004 - Missing Error Handling
- **Severity**: Medium
- **Category**: Quality
- **Description**: Try block without corresponding except clause
- **Detection**: Python try blocks without except
- **Impact**: Unhandled exceptions, application crashes
- **Fix**: Add proper exception handling

## 📊 Priority Levels

- **P1 (Critical)**: Must be fixed immediately (1-2 days)
- **P2 (High)**: Should be fixed soon (3-5 days)
- **P3 (Medium)**: Fix within reasonable time (1-2 weeks)
- **P4 (Low)**: Fix when convenient (2-4 weeks)

## 🎯 Severity Levels

- **Critical**: Immediate security or compliance risk
- **High**: Significant security or compliance concern
- **Medium**: Moderate quality or compliance issue
- **Low**: Minor quality improvement
- **Info**: Informational, no immediate action required

## 🔄 Adding New Violation Codes

To add a new violation code:

1. **Choose a category prefix**:
   - `SEC` for Security
   - `COMP` for Compliance
   - `QUAL` for Quality

2. **Assign a unique number** (e.g., `SEC004`, `COMP004`)

3. **Define the rule** in `check_code_violations()` function

4. **Update this documentation**

5. **Test the detection** with sample code

## 📈 Compliance Impact Mapping

Each violation is mapped to relevant compliance standards:

- **SOC2**: Security, availability, processing integrity
- **ISO27001**: Information security management
- **GDPR**: Data protection and privacy
- **PCI-DSS**: Payment card industry security
- **HIPAA**: Healthcare data protection
- **NIST**: Cybersecurity framework
- **OWASP**: Web application security

## 🚀 Future Expansion

Planned violation codes to add:

- **SEC004**: XSS vulnerabilities
- **SEC005**: CSRF protection missing
- **COMP004**: Data retention policy violations
- **COMP005**: Audit logging missing
- **QUAL005**: Code duplication
- **QUAL006**: Cyclomatic complexity
- **QUAL007**: Magic numbers
- **QUAL008**: Dead code

---

*Last updated: December 2024*
*Total violation codes: 10* 