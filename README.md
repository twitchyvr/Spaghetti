# Ambient AI Work Assistant

An AI-powered work assistant that passively observes professional work and automatically generates high-quality, structured, and context-aware documentation for legal professionals.

## Project Vision

**The Problem:** In high-stakes professional environments like legal and finance, the creation of documentation (client memos, case notes, meeting summaries) is critical but is also a manual, time-consuming chore that interrupts the flow of billable work and is prone to human error or omission.

**The Vision:** To create an "ambient" AI-powered work assistant that passively and securely observes a professional's work (voice conversations, on-screen activity, document interaction) and automatically generates high-quality, structured, and context-aware documentation. It transforms documentation from a required task into an effortless, auditable byproduct of normal work.

## Guiding Principles

- **Intuitive & Non-Intrusive:** The user experience must be incredibly simple. The assistant should feel like a natural extension of the workflow, not another complex tool to manage.
- **Enterprise-Grade Professionalism & Security:** The UI must be clean, modern, and inspire the highest level of confidence and trust, suitable for partners at a top-tier law firm. Security and confidentiality are paramount.
- **Targeted & Relevant:** The primary user persona for this PoC is a **Legal Professional (Paralegal, Associate, or Partner)**. The examples, workflow, templates, and generated content must be highly relevant to their daily tasks.
- **Clarity & Actionability:** The final generated document is the "hero" of this application. It must be well-structured, easy to read, and immediately useful, with clear action items and key takeaways.

## Development Constraints

1. **Single File Mandate:** All HTML, CSS, and JavaScript MUST exist in a single `.html` file. Do not link to external stylesheets or scripts. All code must be self-contained.
2. **No External Dependencies:** Do not use any external libraries or frameworks. All functionality must be achieved with vanilla JavaScript and modern CSS.
3. **Mock, Don't Build:** This is a **Proof of Concept MOCKUP**, not a functional product. All "AI" and "backend" processes must be simulated using hardcoded example data and `setTimeout()` delays.

## Version History

**v1.0 - Initial Release (2025-07-24)**
- Implemented the core three-panel layout and basic AI assistant controls (Start/Stop, Status)
- Simulated a "Live Context Feed" and documentation generation process for an IT Operations persona
- Ensured the entire application was self-contained in a single HTML file

**v2.0 - Legal Professional Overhaul (2025-07-25)**
- **UI/UX Redesign:** Overhauled the entire UI with a professional, conservative theme (navy blue, gray) suitable for a legal/financial firm
- **Persona Shift:** All mock data, templates, and examples changed to target a Legal Professional persona
- **Interactive Search:** Implemented functional mock search bar with results dropdown to simulate searching firm-wide knowledge base
- **Document Templates:** Added dropdown to select "Document Type" (e.g., 'Client Call Summary', 'Contract Review Notes')
- **Document Actions:** Added "Edit", "Save to Matter", and "Share" buttons to the generated document panel
- **Edit Functionality:** The "Edit" button toggles `contenteditable` state for in-place corrections
- **Share/Settings Modals:** Implemented functional modals for "Share" and "Settings"
- **SVG Icons:** Replaced text/emoji icons with clean, consistent SVG icon set

## Target User Persona

**Legal Professional (Paralegal, Associate, or Partner)** working in high-stakes environments requiring precise documentation of:
- Client calls and meetings
- Contract review sessions
- Case strategy discussions
- Deposition preparation
- Legal research findings