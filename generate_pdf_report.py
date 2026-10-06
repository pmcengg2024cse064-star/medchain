import os
import sys
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable, PageBreak
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # We skip header/footer on page 1 (Cover / Header page)
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(54, 750, "MEDCHAIN AI EXECUTIVE SUITE — END-TO-END PROJECT REPORT & USER GUIDE")
            
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

            # Footer
            self.line(54, 45, 558, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(54, 32, "Confidential — For Clinical & System Architectural Evaluation")
            
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 32, page_text)
            
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Deep Slate Navy
    CYAN = colors.HexColor("#0284C7")       # Dark Cyan / Blue Accent
    INDIGO = colors.HexColor("#4F46E5")     # Deep Indigo Accent
    EMERALD = colors.HexColor("#059669")    # Emerald Green
    TEXT_DARK = colors.HexColor("#1E293B")  # Dark Slate
    TEXT_MUTED = colors.HexColor("#475569") # Muted Text
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Light Slate Background
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=CYAN,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=INDIGO,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        leftIndent=12,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=4,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0369A1")
    )

    story = []

    # ==================== COVER / HEADER BANNER ====================
    story.append(Paragraph("MedChain AI Executive Suite", title_style))
    story.append(Paragraph("Decentralized Organ Allocation Engine, DeepSurv Analytics & Blockchain Provenance Architecture", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=CYAN, spaceBefore=0, spaceAfter=12))

    # Meta Table
    meta_data = [
        [
            Paragraph("<b>Document Type:</b> Complete System User Guide & Architecture Report", body_style),
            Paragraph(f"<b>Date:</b> {datetime.datetime.now().strftime('%B %d, %Y')}", body_style)
        ],
        [
            Paragraph("<b>Core Domain:</b> Healthcare AI, Survival Analytics, EVM Blockchain", body_style),
            Paragraph("<b>Version:</b> 1.0.0 (Production Executive Suite)", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[270, 234])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ==================== SECTION 1: EXECUTIVE SUMMARY ====================
    story.append(Paragraph("1. Executive Summary & Purpose", h1_style))
    story.append(Paragraph(
        "<b>MedChain AI</b> is an enterprise-grade, decentralized organ allocation platform designed to revolutionize "
        "donor-recipient organ matching, 5-year post-transplant survival prediction, and multi-hospital consortium organ distribution. "
        "Historically, organ allocation systems suffer from regional allocation sub-optimality, lack of transparency, and susceptibility "
        "to data tampering. MedChain addresses these challenges by combining state-of-the-art machine learning models with "
        "privacy-preserving bipartite graph optimization and immutable Smart Contract provenance.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Key Objectives & System Capabilities:</b>", body_style
    ))
    story.append(Paragraph("• <b>High-Precision Machine Learning Inference:</b> Predicts donor-recipient organ compatibility scores and 5-year post-transplant survival probabilities using Gradient Boosting classifiers.", bullet_style))
    story.append(Paragraph("• <b>Explainable AI & Survival Trajectories:</b> Computes SHAP (SHapley Additive exPlanations) feature attributions and models 60-month Kaplan-Meier hazard curves.", bullet_style))
    story.append(Paragraph("• <b>Phase 2 Global Bipartite Graph Optimization:</b> Uses the Hungarian Algorithm (Kuhn-Munkres algorithm) across a 5-hospital consortium network to maximize total organ compatibility while preserving 100% data privacy via score-only matrices.", bullet_style))
    story.append(Paragraph("• <b>Phase 3 Blockchain Audit & Provenance:</b> Commits every approved organ allocation tuple to an Ethereum Virtual Machine (EVM) Solidity smart contract (<code>MedChainLedger.sol</code>), producing Keccak256 digests and ERC-721 Virtual NFT Digital Twin certificates.", bullet_style))
    story.append(Spacer(1, 10))

    # ==================== SECTION 2: END-TO-END SYSTEM ARCHITECTURE ====================
    story.append(Paragraph("2. End-to-End Technology Stack & Architecture", h1_style))
    story.append(Paragraph(
        "The MedChain platform is architected as a high-performance multi-tier software system combining Python analytical microservices, a dynamic React SPA frontend, and an Ethereum EVM smart contract layer.",
        body_style
    ))

    # Tech Stack Table
    tech_data = [
        [Paragraph("<b>Component Layer</b>", body_style), Paragraph("<b>Technologies Used</b>", body_style), Paragraph("<b>Core Functional Role</b>", body_style)],
        [
            Paragraph("<b>Backend Engine</b>", body_style),
            Paragraph("FastAPI, Uvicorn, Python 3.10+", body_style),
            Paragraph("RESTful API services, RPC proxying, Hardhat node auto-launcher.", body_style)
        ],
        [
            Paragraph("<b>AI / ML Models</b>", body_style),
            Paragraph("Scikit-Learn, Lifelines, Scipy, Joblib, Pandas, NumPy", body_style),
            Paragraph("Gradient Boosting Classifier, Kaplan-Meier fitter, Hungarian bipartite optimizer.", body_style)
        ],
        [
            Paragraph("<b>Frontend UI</b>", body_style),
            Paragraph("React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide", body_style),
            Paragraph("Modern glassmorphism interface, interactive visual graph canvas, real-time telemetry.", body_style)
        ],
        [
            Paragraph("<b>Blockchain & Provenance</b>", body_style),
            Paragraph("Solidity ^0.8.20, Hardhat, Ethers.js v6, Keccak256, Hyperledger Fabric concept", body_style),
            Paragraph("Smart contract ledger (<code>MedChainLedger.sol</code>), ERC-721 NFT twin, on-chain minting.", body_style)
        ],
        [
            Paragraph("<b>Export & Utilities</b>", body_style),
            Paragraph("html2canvas, jsPDF, react-qr-code, ReportLab", body_style),
            Paragraph("Generating downloadable PDF smart contract certificates & executive user guides.", body_style)
        ]
    ]
    tech_table = Table(tech_data, colWidths=[110, 160, 234])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 12))

    # ==================== SECTION 3: DETAILED TAB & MENU GUIDE ====================
    story.append(Paragraph("3. Detailed Guide to All Tabs, Menus & Interface Modules", h1_style))
    story.append(Paragraph(
        "The MedChain Executive Dashboard is organized into a top persistent navigation header and five dedicated multi-tab viewports.",
        body_style
    ))

    # Global Header & Controls
    story.append(Paragraph("A. Global Header & Action Controls", h2_style))
    story.append(Paragraph("• <b>FastAPI Health Connection Badge:</b> Displays live status of the backend engine (<code>FastAPI Connected</code> glowing green vs <code>Offline Mode</code> amber warning with reconnect button).", bullet_style))
    story.append(Paragraph("• <b>Preset Clinical Vectors:</b> One-click buttons to populate sample donor-recipient profiles: <b>Optimal</b> (92% survival baseline), <b>Marginal</b> (72% survival), and <b>High Risk</b> (55% survival).", bullet_style))
    story.append(Paragraph("• <b>Multi-Tab Navigation Bar:</b> Enables instant seamless switching between all 5 system modules with active route indicators.", bullet_style))
    story.append(Spacer(1, 6))

    # Tab 1
    story.append(Paragraph("B. Tab 1: Consortium Network Map (Hyperledger Fabric Mesh)", h2_style))
    story.append(Paragraph(
        "This tab visualizes the 5-hospital federated consortium network that synchronizes anonymized organ vectors across regions:",
        body_style
    ))
    story.append(Paragraph("1. <b>HOS-01: Johns Hopkins Organ Center</b> (Baltimore, MD) — Node ping ~14ms", bullet_style))
    story.append(Paragraph("2. <b>HOS-02: Mayo Clinic Transplant Hub</b> (Rochester, MN) — Node ping ~18ms", bullet_style))
    story.append(Paragraph("3. <b>HOS-03: Mass General Allocation Node</b> (Boston, MA) — Node ping ~12ms", bullet_style))
    story.append(Paragraph("4. <b>HOS-04: Stanford Medical Blockchain</b> (Palo Alto, CA) — Node ping ~24ms", bullet_style))
    story.append(Paragraph("5. <b>HOS-05: Cleveland Clinic FedNet</b> (Cleveland, OH) — Node ping ~16ms", bullet_style))
    story.append(Paragraph(
        "<b>Key Features:</b> Interactive SVG peer topology map with animated packet flows, peer telemetry inspector (CPU load, committed block height, PBFT consensus state, mTLS channel encryption, and chaincode <code>medchain-cc:v3.2</code> status).",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Tab 2
    story.append(Paragraph("C. Tab 2: Clinical Match Engine (Vector Form Inputs)", h2_style))
    story.append(Paragraph(
        "This module allows clinical team members to input biological parameters for a donor-recipient pair:",
        body_style
    ))
    story.append(Paragraph("• <b>Patient Age (18 - 85 yrs) & Donor Age (15 - 80 yrs):</b> Interactive sliders auto-computing the Absolute Age Differential (Δ).", bullet_style))
    story.append(Paragraph("• <b>Patient BMI (14 - 50 kg/m²) & Donor Weight (35 - 150 kg):</b> Precise biometric inputs.", bullet_style))
    story.append(Paragraph("• <b>RealTime Organ Health (0 - 100) & Organ Condition Rating (1 - 10):</b> Perfusion & viability parameters.", bullet_style))
    story.append(Paragraph("• <b>HLA / Organ Match Rating (Grade 1 to 5):</b> Immunological structural match level buttons.", bullet_style))
    story.append(Paragraph("• <b>Blood Group Compatibility Toggle:</b> ABO/Rh cross-match switch (Compatible vs Incompatible).", bullet_style))
    story.append(Paragraph("• <b>Baseline Survival Estimate:</b> Initial clinical prognosis input.", bullet_style))
    story.append(Paragraph("<b>Action:</b> Clicking <b>'Evaluate Organ Allocation & Survival'</b> transmits the vector to the FastAPI endpoint <code>/api/predict-match</code>.", body_style))
    story.append(Spacer(1, 6))

    # Tab 3
    story.append(Paragraph("D. Tab 3: DeepSurv Analytics (AI Predictions & Explainability)", h2_style))
    story.append(Paragraph(
        "Presents comprehensive analytical outputs returned by the AI engine:",
        body_style
    ))
    story.append(Paragraph("• <b>AI Recommendation Badge:</b> Displays <code>APPROVED</code> (Match score ≥ 70%) or <code>REJECTED_BY_AI</code>.", bullet_style))
    story.append(Paragraph("• <b>4-Stage AI Stepper:</b> Vector Normalization → Gradient Boosting → SHAP Attributions → Kaplan-Meier Curves.", bullet_style))
    story.append(Paragraph("• <b>KPI Cards:</b> AI Match Confidence Score (%), 5-Year Survival Expectancy (%), and DeepSurv Hazard Ratio (Relative Risk).", bullet_style))
    story.append(Paragraph("• <b>SHAP Feature Importances Chart:</b> Recharts horizontal bar chart depicting top 5 clinical feature weights driving the AI decision.", bullet_style))
    story.append(Paragraph("• <b>Kaplan-Meier Survival Probability Curve:</b> 60-month longitudinal line chart tracking patient survival trajectory.", bullet_style))
    story.append(Spacer(1, 6))

    # Tab 4
    story.append(Paragraph("E. Tab 4: Smart Contract Ledger & NFT Provenance", h2_style))
    story.append(Paragraph(
        "Translates approved AI decisions into permanent, tamper-proof blockchain records:",
        body_style
    ))
    story.append(Paragraph("• <b>Hardhat EVM Status & Live Terminal:</b> Real-time STDOUT log window capturing consensus rounds and block proposals.", bullet_style))
    story.append(Paragraph("• <b>On-Chain Minting Engine:</b> Executes <code>MedChainLedger.mintMatchRecord(...)</code> to create a Keccak256 hash digest of the match tuple.", bullet_style))
    story.append(Paragraph("• <b>Official High-Grade Certificate:</b> Styled UI certificate with United States Organ Allocation Authority emblem, serial number, organ specs, Keccak256 digest, scannable QR code, signature lines, and official EVM seal.", bullet_style))
    story.append(Paragraph("• <b>Virtual 3D Holographic NFT Twin:</b> ERC-721 token card showing unique Token ID, IPFS metadata URI, and spinning organ core.", bullet_style))
    story.append(Paragraph("• <b>PDF Export:</b> Integrated canvas exporter allowing clinicians to download official PDF certificates.", bullet_style))
    story.append(Spacer(1, 6))

    # Tab 5
    story.append(Paragraph("F. Tab 5: Global Graph Matching (Phase 2 Hungarian Optimization)", h2_style))
    story.append(Paragraph(
        "Solves the multi-hospital organ distribution problem using linear assignment optimization:",
        body_style
    ))
    story.append(Paragraph("• <b>100% Privacy Preservation:</b> Uses Keccak256/SHA-256 anonymized hashes and score-only matrices (Zero raw EHR exposure).", bullet_style))
    story.append(Paragraph("• <b>Hungarian Engine:</b> Runs <code>scipy.optimize.linear_sum_assignment</code> to maximize total compatibility.", bullet_style))
    story.append(Paragraph("• <b>Impact Metrics:</b> Displays Global Hungarian Score vs Greedy Baseline Score, Network Efficiency Gain (+%), and Life-Years Saved (+Years).", bullet_style))
    story.append(Paragraph("• <b>View Modes:</b> Global Hungarian Optimal Bipartite Web, Greedy Sequential Baseline, and 10x10 Anonymized Adjacency Heatmap Matrix.", bullet_style))
    story.append(Spacer(1, 10))

    # ==================== SECTION 4: END-TO-END WORKFLOW ====================
    story.append(Paragraph("4. End-to-End Operational Workflow", h1_style))
    story.append(Paragraph("Follow this step-by-step procedure when operating the MedChain platform:", body_style))
    
    workflow_steps = [
        ("Step 1: System Initialization", "Launch FastAPI backend (<code>uvicorn main:app --reload</code>) which automatically verifies/starts the local Hardhat EVM node on port 8545 and deploys <code>MedChainLedger.sol</code>."),
        ("Step 2: Network Audit", "Navigate to Tab 1 ('Consortium Network') to verify that all 5 hospital peer nodes are online and synchronized with low latency."),
        ("Step 3: Clinical Parameter Entry", "Navigate to Tab 2 ('Clinical Match Engine'). Select a preset (e.g. 'Optimal') or adjust sliders for donor-recipient parameters. Click 'Evaluate Organ Allocation & Survival'."),
        ("Step 4: Review AI & Survival Analytics", "Tab 3 ('DeepSurv Analytics') automatically opens. Review the AI Match Confidence Score, 5-Year Survival Expectancy, SHAP feature importances, and Kaplan-Meier trajectory curve."),
        ("Step 5: Blockchain Provenance Minting", "Click 'Proceed to Blockchain' to switch to Tab 4 ('Smart Contract Ledger'). Click 'Mint Smart Contract to Hyperledger / EVM'. View the generated official certificate and download the PDF."),
        ("Step 6: Global Bipartite Optimization", "Navigate to Tab 5 ('Global Graph Matching'). Click 'Run Global Bipartite Optimization' to observe network-wide Hungarian optimization across all 10 donor-recipient pool pairs.")
    ]

    for title, desc in workflow_steps:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    story.append(Spacer(1, 10))

    # ==================== SECTION 5: SMART CONTRACT CODE REFERENCE ====================
    story.append(Paragraph("5. Smart Contract Specifications (MedChainLedger.sol)", h1_style))
    story.append(Paragraph(
        "Below is the core Solidity smart contract deployed on the EVM blockchain layer for storing immutable organ match records:",
        body_style
    ))

    contract_snippet = (
        "// SPDX-License-Identifier: MIT\n"
        "pragma solidity ^0.8.20;\n\n"
        "contract MedChainLedger {\n"
        "    struct MatchRecord {\n"
        "        string patientId;\n"
        "        string donorId;\n"
        "        string organType;\n"
        "        uint256 matchScore;\n"
        "        uint256 timestamp;\n"
        "        bytes32 recordHash;\n"
        "        address registeredBy;\n"
        "    }\n\n"
        "    mapping(bytes32 => MatchRecord) public records;\n"
        "    bytes32[] public recordHashes;\n"
        "    event MatchMinted(bytes32 indexed recordHash, string patientId, string donorId, uint256 matchScore);\n\n"
        "    function mintMatchRecord(string memory _patientId, string memory _donorId,\n"
        "                             string memory _organType, uint256 _matchScore) public returns (bytes32, uint256) {\n"
        "        uint256 currentTimestamp = block.timestamp;\n"
        "        bytes32 recordHash = keccak256(abi.encodePacked(_patientId, _donorId, _organType, _matchScore, currentTimestamp, msg.sender));\n"
        "        records[recordHash] = MatchRecord(_patientId, _donorId, _organType, _matchScore, currentTimestamp, recordHash, msg.sender);\n"
        "        recordHashes.push(recordHash);\n"
        "        emit MatchMinted(recordHash, _patientId, _donorId, _matchScore);\n"
        "        return (recordHash, currentTimestamp);\n"
        "    }\n"
        "}"
    )
    story.append(Paragraph(contract_snippet.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))
    story.append(Spacer(1, 10))

    # ==================== SECTION 6: CONCLUSION & DEPLOYMENT ====================
    story.append(Paragraph("6. Deployment & Environment Setup Guide", h1_style))
    story.append(Paragraph("<b>Backend Setup:</b>", h2_style))
    story.append(Paragraph("1. Install Python dependencies: <code>pip install -r requirements.txt</code>", bullet_style))
    story.append(Paragraph("2. Run FastAPI server: <code>uvicorn main:app --reload --port 8000</code>", bullet_style))
    story.append(Paragraph("<b>Frontend Setup:</b>", h2_style))
    story.append(Paragraph("1. Change directory: <code>cd frontend</code>", bullet_style))
    story.append(Paragraph("2. Install packages: <code>npm install</code>", bullet_style))
    story.append(Paragraph("3. Start Vite dev server: <code>npm run dev</code>", bullet_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Conclusion:</b> MedChain AI presents a groundbreaking fusion of machine learning, privacy-preserving graph algorithms, and EVM blockchain technology, delivering an uncompromised solution for transparent and life-saving organ allocation.", body_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Successfully built PDF User Guide report at: {filename}")

if __name__ == '__main__':
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "MedChain_Complete_Project_Report.pdf")
    build_pdf(output_path)
