from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from reportlab.graphics.shapes import Drawing, Line, Rect, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_FILE = OUTPUT_DIR / "APEX_Project_Dossier.pdf"


@dataclass(frozen=True)
class Section:
    title: str
    body: list[str]


PRIMARY = colors.HexColor("#0F172A")
ACCENT = colors.HexColor("#0EA5E9")
ACCENT_DARK = colors.HexColor("#0369A1")
SOFT = colors.HexColor("#E2E8F0")
TEXT = colors.HexColor("#334155")
SUCCESS = colors.HexColor("#059669")
HIGHLIGHT = colors.HexColor("#F8FAFC")


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="CoverKicker",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=ACCENT,
            alignment=TA_CENTER,
            leading=18,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=28,
            textColor=PRIMARY,
            alignment=TA_CENTER,
            leading=34,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            textColor=TEXT,
            alignment=TA_CENTER,
            leading=16,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=PRIMARY,
            leading=22,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubTitle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=ACCENT_DARK,
            leading=16,
            spaceBefore=8,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            textColor=TEXT,
            alignment=TA_JUSTIFY,
            leading=15,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            textColor=TEXT,
            alignment=TA_LEFT,
            leading=14,
            leftIndent=14,
            bulletIndent=2,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallCaps",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=ACCENT_DARK,
            alignment=TA_LEFT,
            leading=11,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=colors.white,
            alignment=TA_LEFT,
            leading=10.5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.3,
            textColor=PRIMARY,
            alignment=TA_LEFT,
            leading=10.5,
        )
    )
    return styles


def build_architecture_drawing():
    drawing = Drawing(500, 255)

    blocks = [
        (10, 180, 145, 55, "1. Ingestion", "PDF manuals, SOPs, telemetry"),
        (180, 180, 145, 55, "2. Context Layer", "Chunking, embeddings, Qdrant"),
        (350, 180, 145, 55, "3. Graph + Simulation", "Blast radius and what-fails-next"),
        (95, 80, 145, 55, "4. Decision Engine", "Mitigation reasoning and scoring"),
        (265, 80, 145, 55, "5. Dynamic Runbooks", "Technician actions and adaptation"),
        (180, 5, 145, 45, "6. Governance", "Compliance PDF and audit logs"),
    ]

    for x, y, w, h, title, subtitle in blocks:
        drawing.add(Rect(x, y, w, h, rx=8, ry=8, fillColor=HIGHLIGHT, strokeColor=ACCENT, strokeWidth=1.4))
        drawing.add(String(x + 10, y + h - 18, title, fontName="Helvetica-Bold", fontSize=11, fillColor=PRIMARY))
        drawing.add(String(x + 10, y + h - 34, subtitle, fontName="Helvetica", fontSize=8.5, fillColor=TEXT))

    connectors = [
        (155, 208, 180, 208),
        (325, 208, 350, 208),
        (422, 180, 338, 135),
        (155, 180, 168, 135),
        (240, 107, 265, 107),
        (337, 80, 300, 50),
        (168, 80, 205, 50),
    ]
    for x1, y1, x2, y2 in connectors:
        drawing.add(Line(x1, y1, x2, y2, strokeColor=ACCENT_DARK, strokeWidth=1.2))

    return drawing


def add_metric_cards(story, styles):
    data = [
        [
            Paragraph("<b>Core Promise</b><br/>Move from passive document lookup to active industrial decision intelligence.", styles["Body"]),
            Paragraph("<b>Target Outcome</b><br/>Reduce incident planning time from 45 minutes to under 5 seconds.", styles["Body"]),
        ],
        [
            Paragraph("<b>Economic Impact</b><br/>Unplanned industrial downtime cited in project material at about $260,000 per hour.", styles["Body"]),
            Paragraph("<b>Validation Signal</b><br/>Repository documentation reports 243 passing backend tests and benchmarked subsystem SLAs.", styles["Body"]),
        ],
    ]
    table = Table(data, colWidths=[8.2 * cm, 8.2 * cm], rowHeights=[3.3 * cm, 3.3 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), HIGHLIGHT),
                ("BOX", (0, 0), (-1, -1), 0.8, SOFT),
                ("INNERGRID", (0, 0), (-1, -1), 0.8, SOFT),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 0.35 * cm))


