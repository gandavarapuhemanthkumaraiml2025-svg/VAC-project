# ROOTWISE — System Architecture & Design Specification
## Capstone 10: AI-Based Plant Watering Advisory

### 1. Architectural Overview
RootWise employs a modern decoupled client-server architecture designed for reliability, explainability, and fast edge response times.

```
+-------------------------------------------------------------------------+
|                           REACT 18 FRONTEND                             |
|  - Advisory Synthesis Form           - Botanical Encyclopedia Library   |
|  - Meteorological Telemetry Station  - Observation Logger & Audit Trail |
|  - Explainable Rules Inspector       - Synthetic Dataset & ML Metrics   |
+------------------------------------+------------------------------------+
                                     | HTTP REST (JSON)
                                     v
+-------------------------------------------------------------------------+
|                        FASTAPI PYTHON BACKEND                           |
|  - Lifespan Startup & DB Seeder     - REST Routers (/api/advisory etc.) |
|  - Deterministic Decision Engine    - In-Memory Meteorological Cache    |
|  - Pydantic v2 Schema Validation   - SQLAlchemy Core ORM               |
+-------------------+--------------------------------+--------------------+
                    |                                |
                    v                                v
+----------------------------+      +-------------------------------------+
|      SQLITE DATABASE       |      |          OPEN-METEO API             |
|  - Plant Profiles (8 spp)  |      |  - Live Ambient Temperature         |
|  - Decision Rules (20+)    |      |  - Precipitation Past 24h           |
|  - Advisory Audit Trail    |      |  - 24h Rain Forecast & Probability  |
|  - Soil Observations       |      |  - Relative Humidity & Wind Speed   |
+----------------------------+      +-------------------------------------+
```

---

### 2. Decision Support Engine Pipeline

The decision engine evaluates advisory queries via a multi-stage sequential filter:

```
                      Incoming Request
                             |
                             v
           +-----------------------------------+
           |    Data Sanitization & Validation |
           +-----------------+-----------------+
                             |
                             v
           +-----------------------------------+
           |  Tier 1: Hydrological Safeguards  |  ---> Triggered? ---> RETURN (WAIT)
           |  (Drainage check, Saturation)     |
           +-----------------+-----------------+
                             | Pass
                             v
           +-----------------------------------+
           | Tier 2: Meteorological Preemption |  ---> Rain Imminent? ---> RETURN (WAIT)
           | (Precipitation Forecast > 5mm)    |
           +-----------------+-----------------+
                             | Pass
                             v
           +-----------------------------------+
           | Tier 3: Thermal / Seasonal Stress |  ---> Extreme Heat / Dormancy
           +-----------------+-----------------+
                             | Pass
                             v
           +-----------------------------------+
           | Tier 4: Species Botanical Bounds  |  ---> Target Moisture Check
           +-----------------+-----------------+
                             |
                             v
             Synthesized Advisory JSON Response
             (Decision, Explanation, Rule IDs,
              Source Citations, Warnings)
```

---

### 3. Data Models & Relational Schema

1. **`PlantProfile`**: Contains species ID, common name, binomial name, care difficulty rating, preferred and tolerable moisture intervals, and growth stage multipliers.
2. **`DecisionRule`**: Encapsulates rule conditions, priority integer, advisory label, evidence quality string, and mapped horticultural source IDs.
3. **`AdvisoryLog`**: Captures historical decision queries with timestamp, input snapshot, recommendation string, and triggered rule identifiers.
4. **`SoilObservation`**: Records longitudinal qualitative checks (dry/moist/wet) and analog capacitive probe percentages.
5. **`SourceReference`**: Comprehensive citations mapping rules to USDA, RHS, and university agricultural extension publications.

---

### 4. Resiliency & Graceful Degradation Strategy

- **Meteorological Cache:** In-memory dictionary with a 15-minute TTL keyed by quantized latitude/longitude coordinates prevents external API quota exhaustion.
- **Offline / Outage Fallback:** If Open-Meteo returns HTTP 5xx or network errors, RootWise automatically switches to fallback meteorological values, adjusts `evidence_quality` to `weak`, and inserts a prominent data reliability warning into the recommendation payload.
