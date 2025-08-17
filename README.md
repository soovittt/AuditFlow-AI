# AuditFlow-AI

[![Status](https://img.shields.io/badge/status-experimental-orange.svg)]()
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)]()
[![Built with](https://img.shields.io/badge/stack-FastAPI%20%E2%80%A2%20Next.js%20%E2%80%A2%20Postgres%20%E2%80%A2%20Pinecone%20%E2%80%A2%20GCP-6f42c1.svg)]()
[![CI](https://img.shields.io/badge/ci-GitLab%20Pipelines-success.svg)]()

**AuditFlow-AI** is an experimental platform to automate compliance evidence collection, detect configuration/security drift, and generate audit-ready documentation from your DevOps footprint. Built initially for a hackathon, it’s evolving toward a community-driven, open-source framework.

> **Mission:** Make audits effortless • Catch drift automatically • Keep teams audit-ready, always.

---

## Table of Contents
- [Vision](#vision)
- [Key Capabilities](#key-capabilities)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quickstart (Local)](#quickstart-local)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security & Responsible Use](#security--responsible-use)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Vision
Audits today are manual and repetitive. AuditFlow-AI reimagines compliance as code + automation:

- **Automated evidence collection** from source control, CI/CD, and cloud accounts.
- **Continuous drift detection** for infra, policies, and access controls.
- **Audit-ready packs** that compile artifacts into clean, human-readable reports.
- **Developer-first**: works with Git-centric flows and modern cloud tooling.

Long term, AuditFlow-AI aims to be a **modular open-source framework** you can extend for SOC 2, ISO 27001, HIPAA, and more.

---

## Key Capabilities
- **Evidence Graph (prototype):** Ingests GitLab metadata, CI runs, IaC state, and cloud configs into a queryable model.
- **Drift Rules:** Declarative checks that alert on deviations impacting compliance.
- **Report Generator:** Turns raw logs/configs into structured findings and narratives.
- **CLI + Web UI (planned):** Dev-first commands plus a lightweight dashboard.

> Status: Early prototype; APIs and schemas are subject to change.

---

## Architecture
monorepo/
├─ api/ # FastAPI services: ingestion, rules, report generation
├─ web/ # Next.js dashboard (status, evidence browser, drift alerts)
├─ cli/ # Developer CLI to run scans and export reports
├─ workers/ # Background jobs (scheduled drift scans)
├─ infra/ # IaC for GCP (Cloud Run, Cloud SQL, VPC, Secrets)
└─ docs/ # Specs, design notes, contribution guides (soon)

markdown
Copy
Edit

**Data Flow (high level)**
1. **Connect sources** (GitLab, Cloud, CI).  
2. **Ingest & normalize** to an Evidence Graph (Postgres + vector index).  
3. **Run rules** to detect drift and map controls → evidence.  
4. **Generate reports** (PDF/HTML/JSON) and export to auditors.

---

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** Next.js
- **DB/Storage:** Postgres + Pinecone (vector search)
- **Infra:** Google Cloud (Cloud Run, Cloud SQL, Secret Manager)
- **Pipelines:** GitLab CI/CD
- **AI layer:** LLM-powered summarization & document generation (provider-agnostic)

---

## Quickstart (Local)

> Requires: Python 3.11+, Node 18+, Docker, Make

```bash
# 1) Clone
git clone https://github.com/<you>/AuditFlow-AI.git
cd AuditFlow-AI

# 2) API (FastAPI)
cd api
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3) Web (Next.js)
cd ../web
cp .env.local.example .env.local
npm install
npm run dev
Docker (optional)
bash
Copy
Edit
# From repo root
docker compose up --build
Configuration
Minimum env (API)
Create api/.env:

ini
Copy
Edit
DATABASE_URL=postgresql database or any
PINECONE_API_KEY=your_key
PINECONE_INDEX=auditflow-evidence
# GitLab/GitHub, Cloud creds, etc.
GITLAB_TOKEN=glpat_xxx
GCP_PROJECT_ID=your-project
Minimum env (Web)
Create web/.env.local:

ini
Copy
Edit
NEXT_PUBLIC_API_URL=http://localhost:8000
Secrets: Use GCP Secret Manager (prod) and .env files only for local dev. Never commit secrets.

Roadmap
 Evidence Connectors: GitHub, AWS, GCP, Azure

 Standards Packs: SOC 2, ISO 27001, HIPAA mappings

 Rules DSL: Author and test drift rules as code

 Report Templates: PDF/HTML with control coverage

 RBAC & Audit Log: Workspace permissions, immutable evidence trail

 Public Release: Docs, examples, demo dataset

 Open Source: Convert to Apache-2.0, publish contribution guide

Contributing
We’re preparing public contribution guidelines. In the meantime:

Open issues with clear repro or proposal.

For features, include: problem → approach → schema impact → testing plan.

Keep changes modular and well-documented.

A CONTRIBUTING.md and CODE_OF_CONDUCT.md will be added before the first tagged OSS release.

Security & Responsible Use
Handle credentials via Secret Manager/env only.

Principle of least privilege for cloud connectors.

Redact/Hash sensitive values in logs and exported reports.

If you discover a vulnerability, please disclose responsibly via a private issue or security email (to be published).

License
Planned for Apache-2.0 on the first public OSS tag. Until then, all rights reserved by the project maintainers.