def add_bullets(story, styles, items):
    for item in items:
        story.append(Paragraph(f"- {item}", styles["BulletBody"]))


def add_table(story, styles, data, col_widths, header_background=PRIMARY):
    wrapped = []
    for row_index, row in enumerate(data):
        style_name = "TableHeader" if row_index == 0 else "TableCell"
        wrapped.append([Paragraph(str(cell), styles[style_name]) for cell in row])

    table = Table(wrapped, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), header_background),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("LEADING", (0, 0), (-1, -1), 11),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HIGHLIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.5, SOFT),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 0.3 * cm))


def add_page_number(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(SOFT)
    canvas.line(doc.leftMargin, height - 1.4 * cm, width - doc.rightMargin, height - 1.4 * cm)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(ACCENT_DARK)
    canvas.drawString(doc.leftMargin, height - 1.1 * cm, "APEX Project Dossier")
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(TEXT)
    canvas.drawRightString(width - doc.rightMargin, 1.0 * cm, f"Page {doc.page}")
    canvas.restoreState()


def build_story():
    styles = build_styles()
    story = []

    story.append(Spacer(1, 2.6 * cm))
    story.append(Paragraph("INDUSTRIAL AI HACKATHON SUBMISSION DOSSIER", styles["CoverKicker"]))
    story.append(Paragraph("APEX: AI Process Execution and Industrial Shadow Simulation", styles["CoverTitle"]))
    story.append(
        Paragraph(
            "Detailed project document prepared for submission review, technical evaluation, and business impact assessment.",
            styles["CoverSubtitle"],
        )
    )
    story.append(
        Paragraph(
            "Prepared from repository documentation, product requirements, architecture notes, API references, security policy, performance benchmarks, and deployment guidance available in the ETI workspace as of July 22, 2026.",
            styles["CoverSubtitle"],
        )
    )
    story.append(Spacer(1, 0.8 * cm))
    add_metric_cards(story, styles)
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph("GitHub Repository: https://github.com/RudraMalvankar/ETI", styles["CoverSubtitle"]))
    story.append(PageBreak())

    story.append(Paragraph("1. Executive Summary", styles["SectionTitle"]))
    executive = [
        "APEX is positioned as an enterprise-grade decision intelligence platform for asset-intensive industrial environments such as refineries, chemical plants, power stations, and advanced manufacturing facilities. The project solves a specific operational pain point: when a critical anomaly occurs, plant teams do not merely need document search, they need a safe next-action recommendation backed by topology awareness, document evidence, and a workflow that operators can execute under pressure.",
        "The central thesis of the platform is a transition from passive retrieval-augmented generation toward active decision support. Instead of presenting manuals and asking the operator to reason through hundreds of pages, APEX combines semantic document retrieval, graph-based blast radius analysis, shadow simulation, mitigation strategy scoring, adaptive runbook generation, operational memory, and compliance reporting inside one response pipeline.",
        "This makes the system compelling for judges and stakeholders because it addresses both technical novelty and business value at the same time. The product narrative highlights time-to-action compression from approximately 45 minutes of manual synthesis to under 5 seconds of machine-assisted incident planning while keeping a human approval step in the loop for safety-sensitive execution.",
    ]
    for paragraph in executive:
        story.append(Paragraph(paragraph, styles["Body"]))

    story.append(Paragraph("2. Problem Statement and Opportunity", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "Industrial incident response is a cognition problem as much as a monitoring problem. Operators must interpret live telemetry, plant topology, procedural manuals, and regulatory constraints simultaneously. Existing tooling generally alerts on failures or provides static search over manuals, but it does not model how a fault will propagate across assets or how mitigation steps should change when field conditions differ from the initial plan.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "Traditional RAG chatbots answer questions, but they do not simulate downstream consequences.",
            "Static maintenance suites preserve system-of-record history, but they do not dynamically redesign an isolation plan in real time.",
            "Field technicians need decisive, stepwise, mobile-friendly instructions rather than an open-ended conversation interface.",
            "Plant managers and auditors need traceability, compliance evidence, and post-incident reporting without manual paperwork overhead.",
        ],
    )
    story.append(Paragraph("3. Product Vision, Users, and Value Proposition", styles["SectionTitle"]))
    story.append(Paragraph("Primary user personas described in the project materials are summarized below.", styles["Body"]))
    persona_table = [
        ["Persona", "Need", "What APEX Delivers"],
        [
            "Control Room Engineer",
            "Fast understanding of plant health, likely cascade path, and best mitigation strategy.",
            "Dashboard visibility, blast radius graph, decision ranking, and cross-system context.",
        ],
        [
            "Field Technician",
            "Clear instructions in hazardous conditions with minimal ambiguity.",
            "Dynamic runbooks with step state, citations, lock-out/tag-out checks, and adaptive detours.",
        ],
        [
            "Plant Manager or Auditor",
            "Evidence trail, governance reporting, and root-cause visibility.",
            "Compliance exports, audit logs, and incident documentation generated from execution history.",
        ],
    ]
    add_table(story, styles, persona_table, [4.0 * cm, 5.0 * cm, 7.9 * cm])
    story.append(
        Paragraph(
            "The value proposition is strongest where downtime costs are material and human error under pressure can trigger safety incidents or unnecessary shutdowns. APEX therefore differentiates on both economic outcomes and operational safety assurance.",
            styles["Body"],
        )
    )

    story.append(Paragraph("4. Core Capabilities", styles["SectionTitle"]))
    capability_sections = [
        Section(
            "4.1 Shadow Simulation",
            [
                "When an anomaly is detected, APEX forks the effective plant state and computes a forward-looking failure path. The documented objective is to answer not only what is failing, but what will fail next if no action is taken. This is the heart of the project's narrative because it elevates the platform above retrieval and alerting tools.",
            ],
        ),
        Section(
            "4.2 Decision Intelligence",
            [
                "The platform evaluates multiple mitigation options, such as shutdown, load reduction, bypass, or isolation strategies, then returns the path with the lowest combined safety and financial impact. Confidence scoring and evidence-backed reasoning make the recommendation explainable rather than opaque.",
            ],
        ),
        Section(
            "4.3 Dynamic Adaptive Runbooks",
            [
                "The system converts an abstract mitigation path into technician-ready JSON action steps. If a field condition changes, such as a valve becoming stuck, the runbook is recalculated rather than abandoned. That live adaptation loop is a major demo moment because it shows genuine state awareness.",
            ],
        ),
        Section(
            "4.4 Operational Memory",
            [
                "Human feedback is not discarded. If operators reject or adjust recommended actions, APEX stores the event context and learns from those choices for future decision support, helping the system evolve from one-off assistance to institutional operational memory.",
            ],
        ),
    ]
    for section in capability_sections:
        story.append(Paragraph(section.title, styles["SubTitle"]))
        for paragraph in section.body:
            story.append(Paragraph(paragraph, styles["Body"]))
    story.append(Paragraph("5. End-to-End System Architecture", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The repository documentation describes APEX as a layered architecture that combines ingestion, retrieval, graph topology, simulation, reasoning, workflow generation, and governance. The diagram below is a submission-ready synthesis of that pipeline.",
            styles["Body"],
        )
    )
    story.append(build_architecture_drawing())
    story.append(Spacer(1, 0.3 * cm))
    add_bullets(
        story,
        styles,
        [
            "Ingestion starts with OEM manuals, SOPs, historical incidents, and simulated telemetry triggers.",
            "Context assembly uses chunking, embeddings, and vector search to pull grounded evidence.",
            "A plant topology graph models asset relationships and enables deterministic blast radius analysis.",
            "Reasoning combines graph context with retrieved evidence to score mitigation options.",
            "Runbook generation produces executable, technician-facing action steps with citations and safety checks.",
            "Governance closes the loop with audit logs, operational memory, and PDF compliance exports.",
        ],
    )

    story.append(Paragraph("6. Technical Stack and Engineering Decisions", styles["SectionTitle"]))
    tech_table = [
        ["Layer", "Selected Technology", "Why It Matters"],
        ["Backend API", "Python + FastAPI", "Async APIs, strong AI ecosystem fit, clean schema-driven design."],
        ["Frontend", "React 18 + TypeScript + Vite", "Fast iteration, modular UI, strong developer ergonomics."],
        ["State Management", "Zustand", "Low-boilerplate shared state for graph, alerts, and runbook views."],
        ["Graph Engine", "NetworkX", "Fast in-memory topology traversal and blast radius computation."],
        ["Vector Store", "Qdrant", "Low-latency document retrieval with payload filtering."],
        ["AI Provider Layer", "Gemini and provider abstractions", "Supports grounded reasoning and structured outputs."],
        ["Styling and Visuals", "Tailwind CSS, charts, graph visualization", "Industrial dashboard presentation and interaction."],
    ]
    add_table(story, styles, tech_table, [3.2 * cm, 4.5 * cm, 8.8 * cm])
    story.append(Paragraph("7. Functional Flow and Major Modules", styles["SectionTitle"]))
    module_body = [
        "Document intelligence begins with uploading plant manuals and structured data, then parsing and indexing them into the retrieval layer. Search endpoints expose this context for downstream reasoning and validation workflows.",
        "The graph subsystem models nodes and edges of the industrial asset topology. From there, blast radius analysis can identify downstream impact zones for a failed asset in milliseconds according to the documented benchmarks.",
        "The simulation subsystem projects likely propagation paths, which are then passed into the decision engine. That engine assembles context, validates JSON structure, resolves citations, and scores mitigation plans.",
        "Runbook services translate recommended strategies into a set of machine-validated technician steps. Feedback processors and regeneration services support runtime changes, which is what enables the adaptive 'stuck valve' redirection scenario.",
        "Compliance and explainability services produce reports, evidence mapping, decision traces, and audit artifacts, making the system suitable not just for action guidance but also for governance review.",
    ]
    for paragraph in module_body:
        story.append(Paragraph(paragraph, styles["Body"]))

    story.append(Paragraph("Representative backend service families found in the repository", styles["SubTitle"]))
    service_table = [
        ["Service Area", "Representative Components"],
        ["Simulation", "SimulationEngine, PropagationEngine, RiskEvaluator, ScenarioGenerator"],
        ["Decision", "DecisionEngine, PromptBuilder, Retriever, ConfidenceEngine, CitationResolver"],
        ["Runbook", "RunbookGenerator, RunbookEngine, SafetyValidator, DependencyResolver"],
        ["Graph", "GraphBuilder, BlastRadiusEngine, PathFinder, GraphTraversal"],
        ["Memory", "OperationalMemoryEngine, TrendAnalyzer, IncidentHistoryStore"],
        ["Compliance and Explainability", "ComplianceEngine, ReportGenerator, DecisionTraceBuilder, EvidenceFormatter"],
    ]
    add_table(story, styles, service_table, [5.0 * cm, 11.5 * cm], header_background=ACCENT_DARK)

    story.append(Paragraph("8. API Surface and Interaction Model", styles["SectionTitle"]))
    api_table = [
        ["Endpoint Group", "Purpose", "Typical User"],
        ["Authentication", "Register, login, token issuance, and protected session access.", "Public, operators, admins"],
        ["Documents", "Upload and index manuals, SOPs, and structured source files.", "Engineer or admin"],
        ["Search", "Grounded semantic retrieval over indexed industrial documents.", "Operator and above"],
        ["Graph", "Build topology and compute blast radius for a failed asset.", "Admin for build, operator for analysis"],
        ["Simulation", "Run incident projections and scenario analyses.", "Operator and above"],
        ["Decision and Runbook", "Recommend mitigation and generate adaptive action plans.", "Operator and above"],
        ["Memory", "Store learned operational outcomes for future reference.", "Engineer or admin"],
        ["Compliance and Audit", "Generate reports, export PDFs, and retrieve audit logs.", "Auditor or admin"],
    ]
    add_table(story, styles, api_table, [4.1 * cm, 8.7 * cm, 3.7 * cm])
    story.append(Paragraph("9. Security, Governance, and Trust Model", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "Because APEX is designed for safety-critical operations, trust boundaries matter as much as model capability. The repository security policy outlines a defense-in-depth posture rather than a simple prompt-and-response workflow.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "JWT-based authentication with role claims and token expiry metadata.",
            "Token invalidation support through a blacklist model for logout or revoked sessions.",
            "Rate limiting on authentication paths to reduce brute-force risk.",
            "Role-based access control that separates operator, engineer, auditor, and admin duties.",
            "Constrained generation philosophy in which unsafe or graph-invalid actions are rejected before reaching the operator.",
            "Compliance mapping toward standards such as OISD-STD-117, PESO Rule 14, and Factory Act Section 31.",
        ],
    )
    story.append(
        Paragraph(
            "This matters for judges because it addresses the common concern that AI systems in industrial settings might hallucinate dangerous actions. APEX's answer is that the model is bounded by deterministic asset knowledge, validation rules, and human sign-off before execution.",
            styles["Body"],
        )
    )

    story.append(Paragraph("10. Performance and Reliability Profile", styles["SectionTitle"]))
    perf_table = [
        ["Subsystem", "Mean Latency", "Stated SLA"],
        ["Health check", "3.9 ms", "< 10 ms"],
        ["Search", "22.1 ms", "< 50 ms"],
        ["Graph blast radius", "7.5 ms", "< 20 ms"],
        ["Simulation", "43.2 ms", "< 100 ms"],
        ["Decision recommendation", "119.3 ms", "< 500 ms"],
        ["Runbook generation", "70.7 ms", "< 200 ms"],
        ["Compliance PDF export", "893.3 ms", "< 1500 ms"],
    ]
    add_table(story, styles, perf_table, [7.0 * cm, 4.0 * cm, 4.0 * cm], header_background=SUCCESS)
    story.append(
        Paragraph(
            "The benchmark profile supports the hackathon claim that the system is responsive enough for live demonstration. The most important reliability promise in the PRD is graceful degradation: if advanced reasoning fails, the system can fall back to static SOP retrieval rather than returning nothing.",
            styles["Body"],
        )
    )

    story.append(Paragraph("11. Frontend Experience and Demo Story", styles["SectionTitle"]))
    add_bullets(
        story,
        styles,
        [
            "Control-room style dashboard for anomaly awareness and operational metrics.",
            "Interactive knowledge graph and causal map for blast radius visualization.",
            "Decision view for recommended mitigation strategies and impact comparisons.",
            "Runbook page for technician execution, feedback capture, and adaptive detours.",
            "Compliance, memory, and incident history views for post-event review.",
            "Mobile-friendly field workflow emphasis called out in the judging strategy.",
        ],
    )
    story.append(
        Paragraph(
            "For presentation purposes, the strongest demo arc is: detect anomaly, show blast radius, recommend strategy, generate runbook, mark a step as failed, recalculate the path live, and finish with a compliance report export. That sequence proves the product is not merely a retrieval shell.",
            styles["Body"],
        )
    )
    story.append(Paragraph("12. Hackathon Positioning and Judge Narrative", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The project's internal judging guidance is unusually clear and should be reflected in the document submitted to evaluators. The recommended framing is that most teams build a search engine, while APEX builds a decision engine. That line works because it maps cleanly to the platform's architecture and to the live adaptive runbook demo.",
            styles["Body"],
        )
    )
    judge_table = [
        ["Judging Criterion", "APEX Strength", "How To Emphasize"],
        ["Innovation", "Dynamic runbook adaptation and shadow simulation.", "Demo the stuck-valve recalculation moment."],
        ["Business impact", "Downtime reduction, faster response, automated governance.", "Quantify time and cost savings clearly."],
        ["Technical excellence", "Graph logic plus grounded AI reasoning.", "Show the layered pipeline and validation path."],
        ["Scalability", "Schema-driven onboarding and modular services.", "Explain how new plants can be modeled from uploaded assets."],
        ["User experience", "Different surfaces for control room, field, and auditors.", "Spend time in both dashboard and technician flows."],
    ]
    add_table(story, styles, judge_table, [3.7 * cm, 6.0 * cm, 5.3 * cm])

    story.append(Paragraph("13. Deployment and Production Readiness Signals", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The repository includes deployment notes for Docker Compose, cloud-hosted backend services, environment variable management, and reverse proxy routing. Even if the current build is hackathon-oriented, those assets signal product maturity and help judges view the system as commercially extensible rather than a one-day prototype.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "Containerized deployment path with `docker-compose.yml`.",
            "Configurable backing services for relational storage, vector retrieval, cache, and AI providers.",
            "Hosted frontend and secured API topology documented for production scenarios.",
            "Role-aware governance endpoints suitable for enterprise review workflows.",
        ],
    )

    story.append(Paragraph("14. Testing and Repository Depth", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The repository structure demonstrates breadth across backend unit tests, integration tests, benchmark scripts, frontend state and service tests, and detailed engineering documentation. Test files cover auth, audit, compliance, decisioning, documents, explainability, graph logic, integration flows, memory, observability, rate limiting, runbooks, runtime stability, and simulation.",
            styles["Body"],
        )
    )
    story.append(
        Paragraph(
            "That breadth is strategically important in a submission dossier because it shows the project team did not only build a visual prototype; they invested in correctness, validation, and maintainability across the platform surface.",
            styles["Body"],
        )
    )

    story.append(Paragraph("15. Roadmap and Future Expansion", styles["SectionTitle"]))
    roadmap_items = [
        "Integrate with real plant telemetry systems beyond simulated triggers.",
        "Persist topology in a production graph database while retaining fast in-memory traversal paths.",
        "Expand multimodal understanding for diagrams, images, and richer operating evidence.",
        "Introduce deeper multi-tenant policy controls and enterprise-grade identity integrations.",
        "Continue improving feedback loops so operator choices shape future mitigation ranking.",
    ]
    add_bullets(story, styles, roadmap_items)

    story.append(Paragraph("16. Conclusion", styles["SectionTitle"]))
    conclusion = [
        "APEX is compelling because it ties together several individually useful technologies into a single operator-centered workflow: grounded retrieval, topology reasoning, simulation, decision support, adaptive execution, and compliance reporting. The result is a system that feels purposeful for industrial incident response rather than a generic AI wrapper.",
        "From a submission standpoint, the most persuasive angle is not just that the product uses AI, but that it operationalizes AI responsibly. The platform is designed to recommend actions that are evidence-backed, graph-constrained, auditable, and human-approved. That combination gives the project both demo excitement and credibility.",
        "This PDF is therefore suitable as a detailed competition upload, technical handoff artifact, or investor-style project dossier for the current repository state.",
    ]
    for paragraph in conclusion:
        story.append(Paragraph(paragraph, styles["Body"]))

    return story


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT_FILE),
        pagesize=A4,
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=2.0 * cm,
        bottomMargin=1.6 * cm,
        title="APEX Project Dossier",
        author="Codex",
    )
    doc.build(build_story(), onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
