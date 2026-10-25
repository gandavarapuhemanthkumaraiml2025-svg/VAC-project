# ROOTWISE Research: Horticultural Decision Framework

## 1. Problem Formulation
Plant watering failure modes follow an asymmetric risk curve:
- **Underwatering (Water Deficit):** Manifests as gradual turgor loss, leaf curl, and lower foliage senescence. If detected in reasonable time, plant tissue recovers with water replenishment within 4-12 hours.
- **Overwatering (Oxygen Deficit / Root Hypoxia):** Kills root hair cells within 24-48 hours through lack of dissolved oxygen in saturated pore spaces. Anaerobic fungal pathgens (*Pythium*, *Rhizoctonia*, *Fusarium*) proliferate rapidly. Recovery requires repotting, pruning necrotic roots, and often fails completely.

Therefore, the RootWise advisory engine implements an **asymmetric precautionary principle**:
When uncertainty is high, or container drainage is compromised, the safe default action is `WAIT` or `CHECK_SOIL`, never an automated unconditional recommendation to add water.

---

## 2. Soil Physics & Substrate Retentive Capacities

| Substrate Type | Field Capacity (% v/v) | Permanent Wilting Point (%) | Plant Available Water (%) | Aeration Porosity |
|---|---|---|---|---|
| **Coarse Sand** | 10% | 4% | 6% | High (30%) |
| **Loamy Garden Soil** | 28% | 12% | 16% | Moderate (18%) |
| **Heavy Clay** | 40% | 22% | 18% | Low (8%) |
| **Peat / Perlite Mix** | 55% | 20% | 35% | High (25%) |
| **Cocopeat (Coir)** | 60% | 22% | 38% | High (22%) |
| **Cactus / Pumice Mix** | 20% | 6% | 14% | Very High (40%) |

---

## 3. Atmospheric Evaporative Demand & Weather Coupling

Transpiration rate $E$ is governed by the Penman-Monteith equation approximating vapor pressure deficit ($VPD$):
$$VPD = e_s(T) - e_a$$
Where:
- $e_s(T)$ is saturation vapor pressure at temperature $T$
- $e_a$ is actual atmospheric vapor pressure (computed from relative humidity $RH$)

When $T > 32^\circ\text{C}$ and $RH < 40\%$, $VPD$ spikes above 2.5 kPa, tripling foliage water loss. Conversely, rainy or overcast conditions with $RH > 80\%$ suppress transpiration to near zero, rendering manual watering harmful.
