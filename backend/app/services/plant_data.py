"""
Plant profile seed data for RootWise.
Based on university extension and horticultural authority sources.
See research/source_register.md for full citations.
"""

PLANT_PROFILES = [
    {
        "id": "tomato",
        "name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "profile_description": (
            "Tomatoes are warm-season fruiting crops widely grown in containers. "
            "They have moderate-to-high water requirements and are sensitive to both "
            "drought stress and waterlogging. Consistent soil moisture is especially "
            "critical during flowering and fruit development. Container tomatoes dry out "
            "faster than in-ground plants and may need daily watering in hot weather."
        ),
        "care_difficulty": "moderate",
        "moisture_guidance": {
            "summary": "Keep soil consistently moist but never waterlogged. Inconsistent moisture "
                       "can cause blossom end rot and cracking.",
            "preferred_qualitative": "moist",
            "acceptable_qualitative": ["slightly_moist", "moist"],
            "avoid_qualitative": ["dry", "wet"],
            "percentage_guidance": {
                "note": "Volumetric water content varies greatly by soil type and sensor calibration. "
                        "Use as a general guide only.",
                "low_threshold_pct": 30,
                "adequate_range_pct": [40, 70],
                "high_threshold_pct": 80
            },
            "watering_frequency_note": "Small containers (< 20 cm) may need watering daily in summer. "
                                       "Check soil 5 cm deep before watering.",
            "signs_of_underwatering": ["wilting", "leaf curl", "dry crusty soil"],
            "signs_of_overwatering": ["yellowing lower leaves", "root rot", "soggy soil", "fungal issues"]
        },
        "growth_stages": [
            {
                "stage": "seedling",
                "label": "Seedling (0–3 weeks)",
                "moisture_note": "Keep soil evenly moist. Avoid waterlogging which causes damping off. "
                                 "Very small root zone dries quickly.",
                "watering_frequency": "Daily to every 2 days depending on temperature.",
                "caution": "high_moisture_risk"
            },
            {
                "stage": "vegetative",
                "label": "Vegetative Growth",
                "moisture_note": "Moderate consistent moisture. Allow top 1–2 cm to dry between waterings.",
                "watering_frequency": "Every 1–3 days depending on pot size, temperature.",
                "caution": None
            },
            {
                "stage": "flowering",
                "label": "Flowering",
                "moisture_note": "Consistent moisture critical. Drought stress during flowering reduces fruit set.",
                "watering_frequency": "Every 1–2 days. Do not let soil dry completely.",
                "caution": "consistency_critical"
            },
            {
                "stage": "fruiting",
                "label": "Fruit Development",
                "moisture_note": "Even moisture critical to prevent blossom end rot and fruit cracking. "
                                 "Irregular watering causes quality issues.",
                "watering_frequency": "Every 1–2 days. Check daily in hot weather.",
                "caution": "consistency_critical"
            }
        ],
        "soil_preferences": {
            "recommended": ["potting_mix", "loamy"],
            "acceptable": ["cocopeat", "peat"],
            "avoid": ["clay", "garden_soil"],
            "notes": "Well-draining potting mix preferred. Add perlite for improved drainage."
        },
        "environmental_factors": {
            "optimal_temp_c": [18, 29],
            "heat_stress_above_c": 35,
            "light_requirement": "full_sun",
            "min_daily_sun_hours": 6,
            "humidity_note": "High humidity can encourage fungal disease; good airflow recommended."
        },
        "source_ids": ["tnau_tomato", "ucdavis_tomato", "rhs_tomato"]
    },
    {
        "id": "basil",
        "name": "Basil",
        "scientific_name": "Ocimum basilicum",
        "profile_description": (
            "Basil is a warm-season herb commonly grown in containers. "
            "It prefers evenly moist but well-drained soil. Overwatering is a common cause "
            "of failure; basil roots are very susceptible to rot in waterlogged conditions. "
            "It wilts dramatically but often recovers quickly when watered. "
            "Basil is sensitive to cold and cold water."
        ),
        "care_difficulty": "easy",
        "moisture_guidance": {
            "summary": "Keep soil evenly moist but never soggy. Allow the top 1 cm to dry "
                       "between waterings. Basil wilts easily but overwatering is more dangerous.",
            "preferred_qualitative": "slightly_moist",
            "acceptable_qualitative": ["slightly_moist", "moist"],
            "avoid_qualitative": ["dry", "wet"],
            "percentage_guidance": {
                "note": "These are approximate guides. Soil type and sensor calibration affect readings.",
                "low_threshold_pct": 25,
                "adequate_range_pct": [35, 60],
                "high_threshold_pct": 70
            },
            "watering_frequency_note": "Water when top 1 cm of soil is dry. In hot weather this may be daily.",
            "signs_of_underwatering": ["wilting", "dry brittle leaves", "soil pulling from pot edges"],
            "signs_of_overwatering": ["yellowing leaves", "mushy stems", "root rot", "fungus gnats"]
        },
        "growth_stages": [
            {
                "stage": "seedling",
                "label": "Seedling",
                "moisture_note": "Keep evenly moist but do not let water stand. Very susceptible to damping off.",
                "watering_frequency": "Light watering every 1–2 days.",
                "caution": "high_moisture_risk"
            },
            {
                "stage": "vegetative",
                "label": "Vegetative / Harvesting",
                "moisture_note": "Allow top 1 cm to dry between waterings. "
                                 "Water morning to reduce fungal risk.",
                "watering_frequency": "Every 1–3 days.",
                "caution": None
            },
            {
                "stage": "flowering",
                "label": "Flowering (pinch flowers for continued harvest)",
                "moisture_note": "Reduce watering slightly. Ensure good drainage.",
                "watering_frequency": "Every 2–4 days.",
                "caution": None
            }
        ],
        "soil_preferences": {
            "recommended": ["potting_mix", "loamy"],
            "acceptable": ["cocopeat"],
            "avoid": ["clay", "sandy", "garden_soil"],
            "notes": "Rich, well-draining potting mix. Drainage holes essential."
        },
        "environmental_factors": {
            "optimal_temp_c": [18, 30],
            "heat_stress_above_c": 35,
            "cold_sensitive_below_c": 10,
            "light_requirement": "full_sun",
            "min_daily_sun_hours": 6,
            "humidity_note": "Moderate humidity preferred. Avoid wetting leaves to reduce fungal disease."
        },
        "source_ids": ["tnau_basil", "ucdavis_herbs", "rhs_basil"]
    },
    {
        "id": "aloe_vera",
        "name": "Aloe Vera",
        "scientific_name": "Aloe barbadensis miller",
        "profile_description": (
            "Aloe vera is a succulent adapted to arid conditions. Its fleshy leaves "
            "store water, making it highly tolerant of drought but very sensitive to "
            "overwatering and poor drainage. Overwatering is the most common cause of death. "
            "The soil must dry out almost completely between waterings. "
            "It requires excellent drainage and is well-suited to cactus/succulent mix."
        ),
        "care_difficulty": "easy",
        "moisture_guidance": {
            "summary": "Allow soil to dry out almost completely between waterings. "
                       "When in doubt, do not water. Overwatering is far more dangerous than underwatering.",
            "preferred_qualitative": "dry",
            "acceptable_qualitative": ["dry", "slightly_moist"],
            "avoid_qualitative": ["moist", "wet"],
            "percentage_guidance": {
                "note": "Aloe prefers very dry conditions. Standard moisture meters may not be "
                        "well-calibrated for cactus mix. Use as a rough guide only.",
                "low_threshold_pct": 10,
                "adequate_range_pct": [10, 25],
                "high_threshold_pct": 35
            },
            "watering_frequency_note": "Water thoroughly then allow soil to dry completely. "
                                       "In summer: every 2–4 weeks. In winter: every 4–8 weeks.",
            "signs_of_underwatering": ["wrinkled or thin leaves", "brown leaf tips"],
            "signs_of_overwatering": ["mushy translucent leaves", "root rot", "brown soft base", "falling leaves"]
        },
        "growth_stages": [
            {
                "stage": "seedling",
                "label": "Young Plant / Pup",
                "moisture_note": "Slightly more frequent watering than mature aloe but still err on dry side. "
                                 "Never let sit in water.",
                "watering_frequency": "Every 2–3 weeks. Check soil is dry first.",
                "caution": "moderate_moisture_risk"
            },
            {
                "stage": "mature",
                "label": "Mature Plant",
                "moisture_note": "Water only when soil is dry 5–7 cm deep. "
                                 "In winter, water even less frequently.",
                "watering_frequency": "Every 2–4 weeks in growing season; 4–8 weeks in winter.",
                "caution": "overwatering_risk"
            },
            {
                "stage": "dormant",
                "label": "Dormancy (winter)",
                "moisture_note": "Minimal watering. Do not water if soil still has any moisture.",
                "watering_frequency": "Every 4–8 weeks or less.",
                "caution": "overwatering_risk"
            }
        ],
        "soil_preferences": {
            "recommended": ["cactus_mix", "sandy"],
            "acceptable": ["potting_mix"],
            "avoid": ["clay", "peat", "garden_soil"],
            "notes": "Cactus/succulent mix with added perlite or coarse sand. "
                     "Drainage holes are non-negotiable."
        },
        "environmental_factors": {
            "optimal_temp_c": [15, 32],
            "cold_sensitive_below_c": 5,
            "light_requirement": "full_sun",
            "min_daily_sun_hours": 6,
            "drought_tolerant": True,
            "humidity_note": "Tolerates low humidity well. High humidity combined with poor drainage increases rot risk."
        },
        "source_ids": ["tnau_aloe", "ucdavis_succulents", "rhs_aloe"]
    }
]


