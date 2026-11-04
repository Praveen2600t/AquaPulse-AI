from typing import List, Dict, Any

class ComponentHealthEngine:
    """
    Calculates health %, degradation, fouling index, and actionable recommendations
    for all 5 core stages of the water purifier based on physical wear and sensor readings.
    """

    @staticmethod
    def evaluate_all(reading: Dict[str, Any]) -> List[Dict[str, Any]]:
        dp_pre = reading.get("pre_filter_dp", 4.2)
        turbidity = reading.get("feed_turbidity", 1.4)
        salt_rej = reading.get("salt_rejection", 95.8)
        feed_ec = reading.get("feed_ec", 720.0)
        orp = reading.get("feed_orp", 320.0)
        p3 = reading.get("p3_membrane_pressure", 87.0)
        total_liters = reading.get("total_liters_purified", 14820.0)
        operating_mode = reading.get("operating_mode", "NORMAL")

        # 1. Sediment Filter (Stage 1 - 5 Micron Polypropylene Spun)
        # Primary degradation factors: Suspended solids loading, differential pressure (P1 - P2)
        # Normal DP: 2 - 8 psi. Warning: > 12 psi. Critical: > 15 psi.
        sediment_wear = min(1.0, (dp_pre - 2.0) / 16.0)
        sediment_health = max(5.0, min(100.0, 100.0 - (sediment_wear * 85.0)))
        if dp_pre > 15.0 or turbidity > 6.0:
            sed_status = "critical"
            sed_fault = "Severe Particulate Cake Fouling / Flow Choking"
            sed_rec = "Replace 5-micron sediment spun candle immediately to prevent booster pump cavitation."
            sed_days = 4
        elif dp_pre > 10.0 or turbidity > 3.0:
            sed_status = "warning"
            sed_fault = "Elevated Pre-Filter Pressure Differential"
            sed_rec = "Inspect pre-filter cartridge housing and flush sediment bowl."
            sed_days = 18
        else:
            sed_status = "healthy"
            sed_fault = None
            sed_rec = "Standard nominal filtration. Next scheduled inspection in 75 days."
            sed_days = 82

        # 2. Activated Carbon Filter (Stage 2 - Granular & Block Carbon)
        # Primary factor: Chlorine/oxidant adsorption capacity, VOC binding
        # Indicated by ORP breakthrough. Normal ORP downstream < 350 mV.
        carbon_wear = min(1.0, max(0.0, (orp - 280.0) / 250.0))
        carbon_health = max(10.0, min(100.0, 96.0 - (carbon_wear * 70.0)))
        if orp > 480.0 or operating_mode == "MEMBRANE_DEGRADED":
            carb_status = "critical"
            carb_fault = "Active Carbon Saturation / Free Chlorine Breakthrough"
            carb_rec = "Urgent: Carbon bed exhausted. Risk of irreversible RO polyamide membrane oxidation."
            carb_days = 6
        elif orp > 390.0:
            carb_status = "warning"
            carb_fault = "Adsorption Efficiency Declining"
            carb_rec = "Order replacement extruded activated carbon block cartridge."
            carb_days = 25
        else:
            carb_status = "healthy"
            carb_fault = None
            carb_rec = "Good adsorption kinetics. Chlorine and organics effectively eliminated."
            carb_days = 110

        # 3. Reverse Osmosis (RO) Membrane (Stage 3 - Thin-Film Composite Polyamide)
        # Primary factor: Salt rejection % and Net Driving Pressure
        # Healthy: Salt rejection >= 92%. Warning: 85 - 91%. Critical: < 85%.
        ro_health = max(8.0, min(100.0, (salt_rej - 60.0) / 38.0 * 100.0))
        if salt_rej < 85.0 or operating_mode in ["MEMBRANE_SCALING", "MEMBRANE_DEGRADED"]:
            ro_status = "critical"
            ro_fault = "Mineral Scaling & Salt Rejection Collapse" if salt_rej < 85.0 and orp < 450 else "Oxidative Chemical Membrane Degradation"
            ro_rec = "Perform chemical descaling (citric acid flush) or replace 75 GPD TFC RO membrane."
            ro_days = 12
        elif salt_rej < 91.0 or feed_ec > 1300.0:
            ro_status = "warning"
            ro_fault = "Elevated Salt Permeation & Incipient Biofouling"
            ro_rec = "Check recovery ratio and ensure brine reject restrictor (FR450) is not choked."
            ro_days = 38
        else:
            ro_status = "healthy"
            ro_fault = None
            ro_rec = "Excellent ion rejection efficiency (> 95%). Osmotic pressure balance optimal."
            ro_days = 165

        # 4. Ultra-Filtration (UF) Filter (Stage 4 - Hollow Fiber Polysulfone 0.01 Micron)
        # Polishing stage post-RO
        uf_health = 92.0 - min(40.0, (total_liters / 18000.0) * 20.0)
        if uf_health < 60.0:
            uf_status = "warning"
            uf_fault = "UF Membrane Silt Accumulation"
            uf_rec = "Backwash UF module or replace post-filter cartridge."
            uf_days = 42
        else:
            uf_status = "healthy"
            uf_fault = None
            uf_rec = "Hollow fiber barrier intact. Colloidal clarity preserved."
            uf_days = 140

        # 5. UV Disinfection Chamber (Stage 5 - 11W UV-C Stainless Steel 254nm Lamp)
        # Primary factor: Operating hours & ballast radiation intensity
        # Lamp life typically 9,000 hours (~365 days continuous)
        uv_hours = min(8800.0, 4200.0 + (total_liters * 0.15))
        uv_health = max(15.0, min(100.0, (1.0 - (uv_hours / 9000.0)) * 100.0))
        if uv_health < 25.0:
            uv_status = "warning"
            uv_fault = "UV-C Intensity Attenuation (End of Lamp Service Life)"
            uv_rec = "Replace Philips 11W UV-C germicidal lamp and clean quartz sleeve."
            uv_days = 20
        else:
            uv_status = "healthy"
            uv_fault = None
            uv_rec = "UV-C germicidal output at 254nm within optimal lethal dosage range."
            uv_days = 195

        return [
            {
                "id": "sediment_filter",
                "name": "Sediment Filter (5 Micron)",
                "category": "Pre-Treatment",
                "health_percentage": round(sediment_health, 1),
                "status": sed_status,
                "estimated_days_remaining": sed_days,
                "liters_processed": round(total_liters, 1),
                "rated_capacity_liters": 6000.0,
                "current_dp_psi": round(dp_pre, 2),
                "fouling_index": round(sediment_wear * 10.0, 1),
                "fault_detected": sed_fault,
                "service_recommendation": sed_rec,
                "last_replaced": "2026-08-15"
            },
            {
                "id": "carbon_filter",
                "name": "Activated Carbon Block",
                "category": "Pre-Treatment",
                "health_percentage": round(carbon_health, 1),
                "status": carb_status,
                "estimated_days_remaining": carb_days,
                "liters_processed": round(total_liters, 1),
                "rated_capacity_liters": 8000.0,
                "current_dp_psi": round(dp_pre * 0.4, 2),
                "fouling_index": round(carbon_wear * 10.0, 1),
                "fault_detected": carb_fault,
                "service_recommendation": carb_rec,
                "last_replaced": "2026-08-15"
            },
            {
                "id": "ro_membrane",
                "name": "TFC Reverse Osmosis Membrane",
                "category": "Main Separation",
                "health_percentage": round(ro_health, 1),
                "status": ro_status,
                "estimated_days_remaining": ro_days,
                "liters_processed": round(total_liters * 0.42, 1),
                "rated_capacity_liters": 15000.0,
                "current_dp_psi": round(p3 - 12.0, 2),
                "fouling_index": round(max(0.0, (100.0 - ro_health) / 10.0), 1),
                "fault_detected": ro_fault,
                "service_recommendation": ro_rec,
                "last_replaced": "2026-04-10"
            },
            {
                "id": "uf_filter",
                "name": "Hollow-Fiber UF Filter",
                "category": "Post-Polishing",
                "health_percentage": round(uf_health, 1),
                "status": uf_status,
                "estimated_days_remaining": uf_days,
                "liters_processed": round(total_liters * 0.42, 1),
                "rated_capacity_liters": 12000.0,
                "current_dp_psi": 2.1,
                "fouling_index": round((100.0 - uf_health) / 10.0, 1),
                "fault_detected": uf_fault,
                "service_recommendation": uf_rec,
                "last_replaced": "2026-05-20"
            },
            {
                "id": "uv_chamber",
                "name": "UV-C Disinfection Chamber",
                "category": "Biocidal Stage",
                "health_percentage": round(uv_health, 1),
                "status": uv_status,
                "estimated_days_remaining": uv_days,
                "liters_processed": round(total_liters * 0.42, 1),
                "rated_capacity_liters": 25000.0,
                "current_dp_psi": 0.8,
                "fouling_index": round((100.0 - uv_health) / 10.0, 1),
                "fault_detected": uv_fault,
                "service_recommendation": uv_rec,
                "last_replaced": "2026-01-12"
            }
        ]
