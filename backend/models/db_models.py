from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text
from datetime import datetime
from backend.database import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Raw feed water sensors
    feed_ec = Column(Float, nullable=False) # uS/cm
    feed_tds = Column(Float, nullable=False) # ppm
    feed_ph = Column(Float, nullable=False)
    feed_orp = Column(Float, nullable=False) # mV
    feed_turbidity = Column(Float, nullable=False) # NTU
    feed_temp = Column(Float, nullable=False) # Celsius
    
    # Hydraulic & filtration measurements
    p1_feed_pressure = Column(Float, nullable=False) # psi
    p2_pump_inlet_pressure = Column(Float, nullable=False) # psi
    p3_membrane_pressure = Column(Float, nullable=False) # psi
    product_flow = Column(Float, nullable=False) # L/h
    reject_flow = Column(Float, nullable=False) # L/h
    permeate_ec = Column(Float, nullable=False) # uS/cm
    permeate_tds = Column(Float, nullable=False) # ppm
    
    # Derived physics indicators
    salt_rejection = Column(Float, nullable=False) # %
    pre_filter_dp = Column(Float, nullable=False) # psi (P1 - P2)
    tcf = Column(Float, nullable=False) # Temperature Correction Factor
    recovery_ratio = Column(Float, nullable=False) # %

class AlertRecord(Base):
    __tablename__ = "alert_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    title = Column(String(128), nullable=False)
    fault_code = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False) # info, warning, critical
    message = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    resolved_at = Column(DateTime, nullable=True)

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    component = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False)
    technician = Column(String(128), default="Self Service / User")
    notes = Column(Text, nullable=True)
    liters_at_service = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)

class PurifierConfig(Base):
    __tablename__ = "purifier_config"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(64), default="AP-9000-SRIT")
    model_name = Column(String(128), default="AquaPulse Pro 75GPD")
    installed_at = Column(DateTime, default=datetime.utcnow)
    location = Column(String(128), default="Laboratory 3, SRIT Coimbatore")
    total_liters_purified = Column(Float, default=1420.5)
    simulation_mode = Column(String(64), default="realistic_dynamic")
