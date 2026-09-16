# MPLADS Intelligence Platform — Master Project Documentation

## 1. Project Overview

### What is MPLADS?
The **Member of Parliament Local Area Development Scheme (MPLADS)** is a Government of India scheme under the **Ministry of Statistics and Programme Implementation (MoSPI)** that enables each Member of Parliament (MP) to recommend development works worth ₹5 Crore annually in their constituency. These works cover infrastructure, community assets, sanitation, education, healthcare, and more.

### What is this Platform?
This platform is an **AI-Powered National Monitoring & Decision Support System** for MPLADS. It provides:
- Real-time tracking of fund allocations across 1,086 Members of Parliament
- Machine Learning-driven risk detection (anomaly detection + duplicate portfolio matching)
- Role-based access control (RBAC) so different government stakeholders see only what they need
- Geographic intelligence mapping across all Indian states
- Predictive analytics for project execution delays
- A conversational AI assistant for investigative queries

### Why was it built?
Currently, MPLADS monitoring relies on manual processes, spreadsheets, and periodic reports. This leads to:
- **Delayed detection** of fund misuse or irregularities
- **No predictive capability** to flag at-risk constituencies before problems escalate
- **Information silos** where Ministry, State, District, and MP-level stakeholders cannot see consolidated data
- **No duplicate detection** — similar works recommended across overlapping areas go unnoticed

This platform solves all of these problems with a unified, intelligent dashboard.

---

## 2. End Users & Use Cases

### Who uses this platform?

| Role | Who They Are | What They Do on the Platform |
|---|---|---|
| **Ministry (MoSPI)** | Central government officials overseeing the entire MPLADS scheme nationally | View national statistics, identify high-risk states, run ML analysis, monitor compliance, generate official reports, use the AI assistant for deep investigations |
| **State Nodal Authority** | State-level officers responsible for coordinating MPLADS within their state | View state-level data, monitor alerts, track financial allocations, review project execution progress, access geographic mapping |
| **District Authority** | District Magistrates / Collectors who oversee physical execution of MPLADS works on the ground | View district-level projects, track execution progress, receive alerts for their jurisdiction, generate district reports |
| **Member of Parliament** | Lok Sabha and Rajya Sabha MPs who recommend works under MPLADS | View their own constituency dashboard, track their recommended projects, access reports |
| **Administrator** | Platform system administrators | Full access to everything including audit trails, system health, ML model management, and data quality metrics |

### Core Use Cases

1. **Fund Monitoring**: Track ₹16,670+ Crore allocated across all MPs, states, and constituencies in real time
2. **Risk Detection**: ML engine flags 89 members with anomalous spending patterns or duplicate portfolios
3. **Compliance Audit**: Verify adherence to MPLADS scheme guidelines (eligible sectors, spending caps, prohibited works)
4. **Geographic Analysis**: Interactive map showing allocation intensity, risk concentration, and member counts by state
5. **Predictive Delay Analysis**: Estimate which portfolios are most likely to face execution bottlenecks
6. **Investigative AI**: Natural language queries to quickly surface insights ("Show me highest risk constituencies in Bihar")

---

## 3. Technology Architecture

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts (bar charts, tooltips)
- **Maps**: Leaflet + react-leaflet (GeoJSON choropleth maps of India)
- **Routing**: React Router DOM v7 (nested routes under `/dashboard`)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (embedded, ships with the deployment)
- **Authentication**: JWT tokens via `python-jose` + bcrypt password hashing
- **ML Engine**: scikit-learn (Isolation Forest for anomaly detection, TF-IDF + cosine similarity for duplicate detection)
- **Model Artifacts**: Serialized via joblib (`isolation_forest.joblib`, `tfidf_vectorizer.joblib`)

### Data Pipeline
```
Raw CSV Files (Lok Sabha + Rajya Sabha data)
    ↓ Papa Parse (in-browser CSV parsing)
    ↓ Adapter Layer (lokSabhaAdapter.ts, rajyaSabhaAdapter.ts)
    ↓ Normalization → MemberOfParliament[] unified schema
    ↓ Frontend State (React hooks: useMembers, useMLData, etc.)
    
SQLite Database (backend/mplads_intelligence.db)
    ↓ FastAPI REST endpoints (/api/members, /api/ml)
    ↓ ML Engine (scikit-learn: train → predict → risk scores)
    ↓ JSON API responses consumed by frontend
```

