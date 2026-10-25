# ROOTWISE — Plant Care Intelligence
## AI-Based Plant Watering Advisory & Decision Support System

[![Capstone](https://img.shields.io/badge/Project-Capstone%2010-008080.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Weather](https://img.shields.io/badge/Weather-Open--Meteo%20API-orange.svg)](https://open-meteo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

RootWise is a full-stack, source-grounded horticultural decision support application. It synthesizes species biology, soil moisture observations (qualitative touch & analog capacitive probes), and real-time meteorological forecasts from Open-Meteo into transparent, explainable plant watering recommendations.

Unlike black-box predictors or naive calendar alarms, RootWise enforces an **asymmetric precautionary principle**: preventing catastrophic overwatering and root rot through hierarchical safety rules backed by the Royal Horticultural Society (RHS) and USDA Agricultural Extension guidelines.

---

## Key Capabilities

1. **Explainable Decision Synthesis:**
   - Evaluates three clear, actionable outcomes: `WATER_NOW`, `CHECK_SOIL`, and `WAIT`.
   - Cites exact rule identifiers (e.g. `RULE_RAIN_IMMINENT`, `RULE_NO_DRAINAGE_DANGER`) and maps directly to peer-reviewed horticultural sources.
   - Computes an **Evidence Quality Score** (`strong`, `moderate`, `weak`, `insufficient`) based on data recency, sensor precision, and weather provider availability.
2. **Real-Time Meteorological Telemetry:**
   - Live integration with the Open-Meteo API (ambient temperature, apparent temp, relative humidity, wind speed, precipitation past 24h, and 24h rain forecast).
   - In-memory 15-minute TTL caching with graceful offline simulation fallbacks.
3. **Botanical Plant Encyclopedia:**
   - Curated profiles for 8 diverse plant varieties: *Monstera deliciosa*, *Snake Plant*, *Tomato*, *Basil*, *Fiddle Leaf Fig*, *Pothos*, *Peace Lily*, and *ZZ Plant*.
   - Growth stages, soil substrate preferences, and side-by-side diagnostic symptoms for under-watering vs. over-watering.
4. **Longitudinal Soil Observation Logger:**
   - Audit trail capturing manual finger-checks and capacitive sensor readings stored in SQLite.
5. **Academic Transparency & Edge-Case Validation:**
   - 20 pre-validated boundary condition scenarios documented in [edge_case_test_report.md](docs/edge_case_test_report.md).
   - Interactive demo scenario presets for immediate demonstration.

---

## System Architecture

```
                      Browser Client (React 18 + TS + Tailwind)
                                         |
                                         v HTTP / JSON
                            FastAPI Backend Server (Port 8000)
                               /            \
                              v              v
                     SQLite Database    Open-Meteo REST API
                 (Plants, Rules, Logs)  (Live Weather Telemetry)
```

For complete technical specifications, see [docs/system_architecture.md](docs/system_architecture.md).

---

## Directory Structure

```
rootwise/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # REST Endpoints (advisory, plants, weather, etc.)
│   │   ├── core/             # Configuration & environment settings
│   │   ├── database/         # SQLite engine & database setup
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   └── services/         # Advisory engine, weather client, seed service
│   ├── tests/                # Automated pytest test suite (20 edge-cases)
│   ├── requirements.txt      # Python dependencies
│   └── pytest.ini            # Pytest configuration
├── frontend/                 # React 18 TypeScript Web Dashboard
│   ├── src/
│   │   ├── components/       # Reusable UI widgets (WeatherWidget, AdvisoryCard, etc.)
│   │   ├── layouts/          # Responsive App layout and navigation
│   │   ├── pages/            # 8 Interactive feature pages
│   │   ├── services/         # Typed API communication layer
│   │   ├── styles/           # Tailwind and design tokens
│   │   └── types/            # TypeScript data contracts
│   ├── index.html            # Vite entry point
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Design system configuration
│   └── vite.config.ts        # Vite build tool and API proxy
├── data/                     # Synthetic test datasets (CSV)
├── docs/                     # Architectural & validation documentation
├── notebooks/                # Exploratory Data Analysis (Jupyter)
├── research/                 # Horticultural science background
└── scripts/                  # Automated verification & run scripts
```

---

## Quickstart Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

### 2. Backend Setup
```bash
cd rootwise/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Documentation: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. Frontend Setup
In a new terminal:
```bash
cd rootwise/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Automated Verification & Testing

### Running the Python Verification Script
```bash
python rootwise/scripts/verify_system.py
```

### Running Backend Pytest Suite
```bash
cd rootwise/backend
pytest -v
```
Validates all 20 edge-case test scenarios, API status codes, and deterministic advisory synthesis.

---

## Horticultural Research & Citations

The RootWise decision framework is grounded in:
1. **Royal Horticultural Society (RHS):** Houseplant moisture tolerances and seasonal care.
2. **University of Minnesota Extension:** Rhizosphere aeration and perched water table mechanics.
3. **USDA Natural Resources Conservation Service (NRCS):** Substrate field capacity and hydrophobic compaction.
4. **Clemson Cooperative Extension:** Meteorological rain preemption and irrigation timing.
5. **Texas A&M AgriLife Extension:** Ambient temperature and vapor pressure deficit (VPD) dynamics.

Full citations and licensing details are available in [docs/horticultural_sources_bibliography.md](docs/horticultural_sources_bibliography.md).
