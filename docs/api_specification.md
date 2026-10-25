# ROOTWISE — REST API Specification
## Capstone 10: Plant Care Intelligence

Base URL: `http://localhost:8000` (or configured deployment URL)
Swagger UI: `http://localhost:8000/api/docs`
ReDoc: `http://localhost:8000/api/redoc`
OpenAPI JSON: `http://localhost:8000/api/openapi.json`

---

### Endpoint Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check, DB connection & weather provider status |
| `GET` | `/api/plants` | List all botanical plant profiles |
| `GET` | `/api/plants/{id}` | Retrieve comprehensive plant profile and care specifications |
| `GET` | `/api/weather` | Query live Open-Meteo meteorological data with caching |
| `POST` | `/api/advisory` | Synthesize source-backed plant watering recommendation |
| `GET` | `/api/advisory/history` | Retrieve historical advisory query logs |
| `POST` | `/api/observations` | Record qualitative or capacitive soil moisture observation |
| `GET` | `/api/observations` | List soil moisture observation logs |
| `GET` | `/api/sources` | List all horticultural citations and research bibliography |
| `GET` | `/api/sources/rules` | Retrieve full decision engine rule definitions |
| `GET` | `/api/dataset/summary` | Synthetic evaluation dataset statistics & distributions |
| `GET` | `/api/evaluation` | Decision engine validation & ML readiness status |

---

### Key Payload Examples

#### `POST /api/advisory` Request
```json
{
  "plant_id": "monstera",
  "growth_stage": "vegetative",
  "soil_type": "potting_mix",
  "pot_size": "medium",
  "has_drainage": true,
  "light_exposure": "indoor_bright",
  "moisture_type": "qualitative",
  "moisture_qualitative": "dry",
  "latitude": 12.97,
  "longitude": 77.59,
  "location_name": "Bangalore Greenery"
}
```

#### `POST /api/advisory` Response
```json
{
  "id": 1,
  "decision": "WATER_NOW",
  "recommendation": "Water thoroughly until liquid drains freely from bottom holes.",
  "explanation": "Soil is dry and ambient conditions indicate high evapotranspiration demand.",
  "evidence_quality": "strong",
  "rule_ids": ["RULE_TROPICAL_MOISTURE_DEFICIT"],
  "source_ids": ["RHS_HOUSEPLANTS_2023", "UMN_EXT_WATERING"],
  "inputs_considered": {
    "plant_id": "monstera",
    "growth_stage": "vegetative",
    "soil_type": "potting_mix",
    "temperature_c": 28.4
  },
  "missing_inputs": [],
  "data_quality_warnings": [],
  "suggested_next_action": "Check soil in 4-6 days using finger test down to 2 inches depth.",
  "created_at": "2026-10-25T12:00:00Z",
  "is_demo_data": false
}
```