---

## 4. Role-Based Access Control (RBAC)

### How RBAC Works

When a user logs in, their JWT token contains their `role`. The frontend reads this role and:
1. **Hides navigation tabs** the user cannot access (they never see them)
2. **Route guards** silently redirect to `/dashboard` if someone manually types a restricted URL
3. **Dashboard content** adjusts labels and data quality panels based on role

### Access Matrix

| Page | Ministry | State Nodal | District | MP | Admin |
|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| MPs | ✅ | ✅ | ❌ | ❌ | ✅ |
| Works & Projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| Risk & ML Analysis | ✅ | ❌ | ❌ | ❌ | ✅ |
| Alerts | ✅ | ✅ | ✅ | ❌ | ✅ |
| Compliance | ✅ | ❌ | ❌ | ❌ | ✅ |
| Analytics Hub | ✅ | ✅ | ❌ | ❌ | ✅ |
| Financial Analytics | ✅ | ✅ | ❌ | ❌ | ✅ |
| Project Execution | ✅ | ✅ | ✅ | ❌ | ✅ |
| Districts | ✅ | ✅ | ✅ | ❌ | ✅ |
| Agencies | ✅ | ✅ | ❌ | ❌ | ✅ |
| Geographic Map | ✅ | ✅ | ❌ | ❌ | ✅ |
| AI Assistant | ✅ | ❌ | ❌ | ❌ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Trail | ✅ | ❌ | ❌ | ❌ | ✅ |

### Why This Distribution?
- **MPs** only need to see their own dashboard, their projects, and reports. They should NOT see raw ML risk data or compliance engines — that's for oversight bodies.
- **District Authorities** need project execution tracking and alerts for their area, but not national financial analytics or the AI investigation tool.
- **State Nodal Authorities** need a broader view including financial analytics and geographic mapping, but not ML/Compliance (those are Ministry-level oversight tools).
- **Ministry & Admin** see everything because they are the ultimate oversight authorities.

### Login Credentials (Demo)

| Role | User ID | Password |
|---|---|---|
| Ministry | `ministry1` | `ministry123` |
| State Nodal Authority | `state1` | `state123` |
| District Authority | `district1` | `district123` |
| Member of Parliament | `mp1` | `mp123` |
| Administrator | `admin1` | `admin123` |

---

## 5. Machine Learning Engine

### Anomaly Detection (Isolation Forest)
- **Purpose**: Identify members whose financial allocation patterns are statistically unusual compared to their state peers
- **Algorithm**: scikit-learn `IsolationForest` (unsupervised)
- **Features**: Allocated amount relative to state mean, deviation from state median, ratio analysis
- **Output**: Binary anomaly flag + anomaly score per member

### Duplicate Detection (TF-IDF + Cosine Similarity)
- **Purpose**: Find members whose portfolio descriptions/allocation patterns are suspiciously similar
- **Algorithm**: TF-IDF vectorization of member portfolios → pairwise cosine similarity
- **Threshold**: Pairs with similarity > 0.85 are flagged as potential duplicates
- **Output**: Duplicate flag + matched member IDs

### Risk Score Calculation
Each member gets a unified risk score (0-100) computed as:
```
risk_score = (anomaly_weight × anomaly_score) + (duplicate_weight × similarity_score)
```
Risk levels: LOW (0-24), MODERATE (25-49), HIGH (50-74), CRITICAL (75-100)

### Training
- The ML models are trained via a `/api/ml/train` POST endpoint
- Models are serialized to `model_artifacts/` and loaded on startup
- Status is available at `/api/ml/status`

---

## 6. Page-by-Page Description

### Landing Page (`/`)
The public-facing entry point. Shows:
- Official Government of India header with national emblems
- Hero image slider with MPLADS highlights
- Statistics banner (total members monitored, states covered, ML model status)
- Navigation ribbon linking to internal portal sections
- "Login" button to enter the authenticated portal

