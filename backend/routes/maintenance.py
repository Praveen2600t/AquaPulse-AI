from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime
from backend.models.schemas import MaintenanceItem

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

# In-memory maintenance log store initialized with realistic initial records
maintenance_logs: List[Dict[str, Any]] = [
    {
        "id": 1,
        "date": "2026-08-15T10:00:00",
        "component": "Sediment Filter (5 Micron)",
        "action": "Replaced spun polypropylene filter candle and flushed housing bowl",
        "technician": "Praveen K (SRIT Lab)",
        "notes": "Moderate silt accumulation observed after monsoon season.",
        "liters_at_service": 8420.0,
        "cost": 15.0
    },
    {
        "id": 2,
        "date": "2026-08-15T10:30:00",
        "component": "Activated Carbon Block",
        "action": "Replaced 10-inch extruded carbon block and rinsed carbon fines",
        "technician": "Praveen K (SRIT Lab)",
        "notes": "ORP returned to 310 mV nominal level.",
        "liters_at_service": 8420.0,
        "cost": 22.0
    },
    {
        "id": 3,
        "date": "2026-04-10T14:15:00",
        "component": "TFC Reverse Osmosis Membrane",
        "action": "Installed Dow Filmtec 75 GPD TFC Membrane & renewed FR450 restrictor",
        "technician": "Prithika C (SRIT Lab)",
        "notes": "Salt rejection restored from 86.2% to 96.8%.",
        "liters_at_service": 4200.0,
        "cost": 45.0
    }
]

@router.get("/logs", response_model=List[MaintenanceItem])
def get_maintenance_logs() -> List[Dict[str, Any]]:
    return maintenance_logs

@router.post("/logs", response_model=MaintenanceItem)
def add_maintenance_log(item: MaintenanceItem) -> Dict[str, Any]:
    new_entry = item.dict()
    new_entry["id"] = len(maintenance_logs) + 1
    new_entry["date"] = datetime.utcnow()
    maintenance_logs.insert(0, new_entry)
    return new_entry

@router.get("/diy-guides")
def get_diy_guides() -> List[Dict[str, Any]]:
    return [
        {
            "id": "sediment_diy",
            "component": "Sediment Filter",
            "duration_minutes": 15,
            "difficulty": "Easy",
            "tools": ["Filter Spanner Wrench", "Bucket", "Replacement 5-micron Cartridge", "Food-Grade Silicone Lubricant"],
            "steps": [
                "Turn off raw feed water supply ball valve.",
                "Depressurize the system by opening the clean water dispensing faucet until flow stops.",
                "Place bucket beneath the first clear/opaque pre-filter housing bowl.",
                "Use the spanner wrench to loosen the housing clockwise (viewed from top).",
                "Discard used cartridge, wash inner sump with mild warm soapy water.",
                "Insert fresh polypropylene cartridge, check O-ring seat, and tighten firmly by hand.",
                "Slowly reopen water inlet valve and check for leaks for 2 minutes."
            ]
        },
        {
            "id": "carbon_diy",
            "component": "Activated Carbon Filter",
            "duration_minutes": 20,
            "difficulty": "Easy",
            "tools": ["Spanner Wrench", "Replacement Carbon Block Cartridge"],
            "steps": [
                "Isolate power and feed water.",
                "Unscrew Stage 2 filter canister.",
                "Seat new extruded carbon block cartridge.",
                "Crucial step: Disconnect tube to RO membrane inlet and flush 5 liters of carbon fines directly into a bucket before connecting to RO."
            ]
        },
        {
            "id": "ro_membrane_diy",
            "component": "Reverse Osmosis Membrane",
            "duration_minutes": 35,
            "difficulty": "Intermediate",
            "tools": ["Needle-nose Pliers", "Replacement 75 GPD TFC Membrane", "Replacement FR450 Flow Restrictor"],
            "steps": [
                "Unplug purifier electrical adapter.",
                "Remove locking clips from RO housing cap quick-connect fitting.",
                "Unscrew RO housing cap. Use pliers to firmly grip and extract the old membrane.",
                "Inspect inside vessel for scale, rinse thoroughly.",
                "Lubricate double brine seals on new membrane with clean water or silicone lubricant.",
                "Firmly push new membrane until brine seals click snugly into internal seat.",
                "Replace the capillary flow restrictor on the brine line to prevent premature scaling.",
                "Flush permeate water to drain for the first 30 minutes of runtime."
            ]
        }
    ]

@router.get("/checklist")
def get_checklist() -> List[Dict[str, Any]]:
    return [
        {"id": "c1", "task": "Check Pre-Filter Pressure Drop (< 10 psi)", "frequency": "Weekly", "status": "passed"},
        {"id": "c2", "task": "Inspect TDS Reduction (Salt Rejection > 90%)", "frequency": "Monthly", "status": "passed"},
        {"id": "c3", "task": "Verify Brine Reject Flow is Active & Clear", "frequency": "Monthly", "status": "passed"},
        {"id": "c4", "task": "Sanitize Storage Tank & Post-Carbon Lines", "frequency": "Every 6 Months", "status": "pending"},
        {"id": "c5", "task": "Annual UV Lamp & Ballast Intensity Check", "frequency": "Annual", "status": "passed"}
    ]
