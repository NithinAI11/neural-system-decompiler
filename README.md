# 🧠 Neural System Decompiler (NSD)

<div align="center">

**An Autonomous Codebase Intelligence Engine — Where Math Comes Before AI.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![NetworkX](https://img.shields.io/badge/Graph_Math-NetworkX-orange?style=for-the-badge)](https://networkx.org/)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama3-f55036?style=for-the-badge)](https://groq.com/)
[![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-dc244c?style=for-the-badge)](https://qdrant.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

> _"Traditional AI coding assistants hallucinate architecture. NSD computes it."_

<br/>

![NSD Demo Banner](https://raw.githubusercontent.com/NithinAI11/Neural-System-Decompiler/main/assets/banner.png)

</div>

---

## 🎬 Demo

> **Watch NSD analyze a real 554-file microservices codebase in under 60 seconds.**

<div align="center">

[![NSD Demo Video](https://img.shields.io/badge/▶_Watch_Demo-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/your-demo-link)

<!-- Replace the link above with your actual YouTube/Loom demo URL -->
<!-- Recommended: record a 60–90 second screen capture of:          -->
<!--   1. Pasting a GitHub URL into the sidebar                     -->
<!--   2. The agentic pipeline log running                          -->
<!--   3. The 3D graph loading with coloured node shapes            -->
<!--   4. Clicking a bottleneck node → IDE panel sliding up         -->
<!--   5. Asking "What breaks if I modify X?" in the agent console  -->

</div>

---

## ⚡ The Problem This Solves

Every existing "AI code tool" shares the same fatal flaw: they **pass raw code text to an LLM and hope it doesn't hallucinate the architecture**.

This fails at scale. A 500-file repo will hit token limits, cross-language boundaries are invisible to pure LLMs, and there is no mathematical ground truth — just probabilistic text generation.

**NSD flips the pipeline:**

```
Raw Codebase
    │
    ▼
Deterministic AST Parsing        ← zero AI, 100% accurate
    │
    ▼
NetworkX DAG + Graph Algorithms  ← eigenvector centrality, cycle detection, clustering
    │
    ▼
Vector RAG Embeddings (Qdrant)   ← local, zero cost, zero hallucination
    │
    ▼
LLM receives computed TRUTH      ← Groq explains math, never guesses it
    │
    ▼
Multi-Dimensional WebGL UI       ← 4 topology modes, live agent console
```

The AI **never guesses the structure. It only explains the math.**

---

## ✨ Core Features

### 🌐 Polyglot API Linker — Full-Stack Cross-Language Mapping
The headline novelty. Modern systems are decoupled: React/TypeScript frontends call FastAPI/Python backends across a network boundary that traditional SAST tools cannot cross.

NSD's `UniversalASTExtractor` maintains an internal registry of backend endpoints (`@app.get('/api/v1/user')`) and simultaneously scans frontend JS/TS for network fetches (`axios.get('/api/v1/user')`). When a match is found, a mathematical `api_route` edge is created in the DAG. In the UI, this renders as a glowing purple laser connecting a TypeScript cube to a Python sphere — **true full-stack topological mapping**.

---

### ⚡ Eigenvector Centrality — God Object Detection
NSD does not ask the AI to guess your bottlenecks. It runs **`nx.eigenvector_centrality()`** across the entire graph.

Unlike simple degree centrality (which just counts how many files import a file), eigenvector centrality calculates **recursive influence** — a file scores high only if it is relied upon by other highly relied-upon files. The top 5 nodes by this score are mathematically identified as the highest single points of failure. No prompt engineering. No guessing.

---

### 👻 Phantom Code Audit — Automated Tech Debt Detection
The engine runs a directed edge `in_degree == 0` scan across all nodes. Any file with no incoming edges and no `api_route` connections and no `main`/`index` naming convention is flagged as **ORPHANED / DEAD CODE**. In one real-world test run, this found **455 phantom files** in a 554-file codebase.

---

### 🔍 Vector RAG — Local Semantic Search
Every ingested file's first 2,000 characters (capturing docstrings, imports, and class signatures) is embedded locally using **`fastembed`** with the `BAAI/bge-small-en-v1.5` model into a **Qdrant** vector database. Cosine similarity search lets you ask questions like *"Where is the password hashing logic?"* with zero API cost and zero data leaving your machine.

---

### 🤖 ReAct Agentic Console — Three-Tool Autonomous Agent
The chat interface runs a **Reasoning + Acting loop** powered by Groq (Llama-3). The LLM is given three tools and autonomously decides which to invoke:

| Tool | Trigger | What It Does |
|------|---------|------|
| `get_impact(filename)` | "What breaks if I modify X?" | Runs `nx.ancestors()` reverse graph traversal |
| `semantic_search(query)` | "Where is the auth logic?" | Cosine similarity search in Qdrant |
| `web_search(query)` | "How does FastAPI middleware work?" | Tavily API web scrape |

Results from graph traversals are returned as `highlight_nodes` arrays — the UI immediately ignites the affected nodes in the 3D space.

---

### 🌌 Multi-Dimensional Topology Engine
Four distinct mathematical representations of the same graph:

| Mode | Math | Use Case |
|------|------|----------|
| **3D Neural Cloud** | Force-directed physics simulation | General exploration, feels like a neural network |
| **4D Execution Flow** | Top-down DAG, `rootIds` cascading | Trace execution from entry points downward |
| **8D Radial Core** | Radial outward DAG | Identify core modules vs peripheral dependencies |
| **2D Flowchart** | Orthogonal flat layout | Simple, documentation-ready architecture map |

---

### 🎨 v2.0 Cyberpunk UI
- True black (#000) background with **6 swappable neon accent colours** (Cyan, Violet, Emerald, Rose, Amber, Indigo), persisted to `localStorage`
- Full Light/Dark mode via `data-theme` attribute — no flicker, no MUI theming hacks
- **9 distinct 3D node geometries** per file type: Python → Sphere, JS → Octahedron, TypeScript → Cube, Go → Tetrahedron, HTML → Cone, CSS → Torus, JSON/YAML → Icosahedron, Markdown → Dodecahedron, Dead code → Wireframe
- Bottleneck nodes get a pulsing orbital ring. Dead code is visually hollow.
- SpriteText labels float above every node, scaling dynamically with camera zoom

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INGESTION LAYER                          │
│  GitFetcher (shallow clone) │ LocalFSAdapter │ POSIX normalizer │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                        PARSING LAYER                            │
│  tree-sitter-python (AST) │ Regex heuristics (JS/TS/Go)        │
│  UniversalASTExtractor → FileAST models │ API endpoint registry │
└─────────────────┬───────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                      GRAPH MATH LAYER                           │
│  NetworkX DiGraph │ Eigenvector Centrality │ nx.simple_cycles() │
│  greedy_modularity_communities() │ in_degree Phantom Detection  │
│  System Health Score (100 - 5×bottlenecks - 15×cycles)         │
└────────┬──────────────────────────────────────┬─────────────────┘
         │                                      │
┌────────▼────────────┐              ┌──────────▼──────────────────┐
│   VECTOR RAG LAYER  │              │    SEMANTIC FUSION LAYER     │
│  fastembed BAAI     │              │  Top-5 bottlenecks → Groq   │
│  384-dim vectors    │              │  ModuleClassifier JSON       │
│  Qdrant upsert      │              │  Executive Report Markdown   │
└────────┬────────────┘              └──────────┬──────────────────┘
         │                                      │
┌────────▼──────────────────────────────────────▼─────────────────┐
│                    HYBRID QUERY ROUTER (ReAct)                   │
│  get_impact() │ semantic_search() │ web_search() │ highlight_nodes│
└─────────────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                     v2.0 FRONTEND (React + WebGL)               │
│  Dashboard │ Topology Graph │ Phantom Audit │ Configuration     │
│  react-force-graph-3d/2d │ Three.js geometries │ SpriteText     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (for MongoDB + Qdrant)
- Python 3.10+
- Node.js 18+
- API keys: [Groq](https://console.groq.com/) · [Tavily](https://tavily.com/)

### 1. Clone
```bash
git clone https://github.com/NithinAI11/Neural-System-Decompiler.git
cd Neural-System-Decompiler
```

### 2. Start Databases
```bash
docker-compose up -d
# Starts MongoDB (state caching) + Qdrant (vector search)
```

### 3. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in the project root:
```env
GROQ_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
```

```bash
uvicorn src.api.server:app --reload
# Backend available at http://localhost:8000
```

### 4. Frontend
```bash
cd nsd-frontend
npm install
npm run dev
# UI available at http://localhost:5173
```

---

## 💻 Usage

### Scanning a Codebase
Paste any GitHub URL or local absolute path into the sidebar and click **Decompile System**. The pipeline log streams in real time. Toggle **Force Re-Analysis** to bypass the MongoDB cache on repos you've already scanned.

### Reading the Dashboard
- **Macro Pattern** — autonomously identified architecture style (Microservices, Monolith, Layered, Event-Driven)
- **Micro Clusters** — number of logical component groups found by the modularity algorithm
- **Bottlenecks** — eigenvector high-risk nodes (god objects)
- **Phantom Code** — unreferenced files with `in_degree == 0`
- **Tech Stack** — derived live from file extension distribution across graph nodes

### Navigating the Graph
| Action | Control |
|--------|---------|
| Orbit  | Left-click drag |
| Zoom   | Scroll wheel |
| Pan    | Right-click drag |
| Inspect node | Click any geometry |
| Switch layout | Top controls bar |

### Agent Console Queries to Try
```
"What downstream files break if I modify auth_service.py?"
→ Triggers nx.ancestors() graph traversal, lights up affected nodes

"Where is the code that handles database connections?"
→ Triggers Qdrant cosine similarity search

"Search the web for how FastAPI middleware works in this project."
→ Triggers Tavily web search + synthesis
```

---

## 🧪 Real-World Test Run

Scanning [encode/starlette](https://github.com/encode/starlette) (a production Python web framework):

| Metric | Result |
|--------|--------|
| Total files ingested | 554 |
| Macro architecture detected | Microservices |
| Phantom / orphaned files | 455 |
| Critical bottleneck nodes | 3 (openai.js, mime.js, ollama.js) |
| Micro clusters (logical components) | 43 |
| Compile time | ~45 seconds |

---

## 🗺️ Roadmap

- [x] Deterministic AST parsing (Python `tree-sitter`, JS/TS regex)
- [x] NetworkX DAG + eigenvector centrality
- [x] Phantom code detection (in_degree scan)
- [x] Modularity clustering
- [x] Qdrant vector RAG (local embeddings)
- [x] Groq ReAct agent with tool-calling
- [x] 3D/4D/8D/2D topology renderer
- [x] Polyglot API edge linker
- [x] Phantom Audit page + system health score
- [x] Cyberpunk v2.0 UI with accent colour system
- [ ] **Temporal Diff** — compare graph centrality across Git commits to track architecture degradation
- [ ] **Change Impact Predictor** — visualise blast radius directly in the 3D graph
- [ ] **Anomaly Detector** — ML clustering on centrality distributions to flag structural anomalies
- [ ] **Automated Refactoring** — agent-generated PRs to untangle circular dependencies
- [ ] **Cross-Repo Pattern Mining** — compare architectural patterns across multiple repos

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI, Python 3.10+ |
| Graph Engine | NetworkX (DiGraph, centrality, cycles, communities) |
| AST Parsing | tree-sitter-python, regex heuristics |
| LLM | Groq (Llama-3.1-8b-instant) |
| Agentic Framework | Native JSON tool-calling (no LangChain bloat) |
| Vector DB | Qdrant (local) |
| Embeddings | fastembed, BAAI/bge-small-en-v1.5 (384-dim) |
| State Cache | MongoDB |
| Web Search | Tavily API |
| Frontend | React 18, Vite |
| 3D Rendering | Three.js, react-force-graph-3d |
| 2D Rendering | react-force-graph-2d |
| Typography | Orbitron + JetBrains Mono + Inter |

---

## 👤 Author

**Nithin** · AI/LLM Engineer 

[![GitHub](https://img.shields.io/badge/GitHub-NithinAI11-181717?style=for-the-badge&logo=github)](https://github.com/NithinAI11)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

_Built because existing tools were not good enough._

</div>