### Login Page (`/login`)
JWT-based authentication form with:
- User ID and Password fields
- Demo role quick-select buttons (auto-fills credentials)
- On successful login, stores JWT in localStorage and redirects to `/dashboard`
- JWT payload includes the user's `role`, which drives the entire RBAC system

### Dashboard (`/dashboard`)
Role-aware national overview showing:
- KPI cards: Total Members, Total Sanctioned, Estimated Expenditure, High-Risk Members, Delay Risk, Compliance Exceptions, Potential Duplicates
- Data Quality panel (visible to Ministry & Admin only)
- Role-specific subtitle text explaining what each user is seeing

### Members of Parliament (`/dashboard/mps`)
Full registry of all 1,086 MPs with:
- Searchable, filterable table
- House filter (Lok Sabha / Rajya Sabha)
- Columns: Name, State, Constituency, House, Allocated Amount

### Works & Projects (`/dashboard/projects`)
Project-level tracking with:
- Total works count, status distribution
- Searchable project registry table
- Work category filters

### Risk & ML Analysis (`/dashboard/risk-analysis`)
The ML intelligence hub showing:
- ML model status (trained/untrained, last training date)
- Train/retrain button
- Risk distribution bar charts
- Full risk analysis table with scores, risk levels, anomaly flags, duplicate flags
- Signal explanations for each flagged member

### Alerts (`/dashboard/alerts`)
Real-time compliance and risk alerts:
- Alert categories: Cost Escalation, Delay Risk, Compliance Violation
- Severity levels with color coding
- Actionable alert cards

### Compliance (`/dashboard/compliance`)
MPLADS scheme guidelines verification:
- Eligible sector checks
- Spending cap compliance
- Prohibited work detection

### Analytics Hub (`/dashboard/analytics`)
Gateway to specialized analytics sub-modules:
- Financial Analytics
- Project Execution
- Geographic Map
- District Intelligence
- Implementing Agencies

### Financial Analytics (`/dashboard/financial`)
- Total allocation vs projected expenditure
- State-wise fund distribution bar chart (Top 15 states)
- ML-driven portfolios at risk count

### Project Execution (`/dashboard/project-execution`)
- On Track / At Risk / Severely Delayed portfolio counts
- Top 10 delayed portfolios bar chart with critical threshold line
- Delay prediction methodology explanation
- Full execution registry table with completion estimates

### District Intelligence (`/dashboard/districts`)
- Constituency-level risk aggregation
- Top 10 high-risk constituencies chart
- Regional risk summary with recommended actions
- Deep-dive expandable rows per constituency showing member-level signals

### Implementing Agencies (`/dashboard/agencies`)
- State Nodal Authority aggregated view
- Authority count, total allocation, estimated delay rate, high-risk authorities
- Top 10 high-risk authorities chart
- Expandable detail rows with portfolio-level anomaly signals

### Geographic Map (`/dashboard/geographic`)
- Interactive Leaflet choropleth map of India
- Toggle between Allocation / Risk / Members heat map views
- Click-to-select state with intelligence side panel
- "View District Analytics" button linking to Districts page
- State allocation comparison bar chart

### AI Investigation Assistant (`/dashboard/assistant`)
- Conversational interface for natural language queries
- Connected to live ML data and member datasets
- Supports queries about risk, constituencies, authorities, duplicates, anomalies, allocations
- Strict no-fabrication policy — only returns data-backed answers

### Reports (`/dashboard/reports`)
- Ministry progress report generation
- State summary sheets
- Utilization certificate templates

### Audit Trail (`/dashboard/audit`)
- System event log showing data ingestion, ML training, user actions
- Immutable record for governance compliance

---

## 7. Deployment

### Architecture
```
[User Browser] → [Render Static Site: React Frontend]
                        ↓ API calls
                  [Render Web Service: FastAPI Backend]
                        ↓
                  [SQLite DB + ML Model Artifacts]
```

### Deployment Steps

#### Backend (Render Web Service)
1. Push code to GitHub
2. On Render dashboard: New → Web Service → Connect repo
3. Set root directory to `backend/`
4. Render auto-detects `Dockerfile`
5. Set environment variables:
   - `CORS_ORIGINS`: `https://your-frontend-url.onrender.com`
   - `SECRET_KEY`: A secure random string
6. Deploy