SOURCES = [
    {
        "id": "tnau_tomato",
        "title": "Tomato Cultivation - Package of Practices",
        "url": "https://agritech.tnau.ac.in/horticulture/horti_veg_tomato.html",
        "publisher": "Tamil Nadu Agricultural University (TNAU)",
        "access_date": "2025-01-15",
        "relevant_guidance": "Tomato irrigation requirements, growth stage water management, "
                             "container cultivation guidance for Tamil Nadu conditions.",
        "covered_plants": ["tomato"],
        "covered_rules": ["RULE_T01", "RULE_T02", "RULE_T03"],
        "scope_and_limitations": "Guidance is primarily for field and greenhouse cultivation in "
                                  "Tamil Nadu, India. Container-specific adjustments may be needed.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "ucdavis_tomato",
        "title": "Tomatoes: Organic Production in the Home Garden",
        "url": "https://anrcatalog.ucanr.edu/",
        "publisher": "University of California Cooperative Extension",
        "access_date": "2025-01-15",
        "relevant_guidance": "Soil moisture management, watering frequency, blossom end rot prevention, "
                             "consistent moisture importance for container tomatoes.",
        "covered_plants": ["tomato"],
        "covered_rules": ["RULE_T01", "RULE_T04"],
        "scope_and_limitations": "Based on California conditions. Temperature ranges may differ.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "rhs_tomato",
        "title": "Growing tomatoes — RHS advice",
        "url": "https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own",
        "publisher": "Royal Horticultural Society (RHS)",
        "access_date": "2025-01-15",
        "relevant_guidance": "Container tomato watering guidance. Daily watering in hot weather, "
                             "consistent moisture for fruit quality.",
        "covered_plants": ["tomato"],
        "covered_rules": ["RULE_T01", "RULE_T03"],
        "scope_and_limitations": "UK climate context. Outdoor summer temperatures differ from tropical regions.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "tnau_basil",
        "title": "Basil Cultivation — TNAU Agritech Portal",
        "url": "https://agritech.tnau.ac.in/horticulture/horti_herb_basil.html",
        "publisher": "Tamil Nadu Agricultural University (TNAU)",
        "access_date": "2025-01-15",
        "relevant_guidance": "Basil irrigation, drainage requirements, tropical climate basil production.",
        "covered_plants": ["basil"],
        "covered_rules": ["RULE_B01", "RULE_B02"],
        "scope_and_limitations": "Tamil Nadu field and container conditions.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "ucdavis_herbs",
        "title": "Herb Gardening: Basil",
        "url": "https://ucanr.edu/",
        "publisher": "UC Agriculture & Natural Resources",
        "access_date": "2025-01-15",
        "relevant_guidance": "Moisture management for container basil. Overwatering risks and well-drained soil.",
        "covered_plants": ["basil"],
        "covered_rules": ["RULE_B01", "RULE_B03"],
        "scope_and_limitations": "General herb gardening guidance.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "rhs_basil",
        "title": "How to grow basil",
        "url": "https://www.rhs.org.uk/herbs/basil/grow-your-own",
        "publisher": "Royal Horticultural Society (RHS)",
        "access_date": "2025-01-15",
        "relevant_guidance": "Container basil watering: allow top to dry, drainage critical, wilting and recovery.",
        "covered_plants": ["basil"],
        "covered_rules": ["RULE_B01", "RULE_B02"],
        "scope_and_limitations": "UK climate reference.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "tnau_aloe",
        "title": "Aloe vera Cultivation",
        "url": "https://agritech.tnau.ac.in/horticulture/medicinal_aloe.html",
        "publisher": "Tamil Nadu Agricultural University (TNAU)",
        "access_date": "2025-01-15",
        "relevant_guidance": "Aloe drought tolerance, minimal irrigation needs, well-drained soil requirement.",
        "covered_plants": ["aloe_vera"],
        "covered_rules": ["RULE_A01", "RULE_A02"],
        "scope_and_limitations": "Commercial field cultivation. Container adjustments needed.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "ucdavis_succulents",
        "title": "Succulents: Aloe and Related Species",
        "url": "https://ucanr.edu/",
        "publisher": "UC Agriculture & Natural Resources",
        "access_date": "2025-01-15",
        "relevant_guidance": "Succulent watering cycle: soak and dry. Overwatering as primary failure cause.",
        "covered_plants": ["aloe_vera"],
        "covered_rules": ["RULE_A01", "RULE_A03"],
        "scope_and_limitations": "General succulent guidance.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "rhs_aloe",
        "title": "Aloe vera — RHS plant guide",
        "url": "https://www.rhs.org.uk/plants/aloe",
        "publisher": "Royal Horticultural Society (RHS)",
        "access_date": "2025-01-15",
        "relevant_guidance": "Aloe vera container care, winter dormancy watering reduction, drainage requirements.",
        "covered_plants": ["aloe_vera"],
        "covered_rules": ["RULE_A01", "RULE_A02", "RULE_A03"],
        "scope_and_limitations": "UK climate reference.",
        "licence": "Public educational resource",
        "source_type": "horticulture"
    },
    {
        "id": "open_meteo",
        "title": "Open-Meteo Free Weather API",
        "url": "https://open-meteo.com",
        "publisher": "Open-Meteo",
        "access_date": "2025-01-15",
        "relevant_guidance": "Current weather, hourly forecast, precipitation, temperature data.",
        "covered_plants": None,
        "covered_rules": ["RULE_W01", "RULE_W02"],
        "scope_and_limitations": "Global coverage. Forecast accuracy varies by location and lead time. "
                                  "1–16 day forecast. Precipitation reflects regional weather, not container soil moisture.",
        "licence": "CC BY 4.0 — Attribution required",
        "source_type": "weather"
    }
]


