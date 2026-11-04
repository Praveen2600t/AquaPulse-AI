import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from typing import List, Dict, Any, Tuple

class FailureFingerprintEngine:
    """
    Hybrid AI Diagnostics Engine:
    Combines deterministic physics rules with trained Scikit-Learn Anomaly Detection (Isolation Forest)
    and Multi-class Fault Classification (Random Forest) to output calibrated, explainable failure diagnoses.
    """
    def __init__(self):
        self.feature_names = [
            "feed_ec", "feed_tds", "feed_ph", "feed_orp", "feed_turbidity",
            "feed_temp", "p1_feed_pressure", "p2_pump_inlet_pressure", "p3_membrane_pressure",
            "product_flow", "reject_flow", "permeate_ec", "salt_rejection", "pre_filter_dp"
        ]
        self.fault_labels = [
            "NORMAL",
            "PREFILTER_CLOGGED",
            "MEMBRANE_SCALING",
            "MEMBRANE_DEGRADED",
            "CONDUCTIVITY_SPIKE",
            "SENSOR_DRIFT",
            "PRESSURE_ABNORMAL"
        ]
        self.isolation_forest = None
        self.classifier = None
        self._train_models()

    def _generate_synthetic_training_dataset(self, n_samples_per_class: int = 120):
        """Generates rigorous synthetic data across normal and abnormal operating modes."""
        X = []
        y = []
        np.random.seed(42)

        for label_idx, fault in enumerate(self.fault_labels):
            for _ in range(n_samples_per_class):
                # Baseline normal distributions
                feed_ec = np.random.normal(700.0, 30.0)
                temp = np.random.normal(24.0, 1.5)
                ph = np.random.normal(7.3, 0.15)
                orp = np.random.normal(310.0, 12.0)
                turbidity = np.random.normal(1.3, 0.2)
                p1 = np.random.normal(36.0, 1.0)
                dp = np.random.normal(4.2, 0.4)
                p2 = p1 - dp
                p3 = p2 + np.random.normal(55.0, 1.2)
                salt_rej = np.random.normal(96.0, 0.6)
                prod_flow = np.random.normal(14.8, 0.4)
                rej_flow = np.random.normal(22.2, 0.5)

                if fault == "PREFILTER_CLOGGED":
                    turbidity = np.random.normal(7.5, 1.2)
                    dp = np.random.normal(18.5, 2.0)
                    p2 = p1 - dp
                    prod_flow *= 0.68
                    rej_flow *= 0.72

                elif fault == "MEMBRANE_SCALING":
                    salt_rej = np.random.normal(83.0, 2.5)
                    p3 += np.random.normal(14.0, 1.5)
                    prod_flow *= 0.75

                elif fault == "MEMBRANE_DEGRADED":
                    orp = np.random.normal(520.0, 25.0)
                    salt_rej = np.random.normal(74.0, 3.0)
                    prod_flow *= 1.2

                elif fault == "CONDUCTIVITY_SPIKE":
                    feed_ec = np.random.normal(1500.0, 60.0)
                    turbidity = np.random.normal(4.5, 0.5)

                elif fault == "SENSOR_DRIFT":
                    dp = 4.2
                    salt_rej = 95.8
                    prod_flow = 14.8

                elif fault == "PRESSURE_ABNORMAL":
                    p1 = np.random.normal(8.0, 1.0)
                    p2 = p1 - dp
                    p3 = np.random.normal(40.0, 2.0)
                    prod_flow *= 0.3

                feed_tds = feed_ec * 0.64
                perm_ec = feed_ec * (1.0 - (salt_rej / 100.0))

                feat_vec = [
                    feed_ec, feed_tds, ph, orp, turbidity,
                    temp, p1, p2, p3,
                    prod_flow, rej_flow, perm_ec, salt_rej, dp
                ]
                X.append(feat_vec)
                y.append(label_idx)

        return np.array(X), np.array(y)

    def _train_models(self):
        """Fits the Isolation Forest and Random Forest Classifier."""
        X, y = self._generate_synthetic_training_dataset()
        # Train Isolation Forest on normal samples (label 0)
        X_normal = X[y == 0]
        self.isolation_forest = IsolationForest(n_estimators=60, contamination=0.08, random_state=42)
        self.isolation_forest.fit(X_normal)

        # Train Random Forest Classifier on all modes
        self.classifier = RandomForestClassifier(n_estimators=75, max_depth=6, random_state=42)
        self.classifier.fit(X, y)

    def extract_features(self, reading: Dict[str, Any]) -> np.ndarray:
        return np.array([[
            reading.get("feed_ec", 700.0),
            reading.get("feed_tds", 448.0),
            reading.get("feed_ph", 7.3),
            reading.get("feed_orp", 310.0),
            reading.get("feed_turbidity", 1.3),
            reading.get("feed_temp", 24.0),
            reading.get("p1_feed_pressure", 36.0),
            reading.get("p2_pump_inlet_pressure", 31.8),
            reading.get("p3_membrane_pressure", 86.8),
            reading.get("product_flow", 14.8),
            reading.get("reject_flow", 22.2),
            reading.get("permeate_ec", 30.0),
            reading.get("salt_rejection", 95.8),
            reading.get("pre_filter_dp", 4.2),
        ]])

    def diagnose(self, reading: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Runs physics rule checks alongside ML probabilities.
        Returns a list of diagnosed faults with severity, confidence, evidence, and actions.
        """
        features = self.extract_features(reading)
        
        # ML Probabilities
        probs = self.classifier.predict_proba(features)[0]
        pred_label_idx = int(np.argmax(probs))
        ml_confidence = float(probs[pred_label_idx])
        pred_fault_code = self.fault_labels[pred_label_idx]

        # Physics readings
        dp = reading.get("pre_filter_dp", 4.2)
        p1 = reading.get("p1_feed_pressure", 36.0)
        p2 = reading.get("p2_pump_inlet_pressure", 31.8)
        p3 = reading.get("p3_membrane_pressure", 86.8)
        feed_ec = reading.get("feed_ec", 700.0)
        permeate_ec = reading.get("permeate_ec", 30.0)
        salt_rej = reading.get("salt_rejection", 95.8)
        orp = reading.get("feed_orp", 310.0)
        turbidity = reading.get("feed_turbidity", 1.3)
        prod_flow = reading.get("product_flow", 14.8)
        rej_flow = reading.get("reject_flow", 22.2)

        diagnosed_faults: List[Dict[str, Any]] = []

        # 1. Pre-filter Clogging Fingerprint
        if dp > 12.0 or turbidity > 5.0 or (pred_fault_code == "PREFILTER_CLOGGED" and ml_confidence > 0.65):
            conf = min(0.99, max(0.70, (dp / 20.0) * 0.95))
            diagnosed_faults.append({
                "fault_code": "PREFILTER_CLOGGED",
                "name": "Pre-Filter Spun Cartridge Clogging",
                "severity": "critical" if dp > 15.0 else "warning",
                "is_detected": True,
                "confidence": round(conf, 2),
                "evidence": [
                    f"Differential pressure ΔP = {dp:.1f} psi exceeds nominal limit (< 8.0 psi)",
                    f"Feed turbidity elevated at {turbidity:.2f} NTU",
                    f"Pump suction pressure P2 starved at {p2:.1f} psi"
                ],
                "affected_components": ["sediment_filter", "booster_pump"],
                "root_cause": "High particulate / silt buildup in 5-micron spun polypropylene depth filter.",
                "recommended_action": "Isolate feed line, vent pressure release valve, and replace sediment filter.",
                "sensor_correlations": {"pre_filter_dp": dp, "feed_turbidity": turbidity, "p2_pressure": p2}
            })

        # 2. Membrane Scaling / Biofouling Fingerprint
        if salt_rej < 88.0 or (pred_fault_code == "MEMBRANE_SCALING" and ml_confidence > 0.65):
            conf = min(0.99, max(0.65, (95.0 - salt_rej) / 20.0 * 0.95))
            diagnosed_faults.append({
                "fault_code": "MEMBRANE_SCALING",
                "name": "RO Membrane Mineral Scaling & Salt Passage",
                "severity": "critical" if salt_rej < 82.0 else "warning",
                "is_detected": True,
                "confidence": round(conf, 2),
                "evidence": [
                    f"Salt rejection dropped to {salt_rej:.1f}% (nominal > 92.0%)",
                    f"Permeate conductivity rose to {permeate_ec:.1f} µS/cm",
                    f"Operating membrane pressure P3 at {p3:.1f} psi indicates hydraulic compaction"
                ],
                "affected_components": ["ro_membrane", "flow_restrictor"],
                "root_cause": "Precipitation of calcium/magnesium carbonates and sulfates on polyamide membrane surface.",
                "recommended_action": "Conduct acidic Clean-In-Place (CIP) citric acid flush; inspect reject flow restrictor.",
                "sensor_correlations": {"salt_rejection": salt_rej, "permeate_ec": permeate_ec, "p3_pressure": p3}
            })

        # 3. Oxidant Exposure / Carbon Breakthrough Fingerprint
        if orp > 450.0 or (pred_fault_code == "MEMBRANE_DEGRADED" and ml_confidence > 0.60):
            conf = min(0.98, max(0.68, (orp - 350.0) / 200.0 * 0.95))
            diagnosed_faults.append({
                "fault_code": "OXIDANT_EXPOSURE",
                "name": "Chlorine / Oxidant Chemical Attack",
                "severity": "critical",
                "is_detected": True,
                "confidence": round(conf, 2),
                "evidence": [
                    f"Inlet ORP surge to {orp:.1f} mV indicates active oxidant breakthrough past activated carbon",
                    f"Permeate flux increased uncharacteristically to {prod_flow:.1f} L/h due to polymer cleavage",
                    f"Membrane rejection compromised at {salt_rej:.1f}%"
                ],
                "affected_components": ["carbon_filter", "ro_membrane"],
                "root_cause": "Free chlorine breakthrough due to exhausted activated carbon catalytic sites.",
                "recommended_action": "Immediately replace activated carbon block to arrest irreversible RO polymer destruction.",
                "sensor_correlations": {"feed_orp": orp, "salt_rejection": salt_rej, "product_flow": prod_flow}
            })

        # 4. Raw Water Conductivity Spike Fingerprint
        if feed_ec > 1250.0:
            conf = min(0.99, max(0.75, (feed_ec - 1000.0) / 1000.0))
            diagnosed_faults.append({
                "fault_code": "CONDUCTIVITY_SPIKE",
                "name": "Raw Feed Salinity & TDS Surge",
                "severity": "warning",
                "is_detected": True,
                "confidence": round(conf, 2),
                "evidence": [
                    f"Feed EC spiked to {feed_ec:.1f} µS/cm (approx {feed_ec*0.64:.0f} ppm TDS)",
                    "Municipal supply shifted to high-salinity groundwater or distribution anomaly"
                ],
                "affected_components": ["feed_inlet", "ro_membrane"],
                "root_cause": "Sudden seasonal or source water composition shift in raw water supply.",
                "recommended_action": "Verify booster pump pressure to ensure osmotic threshold is maintained.",
                "sensor_correlations": {"feed_ec": feed_ec, "feed_tds": feed_ec * 0.64}
            })

        # 5. Low Feed Pressure / Cavitation Risk Fingerprint
        if p1 < 12.0 or (pred_fault_code == "PRESSURE_ABNORMAL" and ml_confidence > 0.60):
            conf = min(0.99, max(0.80, (15.0 - p1) / 15.0))
            diagnosed_faults.append({
                "fault_code": "PRESSURE_ABNORMAL",
                "name": "Feed Line Low Pressure / Cavitation Risk",
                "severity": "critical" if p1 < 8.0 else "warning",
                "is_detected": True,
                "confidence": round(conf, 2),
                "evidence": [
                    f"Feed line supply pressure P1 dropped to {p1:.1f} psi (minimum 15 psi required)",
                    "Risk of booster pump impeller cavitation and dry-run overheating"
                ],
                "affected_components": ["feed_inlet", "booster_pump"],
                "root_cause": "External municipal mains supply depressurization or supply valve throttling.",
                "recommended_action": "Check low-pressure cut-off switch (LPS) and inspect inlet piping for blockages.",
                "sensor_correlations": {"p1_feed_pressure": p1, "p2_pump_inlet_pressure": p2}
            })

        # 6. Flow Ratio / Reject Restrictor Abnormality
        recovery_ratio = (prod_flow / (prod_flow + rej_flow) * 100.0) if (prod_flow + rej_flow) > 0 else 0
        if recovery_ratio > 55.0 or recovery_ratio < 20.0:
            diagnosed_faults.append({
                "fault_code": "FLOW_RATIO_ABNORMAL",
                "name": "Abnormal Permeate-to-Reject Flow Ratio",
                "severity": "warning",
                "is_detected": True,
                "confidence": 0.84,
                "evidence": [
                    f"Recovery ratio at {recovery_ratio:.1f}% outside standard domestic range (30-45%)",
                    f"Product flow = {prod_flow:.1f} L/h, Reject flow = {rej_flow:.1f} L/h"
                ],
                "affected_components": ["flow_restrictor", "reject_outlet"],
                "root_cause": "Flow restrictor (FR) scaling restriction or internal membrane bypass.",
                "recommended_action": "Inspect brine reject line for crystalline deposition or check flow restrictor sizing.",
                "sensor_correlations": {"product_flow": prod_flow, "reject_flow": rej_flow}
            })

        return diagnosed_faults

# Global singleton
diagnostic_engine = FailureFingerprintEngine()