#### Frontend (Render Static Site)
1. On Render dashboard: New → Static Site → Connect same repo
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Set environment variable:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com`
5. Add rewrite rule: `/* → /index.html` (for React Router)
6. Deploy

#### Alternative: `render.yaml` Blueprint
The project includes a `render.yaml` that defines both services. On Render:
1. New → Blueprint → Connect repo
2. Render reads `render.yaml` and provisions both services automatically

### Accessing on Other Devices
Once deployed, the frontend URL (e.g., `https://mplads-sih.onrender.com`) is accessible from any device with a web browser — desktop, tablet, or mobile.

---

## 8. Project File Structure

```
MPLADS-SIH/
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py               # JWT login/signup endpoints
│   │   │   ├── members.py            # Member data API
│   │   │   └── ml.py                 # ML train/predict/status API
│   │   ├── ml/
│   │   │   ├── features.py           # Feature engineering
│   │   │   ├── risk_engine.py        # Risk score calculator
│   │   │   └── models/
│   │   │       ├── anomaly_detector.py    # Isolation Forest
│   │   │       └── duplicate_detector.py  # TF-IDF similarity
│   │   ├── models/
│   │   │   ├── member.py             # SQLAlchemy member model
│   │   │   └── user.py               # SQLAlchemy user model
│   │   ├── schemas/
│   │   │   ├── member.py             # Pydantic schemas
│   │   │   └── user.py               # Pydantic schemas
│   │   ├── auth.py                   # JWT utilities
│   │   ├── database.py               # SQLite connection
│   │   └── main.py                   # FastAPI app entry
│   ├── model_artifacts/              # Trained ML models (joblib)
│   ├── scripts/
│   │   └── seed_users.py             # Seed demo users
│   ├── mplads_intelligence.db        # SQLite database
│   ├── Dockerfile                    # Docker build config
│   └── requirements.txt             # Python dependencies
├── src/                              # React frontend
│   ├── adapters/                     # CSV data adapters
│   ├── app/
│   │   ├── providers.tsx             # Context providers
│   │   └── router.tsx                # React Router config (with RoleGuards)
│   ├── auth/
│   │   └── permissions.ts            # RBAC access matrix
│   ├── components/
│   │   ├── auth/
│   │   │   └── RoleGuard.tsx         # Route guard component
│   │   └── layout/
│   │       ├── AppLayout.tsx         # Dashboard shell
│   │       ├── GovernmentHeader.tsx   # Main navigation (RBAC-filtered)
│   │       └── GovernmentBanner.tsx   # Page title banner
│   ├── contexts/
│   │   ├── HouseContext.tsx          # Lok Sabha / Rajya Sabha filter
│   │   └── RoleContext.tsx           # Current user role state
│   ├── hooks/
│   │   └── useData.ts               # Data fetching hooks
│   ├── pages/                        # All page components (17 files)
│   ├── services/
│   │   └── api.ts                    # API service layer
│   └── types/
│       └── index.ts                  # TypeScript types
├── public/                           # Static assets (emblems, images, GeoJSON)
├── render.yaml                       # Render deployment blueprint
├── package.json                      # npm dependencies
├── vite.config.ts                    # Vite configuration
└── PROJECT_DOCUMENTATION.md          # This file
```

---

## 9. Key Design Decisions

1. **CSV-first data pipeline**: The source data comes from government CSV exports. We parse them client-side using PapaParse to avoid heavy ETL infrastructure, keeping the system lightweight.

2. **Hybrid data architecture**: Member data is loaded from CSV (frontend), while ML risk scores come from the Python backend API. This lets the ML engine use scikit-learn natively.

3. **Frontend RBAC (not backend)**: Since the MPLADS data itself is public government data, the RBAC is about *information architecture* — giving each role the right view — not about data secrecy. A Ministry official needs national analytics; an MP just needs their constituency.

4. **No fabricated data**: The platform follows strict data integrity rules. Where data is genuinely missing (e.g., project completion dates), we display "Estimated" labels rather than inventing numbers.

5. **Government aesthetic**: The UI follows official Indian government portal design language (MoSPI reference) rather than modern startup aesthetics, using the Ashoka emblem, Saffron-White-Green accents, and flat tabular layouts.
