# APEX User & Operational Guide (v1.0.0)

## Welcome to APEX

APEX is an Enterprise AI Decision Intelligence & Industrial Shadow Simulation platform designed to assist plant engineers, field operators, asset managers, and safety compliance auditors.

---

## Operational Walkthrough

### 1. Dashboard Overview (`/dashboard`)
Upon logging in, operators view the real-time operational status:
- **System Metrics**: Total active assets, average health score, active incidents banner.
- **Incident Alert Feed**: Prioritized alerts sorted by risk severity.

### 2. Document Upload & Ingestion (`/documents`)
1. Navigate to **Documents**.
2. Drag and drop an OEM equipment PDF or CSV manual (`SOP-P101-BEARING.pdf`).
3. Click **Upload & Index**.
4. Monitor ingestion status until marked **Indexed**.

### 3. RAG Engineering Query (`/search`)
1. Navigate to **RAG Search**.
2. Enter natural language questions such as: *"P-101 bearing temperature threshold emergency procedure"*.
3. View retrieved snippets with exact document page numbers and confidence scores.

### 4. Knowledge Graph Topology (`/graph`)
1. Navigate to **Knowledge Graph**.
2. Interact with the visual asset dependency canvas.
3. Click an asset node (e.g., `P-101`) and select **Calculate Blast Radius** to highlight downstream affected equipment.

### 5. Shadow Simulation & Decision Recommendation (`/simulation` & `/decision`)
1. Run a Monte Carlo failure simulation for `P-101` (`bearing_overheat`, `98.5°C`).
2. View calculated financial downtime risk scores.
3. Navigate to **Decision Engine** to view Gemini AI strategy recommendations with grounding citations.

### 6. Interactive Runbooks & LOTO Lockout (`/runbook`)
1. Generate an automated mitigation runbook.
2. Verify Lock-Out/Tag-Out (LOTO) safety steps.
3. Mark steps as completed as physical actions are taken.

### 7. Compliance PDF Export (`/compliance`)
1. Select an incident record.
2. Click **Generate Compliance Report**.
3. Click **Export PDF** to download formatted OISD/PESO audit reports.
