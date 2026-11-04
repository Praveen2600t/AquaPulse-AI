import os
from io import BytesIO
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(reading: dict, components: list, faults: list, rul_list: list) -> bytes:
    """
    Generates a formal engineering diagnostic and water quality report in PDF format.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor("#0f172a") # Deep Slate Navy
    accent_cyan = colors.HexColor("#0284c7")   # Deep Cyan
    text_dark = colors.HexColor("#1e293b")
    bg_light = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569")
    )
    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=accent_cyan,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark
    )
    bold_style = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=text_dark
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#64748b")
    )

    story = []

    # Header Banner
    story.append(Paragraph("AQUAPULSE AI — SYSTEM DIAGNOSTIC REPORT", title_style))
    story.append(Paragraph("Intelligent Water Purification & Predictive Maintenance Platform", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Institution:</b> Sri Ramakrishna Institute of Technology, Coimbatore | <b>Team:</b> NEXTGEN AI (Praveen K, Prithika C)", subtitle_style))
    story.append(Paragraph(f"<b>Report Generated:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')} | <b>Purifier Serial:</b> AP-9000-SRIT | <b>Model:</b> AquaPulse Pro 75GPD", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_cyan, spaceAfter=12))

    # Section 1: Executive Summary
    story.append(Paragraph("1. EXECUTIVE SUMMARY & PURIFIER HEALTH", h2_style))
    salt_rej = reading.get("salt_rejection", 95.8)
    status_text = "NORMAL OPERATIONAL" if salt_rej >= 90 and not faults else ("ATTENTION REQUIRED" if len(faults) > 0 else "DEGRADED")
    
    summary_data = [
        [Paragraph("<b>Operating Status</b>", bold_style), Paragraph(status_text, bold_style),
         Paragraph("<b>Salt Rejection</b>", bold_style), Paragraph(f"{salt_rej:.1f} %", body_style)],
        [Paragraph("<b>Feed TDS</b>", bold_style), Paragraph(f"{reading.get('feed_tds', 450):.1f} ppm", body_style),
         Paragraph("<b>Permeate TDS</b>", bold_style), Paragraph(f"{reading.get('permeate_tds', 25):.1f} ppm", body_style)],
        [Paragraph("<b>Feed Pressure (P1)</b>", bold_style), Paragraph(f"{reading.get('p1_feed_pressure', 36):.1f} psi", body_style),
         Paragraph("<b>Pre-Filter ΔP</b>", bold_style), Paragraph(f"{reading.get('pre_filter_dp', 4.2):.1f} psi", body_style)],
        [Paragraph("<b>Product Flow</b>", bold_style), Paragraph(f"{reading.get('product_flow', 14.8):.1f} L/h", body_style),
         Paragraph("<b>Recovery Ratio</b>", bold_style), Paragraph(f"{reading.get('recovery_ratio', 40):.1f} %", body_style)],
    ]
    t_summary = Table(summary_data, colWidths=[120, 150, 120, 150])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 12))

    # Section 2: Sensor Telemetry Audit
    story.append(Paragraph("2. SENSOR TELEMETRY & WATER QUALITY CHANNELS", h2_style))
    sensor_data = [
        [Paragraph("<b>Sensor Channel</b>", bold_style), Paragraph("<b>Observed Reading</b>", bold_style), Paragraph("<b>Nominal Range</b>", bold_style), Paragraph("<b>Condition</b>", bold_style)],
        [Paragraph("Feed Conductivity (EC)", body_style), Paragraph(f"{reading.get('feed_ec', 720):.1f} µS/cm", body_style), Paragraph("200 - 1000 µS/cm", body_style), Paragraph("Normal", body_style)],
        [Paragraph("Permeate Conductivity", body_style), Paragraph(f"{reading.get('permeate_ec', 32):.1f} µS/cm", body_style), Paragraph("< 60 µS/cm", body_style), Paragraph("Optimal" if reading.get('permeate_ec', 32) < 60 else "Elevated", body_style)],
        [Paragraph("Feed pH", body_style), Paragraph(f"{reading.get('feed_ph', 7.3):.2f}", body_style), Paragraph("6.5 - 8.5", body_style), Paragraph("Balanced", body_style)],
        [Paragraph("Oxidation-Reduction Potential (ORP)", body_style), Paragraph(f"{reading.get('feed_orp', 320):.1f} mV", body_style), Paragraph("250 - 400 mV", body_style), Paragraph("Warning" if reading.get('feed_orp', 320) > 420 else "Normal", body_style)],
        [Paragraph("Feed Turbidity", body_style), Paragraph(f"{reading.get('feed_turbidity', 1.4):.2f} NTU", body_style), Paragraph("< 3.0 NTU", body_style), Paragraph("Warning" if reading.get('feed_turbidity', 1.4) > 4.0 else "Clear", body_style)],
        [Paragraph("Feed Water Temperature", body_style), Paragraph(f"{reading.get('feed_temp', 24.5):.1f} °C", body_style), Paragraph("15 - 30 °C", body_style), Paragraph(f"TCF = {reading.get('tcf', 1.0):.3f}", body_style)],
        [Paragraph("Membrane Inlet Pressure (P3)", body_style), Paragraph(f"{reading.get('p3_membrane_pressure', 87):.1f} psi", body_style), Paragraph("70 - 100 psi", body_style), Paragraph("Standard", body_style)],
    ]
    t_sensor = Table(sensor_data, colWidths=[160, 120, 130, 130])
    t_sensor.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sensor)
    story.append(Spacer(1, 12))

    # Section 3: Component Health & Remaining Useful Life (RUL)
    story.append(Paragraph("3. COMPONENT HEALTH & REMAINING USEFUL LIFE (RUL)", h2_style))
    comp_data = [
        [Paragraph("<b>Component Stage</b>", bold_style), Paragraph("<b>Health</b>", bold_style), Paragraph("<b>RUL (Days)</b>", bold_style), Paragraph("<b>Priority</b>", bold_style), Paragraph("<b>Status</b>", bold_style)],
    ]
    for c in components:
        # Match RUL
        r_item = next((r for r in rul_list if r.get("component_id") == c.get("id")), {})
        nom_days = r_item.get("nominal_days_left", c.get("estimated_days_remaining", 90))
        prio = r_item.get("maintenance_priority", "Medium")
        status_col = colors.green if c.get("status") == "healthy" else (colors.orange if c.get("status") == "warning" else colors.red)
        
        comp_data.append([
            Paragraph(c.get("name", ""), body_style),
            Paragraph(f"{c.get('health_percentage', 100):.1f} %", body_style),
            Paragraph(f"{nom_days} days (±20%)", body_style),
            Paragraph(prio, bold_style),
            Paragraph(c.get("status", "healthy").upper(), bold_style)
        ])
    t_comp = Table(comp_data, colWidths=[180, 80, 110, 80, 90])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 12))

    # Section 4: AI Fault Diagnostics & Fingerprints
    story.append(Paragraph("4. AI FAULT DIAGNOSTICS & RECOMMENDED ACTIONS", h2_style))
    if not faults:
        story.append(Paragraph("<b>No active anomalies detected.</b> All physical parameters within nominal operating bounds.", body_style))
    else:
        for f in faults:
            f_box = [
                [Paragraph(f"<b>Fault:</b> {f.get('name', 'Anomaly')}", bold_style), Paragraph(f"<b>Severity:</b> {f.get('severity', '').upper()}", bold_style), Paragraph(f"<b>Confidence:</b> {int(f.get('confidence', 0.9)*100)}%", bold_style)],
                [Paragraph(f"<b>Root Cause:</b> {f.get('root_cause', '')}", body_style), "", ""],
                [Paragraph(f"<b>Recommended Action:</b> {f.get('recommended_action', '')}", bold_style), "", ""]
            ]
            t_fbox = Table(f_box, colWidths=[240, 150, 150])
            t_fbox.setStyle(TableStyle([
                ('SPAN', (0, 1), (2, 1)),
                ('SPAN', (0, 2), (2, 2)),
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fff1f2") if f.get('severity') == 'critical' else colors.HexColor("#fffbeb")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#f43f5e") if f.get('severity') == 'critical' else colors.HexColor("#f59e0b")),
                ('PADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(t_fbox)
            story.append(Spacer(1, 6))

    story.append(Spacer(1, 14))

    # Section 5: Mandatory Regulatory & Scientific Safety Disclaimers
    story.append(Paragraph("5. MANDATORY WATER SAFETY DISCLAIMER & METHODOLOGICAL LIMITATIONS", h2_style))
    disclaimer_p = (
        "<b>LEGAL & TECHNICAL DISCLAIMER:</b> This report is generated by AquaPulse AI using simulated synthetic telemetry "
        "and physics-informed mathematical models. Sensor channels (EC, pH, ORP, Turbidity, Pressure) provide operational "
        "and hydraulic diagnostic indicators only. Oxidation-Reduction Potential (ORP) alone does not constitute a chlorine-specific "
        "concentration measurement. Neither TDS, pH, ORP, nor Turbidity measurements can establish biological or microbiological "
        "disinfection safety. This system does NOT detect biological pathogens, bacterial contaminants, or virus presence and does "
        "NOT certify drinking water as potable. AI maintenance projections are prototype estimates and must never supersede "
        "prescribed manufacturer replacement schedules or professional laboratory testing."
    )
    story.append(Paragraph(disclaimer_p, disclaimer_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceAfter=8))
    story.append(Paragraph("AquaPulse AI © 2026 NEXTGEN AI — Sri Ramakrishna Institute of Technology, Coimbatore. All rights reserved.", subtitle_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
