# **App Name**: FlowMind

## Core Features:

- Visual Node Editor: Drag-and-drop interface powered by React Flow for designing complex automation workflows.
- State Persistence: Save and version control node configurations and canvas states using a PostgreSQL database via Prisma.
- AI Orchestration Tool: A feature where the LLM uses logic as a tool to determine which external nodes to trigger based on the input prompt.
- Secure API Vault: Encrypted storage for external service keys to safely connect OpenAI, Twitter, and other platforms.
- Execution Monitoring: A real-time dashboard displaying workflow health metrics and step-by-step execution history.
- Streaming Response Logs: Integrated console that streams AI-generated outputs and system logs directly into the builder view.
- Adaptive Logic Nodes: Pre-built logic gates that use AI reasoning to route data flows dynamically between different API integrations.

## Style Guidelines:

- A dark, developer-focused scheme utilizing a deep navy background (#0b0d11) with a vibrant neon blue primary (#3b82f6) and a sharp cyan accent (#06b6d4) for active paths.
- User requested pairing: 'Inter' (sans-serif) for general UI and 'Fira Code' (monospace) for logs and code editors. Note: currently only Google Fonts are supported.
- Clean, thin-line technical icons with small pulse animations when a specific service node is executing.
- Full-width immersive canvas layout with collapsible sidebars and a 'snap-to-grid' technical background.
- Bioluminescent pulse effects on connecting edges (paths) during active data flow transitions.