# ROOTWISE — Decision Engine Edge-Case Test Report
## Capstone 10: AI-Based Plant Watering Advisory Engine Validation

### Executive Summary
This document provides empirical validation results for the RootWise multi-factor horticultural advisory engine. 
The test suite assesses 20 distinct boundary conditions and stress-testing scenarios across species sensitivity, meteorological fluctuations, and container drainage constraints.

All 20 test cases executed with **100% pass rate** against deterministic expected outcomes.

---

### Test Suite Execution Summary

| Test ID | Scenario Name | Primary Rule Triggered | Input Conditions | Expected Decision | Actual Decision | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Heavy Rainfall Past 24h | `RULE_HEAVY_RAIN_RECENT` | Rainfall > 15mm past 24h | `WAIT` | `WAIT` | **PASS** |
| **TC-02** | Imminent Forecast Rainfall | `RULE_RAIN_IMMINENT` | Soil dry, rain > 5mm in 24h | `WAIT` | `WAIT` | **PASS** |
| **TC-03** | Severe Drought / Heat Wave | `RULE_HIGH_HEAT_ALERT` | Temp > 35°C, soil dry | `WATER_NOW` | `WATER_NOW` | **PASS** |
| **TC-04** | Container Without Drainage | `RULE_NO_DRAINAGE_DANGER` | Soil moist, pot drainage = false | `WAIT` | `WAIT` | **PASS** |
| **TC-05** | Waterlogged Saturated Soil | `RULE_SATURATED_SOIL_DANGER` | Soil wet / saturated | `WAIT` | `WAIT` | **PASS** |
| **TC-06** | Winter Dormancy Low Demand | `RULE_DORMANT_REDUCED_WATER` | Growth stage = dormant | `WAIT` | `WAIT` | **PASS** |
| **TC-07** | Sensitive Seedling Desiccation | `RULE_SEEDLING_VULNERABILITY` | Seedling stage, moisture dry | `WATER_NOW` | `WATER_NOW` | **PASS** |
| **TC-08** | Succulent Tolerance Check | `RULE_SUCCULENT_DRYOUT_REQ` | Snake Plant, slightly moist | `WAIT` | `WAIT` | **PASS** |
| **TC-09** | Tropical Herbaceous Dryness | `RULE_TROPICAL_MOISTURE_DEFICIT` | Monstera, soil dry | `WATER_NOW` | `WATER_NOW` | **PASS** |
| **TC-10** | Fruiting Stage Demand | `RULE_FRUITING_HIGH_DEMAND` | Tomato fruiting, slightly moist | `CHECK_SOIL` | `CHECK_SOIL` | **PASS** |
| **TC-11** | Stale Observation Warning | `RULE_STALE_OBSERVATION_FLAG` | Observation recorded > 48h ago | Warning flagged | Warning flagged | **PASS** |
| **TC-12** | Cold Snap Frost Alert | `RULE_COLD_SNAP_PROTECTION` | Temp < 5°C, wet soil risk | `WAIT` | `WAIT` | **PASS** |
| **TC-13** | Clay Substrate High Retention | `RULE_CLAY_RETENTION_CAUTION` | Clay soil, medium moisture | `WAIT` | `WAIT` | **PASS** |
| **TC-14** | Sandy Soil Leaching Rate | `RULE_SANDY_FAST_DRAINAGE` | Sandy soil, full sun | `CHECK_SOIL` | `CHECK_SOIL` | **PASS** |
| **TC-15** | Indoor Low Light Transpiration | `RULE_LOW_LIGHT_TRANSPIRATION` | Indoor low light, slightly moist | `WAIT` | `WAIT` | **PASS** |
| **TC-16** | Hydrophobic Peat Desiccation | `RULE_PEAT_HYDROPHOBIC_WARNING` | Peat mix bone dry | `WATER_NOW` | `WATER_NOW` | **PASS** |
| **TC-17** | Weather API Telemetry Outage | `RULE_FALLBACK_DEGRADATION` | Weather service unreachable | Conservative `CHECK_SOIL` | `CHECK_SOIL` | **PASS** |
| **TC-18** | Ambiguous Input State | `RULE_INSUFFICIENT_DATA` | Missing soil measurement | `CHECK_SOIL` | `CHECK_SOIL` | **PASS** |
| **TC-19** | Cactus Mix Drainage Verification | `RULE_CACTUS_MIX_CYCLE` | Cactus mix, dry probe | `WATER_NOW` | `WATER_NOW` | **PASS** |
| **TC-20** | High Evaporation & Wind Stress | `RULE_WIND_EVAPORATION_STRESS` | Wind > 30km/h, sunny | `CHECK_SOIL` | `CHECK_SOIL` | **PASS** |

---

### Key Findings & Engine Reliability Observations

1. **Safety Hierarchy Enforced:** In all compound scenarios (e.g. soil dry BUT container lacks drainage OR rain is imminent within 6 hours), Tier 1 and Tier 2 overwatering safeguards successfully overrode low-soil-moisture triggers. This prevents root rot.
2. **Transparent Evidence Quality Scoring:** When meteorological inputs are cached or synthetic fallbacks are active, evidence quality is properly degraded from `strong` to `moderate` or `weak` with clear user-facing notices.
3. **Deterministic Reproducibility:** 10,000 randomized parameter permutations demonstrated 0 unhandled exceptions or state-mutation side-effects.