RULES = [
    # ─── Tomato Rules ─────────────────────────────────────────────────────────
    {
        "id": "RULE_T01",
        "version": "1.0",
        "plant_scope": ["tomato"],
        "condition_description": "Tomato: qualitative soil is DRY → water needed",
        "decision_effect": "WATER_NOW",
        "priority": 2,
        "explanation_template": "Soil observed as dry. Tomatoes require consistent moisture "
                                "and should not be allowed to dry out, especially during "
                                "vegetative, flowering, and fruiting stages.",
        "source_ids": ["tnau_tomato", "rhs_tomato"],
        "limitations": "Based on qualitative observation. Verify by checking 5 cm deep."
    },
    {
        "id": "RULE_T02",
        "version": "1.0",
        "plant_scope": ["tomato"],
        "condition_description": "Tomato: qualitative soil is WET → wait, risk of overwatering",
        "decision_effect": "WAIT",
        "priority": 1,
        "explanation_template": "Soil is wet. Adding more water risks waterlogging, "
                                "root oxygen deprivation, and root rot in tomatoes.",
        "source_ids": ["tnau_tomato", "ucdavis_tomato"],
        "limitations": None
    },
    {
        "id": "RULE_T03",
        "version": "1.0",
        "plant_scope": ["tomato"],
        "condition_description": "Tomato: soil percentage below 30% → water needed",
        "decision_effect": "WATER_NOW",
        "priority": 3,
        "explanation_template": "Soil moisture percentage is below the low threshold for tomatoes. "
                                "Tomatoes experience drought stress below approximately 30% VWC "
                                "(this threshold varies by soil type and sensor calibration).",
        "source_ids": ["ucdavis_tomato"],
        "limitations": "VWC thresholds are approximate and depend on soil type and sensor calibration."
    },
    {
        "id": "RULE_T04",
        "version": "1.0",
        "plant_scope": ["tomato"],
        "condition_description": "Tomato: percentage above 80% → wait",
        "decision_effect": "WAIT",
        "priority": 1,
        "explanation_template": "Soil moisture is high. No additional watering needed.",
        "source_ids": ["ucdavis_tomato"],
        "limitations": "Percentage readings depend on sensor type and soil calibration."
    },
    # ─── Basil Rules ──────────────────────────────────────────────────────────
    {
        "id": "RULE_B01",
        "version": "1.0",
        "plant_scope": ["basil"],
        "condition_description": "Basil: qualitative soil is WET → wait, high overwatering risk",
        "decision_effect": "WAIT",
        "priority": 1,
        "explanation_template": "Soil is wet. Basil is highly susceptible to root rot in waterlogged conditions. "
                                "Allow the soil to drain and dry before considering watering.",
        "source_ids": ["rhs_basil", "ucdavis_herbs"],
        "limitations": None
    },
    {
        "id": "RULE_B02",
        "version": "1.0",
        "plant_scope": ["basil"],
        "condition_description": "Basil: qualitative soil is DRY → water needed",
        "decision_effect": "WATER_NOW",
        "priority": 2,
        "explanation_template": "Basil soil is dry. Water thoroughly until water drains from the bottom. "
                                "Basil wilts quickly when dry but recovers well if watered promptly.",
        "source_ids": ["tnau_basil", "rhs_basil"],
        "limitations": "Water in the morning if possible to reduce fungal disease risk."
    },
    {
        "id": "RULE_B03",
        "version": "1.0",
        "plant_scope": ["basil"],
        "condition_description": "Basil: percentage above 70% → wait",
        "decision_effect": "WAIT",
        "priority": 1,
        "explanation_template": "Soil moisture is at or above the upper adequate range for basil. "
                                "Wait until soil begins to dry before watering again.",
        "source_ids": ["ucdavis_herbs"],
        "limitations": "Threshold is approximate and sensor-dependent."
    },
    # ─── Aloe Rules ───────────────────────────────────────────────────────────
    {
        "id": "RULE_A01",
        "version": "1.0",
        "plant_scope": ["aloe_vera"],
        "condition_description": "Aloe: qualitative soil is WET or MOIST → wait, high overwatering risk",
        "decision_effect": "WAIT",
        "priority": 1,
        "explanation_template": "Aloe vera soil still has moisture. Aloe is adapted to arid conditions and "
                                "must dry out almost completely between waterings. "
                                "Overwatering is the primary cause of aloe failure.",
        "source_ids": ["tnau_aloe", "ucdavis_succulents", "rhs_aloe"],
        "limitations": None
    },
    {
        "id": "RULE_A02",
        "version": "1.0",
        "plant_scope": ["aloe_vera"],
        "condition_description": "Aloe: qualitative soil is DRY → water may be needed",
        "decision_effect": "WATER_NOW",
        "priority": 2,
        "explanation_template": "Aloe soil is dry, which is the correct condition before watering. "
                                "Water thoroughly until water drains from the bottom, then do not water again "
                                "until the soil is completely dry.",
        "source_ids": ["tnau_aloe", "rhs_aloe"],
        "limitations": "In winter/dormancy, aloe needs even less water. Confirm season before watering."
    },
    {
        "id": "RULE_A03",
        "version": "1.0",
        "plant_scope": ["aloe_vera"],
        "condition_description": "Aloe: percentage above 35% → definitely wait",
        "decision_effect": "WAIT",
        "priority": 1,
        "explanation_template": "Soil moisture percentage is above the high threshold for aloe vera. "
                                "Aloe must have soil dry to approximately 10% before watering is considered.",
        "source_ids": ["ucdavis_succulents"],
        "limitations": "Thresholds are approximate for cactus mix; standard potting mix will differ."
    },
    # ─── Universal Rules ──────────────────────────────────────────────────────
    {
        "id": "RULE_GEN01",
        "version": "1.0",
        "plant_scope": None,
        "condition_description": "Missing soil moisture observation → check soil",
        "decision_effect": "CHECK_SOIL",
        "priority": 0,  # highest priority
        "explanation_template": "No soil moisture observation has been provided. "
                                "Without knowing the current soil condition, a watering recommendation "
                                "cannot be reliably made. Please check the soil manually.",
        "source_ids": [],
        "limitations": None
    },
    {
        "id": "RULE_GEN02",
        "version": "1.0",
        "plant_scope": None,
        "condition_description": "Stale soil moisture observation (> 24 hours old) → check soil",
        "decision_effect": "CHECK_SOIL",
        "priority": 1,
        "explanation_template": "The soil moisture reading is more than 24 hours old. "
                                "Soil moisture changes significantly with temperature, drainage, and plant uptake. "
                                "A fresh observation is recommended before making a watering decision.",
        "source_ids": [],
        "limitations": "Staleness threshold is set to 24 hours; this may be too conservative for "
                       "slow-draining soils and too lenient for small pots in hot weather."
    },
    {
        "id": "RULE_W01",
        "version": "1.0",
        "plant_scope": None,
        "condition_description": "Significant recent rainfall (>= 5mm last 24h) with moist soil → wait",
        "decision_effect": "WAIT",
        "priority": 2,
        "explanation_template": "Significant rainfall was recorded in the last 24 hours AND the soil "
                                "moisture observation indicates adequate moisture. "
                                "Note: rainfall data reflects outdoor conditions. "
                                "Container soil moisture may differ from regional rainfall data.",
        "source_ids": ["open_meteo"],
        "limitations": "Regional rainfall does not guarantee that a specific container received adequate water. "
                       "A direct soil check is more reliable than rainfall data alone."
    },
    {
        "id": "RULE_W02",
        "version": "1.0",
        "plant_scope": None,
        "condition_description": "High forecast rainfall (>= 10mm, >70% probability) with moist soil → wait",
        "decision_effect": "WAIT",
        "priority": 3,
        "explanation_template": "Significant rainfall is forecast in the next 24 hours with high probability. "
                                "Combined with adequate current moisture, watering can be deferred. "
                                "Note: container plants in covered areas may not receive forecast rain.",
        "source_ids": ["open_meteo"],
        "limitations": "Forecast data: accuracy decreases with lead time. "
                       "Container plants in sheltered positions do not benefit from outdoor rainfall."
    }
]
