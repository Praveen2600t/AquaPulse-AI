import math
import time
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

class SensorSimulationEngine:
    """
    Physics-informed synthetic sensor simulation engine for AquaPulse AI.
    Simulates multi-stage water purification physics, hydraulic pressures,
    water quality chemistries, and realistic filter degradation trajectories.
    """
    def __init__(self):
        self.operating_mode = "NORMAL" # NORMAL, PREFILTER_CLOGGED, MEMBRANE_SCALING, MEMBRANE_DEGRADED, CONDUCTIVITY_SPIKE, SENSOR_DRIFT
        self.step_counter = 0
        self.total_liters = 14820.0
        self.base_feed_ec = 720.0 # uS/cm
        self.base_temp = 24.5 # Celsius
        self.base_feed_pressure = 36.0 # psi
        self.history_buffer: List[Dict[str, Any]] = []
        self._init_history()

    def set_mode(self, mode: str):
        valid_modes = [
            "NORMAL",
            "PREFILTER_CLOGGED", 
            "MEMBRANE_SCALING", 
            "MEMBRANE_DEGRADED", 
            "CONDUCTIVITY_SPIKE", 
            "SENSOR_DRIFT",
            "PRESSURE_ABNORMAL"
        ]
        if mode in valid_modes:
            self.operating_mode = mode

    def calculate_tcf(self, temp_celsius: float) -> float:
        """
        Temperature Correction Factor:
        TCF = exp[2640 * (1/298.15 - 1/(temp_celsius + 273.15))]
        """
        t_kelvin = max(1.0, temp_celsius + 273.15)
        return math.exp(2640.0 * ((1.0 / 298.15) - (1.0 / t_kelvin)))

    def calculate_salt_rejection(self, feed_ec: float, permeate_ec: float) -> float:
        """
        Salt rejection: R = (1 - EC_permeate / EC_feed) * 100
        """
        if feed_ec <= 0:
            return 0.0
        return max(0.0, min(100.0, (1.0 - (permeate_ec / feed_ec)) * 100.0))

    def generate_current_reading(self, custom_scenario: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generates physically consistent sensor measurements for the current time step.
        """
        self.step_counter += 1
        t = time.time()
        
        # Diurnal water variation waves (sinusoidal fluctuations)
        diurnal_variation = math.sin(t / 120.0) * 25.0
        thermal_variation = math.sin(t / 300.0) * 1.5
        noise = lambda scale: random.uniform(-scale, scale)

        # Baseline parameters
        feed_ec = self.base_feed_ec + diurnal_variation + noise(8.0)
        temp_c = self.base_temp + thermal_variation + noise(0.2)
        p1 = self.base_feed_pressure + noise(0.6)
        ph = 7.35 + math.sin(t / 180.0) * 0.15 + noise(0.05)
        orp = 320.0 + noise(6.0) # mV
        turbidity = 1.45 + noise(0.12) # NTU

        # Normal stage behavior
        pre_filter_dp = 4.2 + noise(0.25) # psi
        p2 = p1 - pre_filter_dp
        booster_boost = 55.0 # Booster pump raises pressure to ~85 psi
        p3 = p2 + booster_boost + noise(0.8)

        base_rejection = 95.8 # 95.8% salt rejection standard for healthy polyamide thin-film composite membrane
        product_flow = 14.8 + noise(0.2) # L/hour
        reject_flow = 22.2 + noise(0.3) # L/hour (approx 40% recovery ratio)

        # Apply specific operating mode failures
        if self.operating_mode == "PREFILTER_CLOGGED":
            turbidity = 8.5 + noise(0.8)
            pre_filter_dp = 18.4 + noise(0.5) # High pressure drop (>15 psi threshold)
            p2 = p1 - pre_filter_dp # Pump suction starved
            p3 = p2 + booster_boost * 0.82
            product_flow *= 0.65
            reject_flow *= 0.70

        elif self.operating_mode == "MEMBRANE_SCALING":
            base_rejection = 84.5 - min(10.0, self.step_counter * 0.05) # Severe salt leakage
            p3 = p2 + booster_boost + 12.0 # Membrane resistance increases operating pressure
            product_flow *= 0.72

        elif self.operating_mode == "MEMBRANE_DEGRADED":
            orp = 520.0 + noise(15.0) # Oxidant chlorine breakthrough past carbon filter
            base_rejection = 76.2 # Irreversible chemical oxidation
            product_flow *= 1.15 # Membrane pores damaged, unselective high flow

        elif self.operating_mode == "CONDUCTIVITY_SPIKE":
            feed_ec = 1480.0 + noise(25.0) # Raw water supply contamination/saline shift
            turbidity = 4.2 + noise(0.4)

        elif self.operating_mode == "SENSOR_DRIFT":
            feed_ec = 720.0 # Frozen signal
            permeate_ec = 32.0 # Frozen
            noise = lambda s: 0.0 # No dynamic variance (stuck sensor)

        elif self.operating_mode == "PRESSURE_ABNORMAL":
            p1 = 7.8 + noise(0.4) # Raw tap water pressure collapse (<10 psi)
            p2 = 3.2
            p3 = 42.0 # Pump cavitation risk
            product_flow = 3.5
            reject_flow = 5.2

        # Allow user scenario overrides if provided (for What-If simulator)
        if custom_scenario:
            if "feed_conductivity" in custom_scenario:
                feed_ec = float(custom_scenario["feed_conductivity"])
            if "feed_pressure" in custom_scenario:
                p1 = float(custom_scenario["feed_pressure"])
                p2 = p1 - pre_filter_dp
                p3 = p2 + booster_boost
            if "temperature" in custom_scenario:
                temp_c = float(custom_scenario["temperature"])
            if "turbidity" in custom_scenario:
                turbidity = float(custom_scenario["turbidity"])

        # Temperature Correction Factor
        tcf = self.calculate_tcf(temp_c)

        # Permeate calculations
        permeate_ec = feed_ec * (1.0 - (base_rejection / 100.0)) / tcf
        salt_rejection = self.calculate_salt_rejection(feed_ec, permeate_ec)

        # TDS calculation
        feed_tds = feed_ec * 0.64
        permeate_tds = permeate_ec * 0.64

        # Recovery ratio
        total_flow = product_flow + reject_flow
        recovery = (product_flow / total_flow * 100.0) if total_flow > 0 else 0.0

        # Increment total liters
        self.total_liters += (product_flow / 3600.0) * 3.0 # assuming 3s step

        reading = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "feed_ec": round(feed_ec, 2),
            "feed_tds": round(feed_tds, 1),
            "feed_ph": round(ph, 2),
            "feed_orp": round(orp, 1),
            "feed_turbidity": round(turbidity, 2),
            "feed_temp": round(temp_c, 2),
            "p1_feed_pressure": round(p1, 2),
            "p2_pump_inlet_pressure": round(p2, 2),
            "p3_membrane_pressure": round(p3, 2),
            "product_flow": round(product_flow, 2),
            "reject_flow": round(reject_flow, 2),
            "permeate_ec": round(permeate_ec, 2),
            "permeate_tds": round(permeate_tds, 1),
            "salt_rejection": round(salt_rejection, 2),
            "pre_filter_dp": round(pre_filter_dp, 2),
            "tcf": round(tcf, 4),
            "recovery_ratio": round(recovery, 2),
            "operating_mode": self.operating_mode,
            "total_liters_purified": round(self.total_liters, 1)
        }

        # Keep in rolling buffer
        self.history_buffer.append(reading)
        if len(self.history_buffer) > 200:
            self.history_buffer.pop(0)

        return reading

    def _init_history(self):
        """Populates initial history for trend charts."""
        now = datetime.now(timezone.utc)
        for i in range(60, 0, -1):
            past_time = now - timedelta(minutes=i * 2)
            noise = random.uniform(-4.0, 4.0)
            feed_ec = self.base_feed_ec + noise
            temp = self.base_temp + random.uniform(-0.4, 0.4)
            tcf = self.calculate_tcf(temp)
            salt_rej = 95.5 + random.uniform(-0.5, 0.5)
            perm_ec = feed_ec * (1.0 - (salt_rej / 100.0)) / tcf
            p1 = 36.0 + random.uniform(-0.5, 0.5)
            dp = 4.2 + random.uniform(-0.2, 0.2)
            p2 = p1 - dp
            p3 = p2 + 55.0 + random.uniform(-0.5, 0.5)
            prod_flow = 14.8 + random.uniform(-0.2, 0.2)
            rej_flow = 22.2 + random.uniform(-0.3, 0.3)

            rec = {
                "timestamp": past_time.isoformat(),
                "feed_ec": round(feed_ec, 2),
                "feed_tds": round(feed_ec * 0.64, 1),
                "feed_ph": round(7.35 + random.uniform(-0.08, 0.08), 2),
                "feed_orp": round(320.0 + random.uniform(-5.0, 5.0), 1),
                "feed_turbidity": round(1.4 + random.uniform(-0.1, 0.1), 2),
                "feed_temp": round(temp, 2),
                "p1_feed_pressure": round(p1, 2),
                "p2_pump_inlet_pressure": round(p2, 2),
                "p3_membrane_pressure": round(p3, 2),
                "product_flow": round(prod_flow, 2),
                "reject_flow": round(rej_flow, 2),
                "permeate_ec": round(perm_ec, 2),
                "permeate_tds": round(perm_ec * 0.64, 1),
                "salt_rejection": round(salt_rej, 2),
                "pre_filter_dp": round(dp, 2),
                "tcf": round(tcf, 4),
                "recovery_ratio": round((prod_flow / (prod_flow + rej_flow)) * 100.0, 2),
                "operating_mode": "NORMAL",
                "total_liters_purified": round(self.total_liters - (i * 0.5), 1)
            }
            self.history_buffer.append(rec)

# Global simulation singleton
simulator = SensorSimulationEngine()
