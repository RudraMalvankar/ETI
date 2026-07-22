import os

from reportlab.pdfgen import canvas

os.makedirs("tests/samples", exist_ok=True)
c = canvas.Canvas("tests/samples/sample_industrial.pdf")
c.drawString(100, 750, "APEX INDUSTRIAL INSPECTION REPORT")
c.drawString(100, 700, "Asset ID: V-102")
c.drawString(100, 650, "Status: Critical Warning")
c.drawString(100, 600, "Details: High Pressure Valve V-102 operating parameters exceeded.")
c.drawString(100, 550, "Maintenance required immediately. Refer to SOP-402.")
c.save()
print("Created sample PDF.")
