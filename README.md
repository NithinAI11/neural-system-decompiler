<div align="center">

# 🧠 Neural System Decompiler (NSD)

**An Autonomous Codebase Intelligence Engine — Where Math Comes Before AI.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![NetworkX](https://img.shields.io/badge/Graph_Math-NetworkX-orange?style=for-the-badge)](https://networkx.org/)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama3-f55036?style=for-the-badge)](https://groq.com/)
[![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-dc244c?style=for-the-badge)](https://qdrant.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## ⚠️ Honest Disclaimer — Read This First

> **This is not a production system. This is a personal research project.**
>
> NSD was built to explore one question: *"How much can we understand about a software system using pure math and graph theory, before involving an LLM at all?"*
>
> It sits alongside my other research experiments on reducing unnecessary LLM usage in AI pipelines. The goal isn't to ship a product — it's to push on a real engineering problem and see how far deterministic methods alone can get us. If you're here as a researcher, architect, or fellow curious builder: welcome. If you're expecting a polished SaaS tool: this isn't that yet.

---

<div align="center">

![NSD Demo Banner](https://raw.githubusercontent.com/NithinAI11/Neural-System-Decompiler/main/assets/banner.png)

</div>

---

## 🎬 Demo

<div align="center">

> Click the thumbnail below to watch the demo on YouTube.

[![Watch NSD in action](https://img.youtube.com/vi/4sRM-zVoXjY/maxresdefault.jpg)](https://www.youtube.com/watch?v=4sRM-zVoXjY)

*NSD scanning a real open-source codebase — 3D graph rendering, phantom code detection, and the agentic console in action. The engine is capable of handling thousands of files; the demo shows a focused subset to walk through each feature clearly.*

</div>

---

## 🧠 What Is This, Actually?

Let me explain it with an analogy before the technical stuff.

**Imagine you just joined a company with a massive codebase — thousands of files, written by dozens of people over years. Your manager says: "Understand the whole system by Monday."**

You could do it the slow way: open every file, read every function, manually trace every dependency. That takes weeks.

Or you could do what NSD does:

1. **Build a map of the city.** Every file is a building. Every import is a road connecting buildings. NSD automatically constructs this entire city map as a mathematical graph.
2. **Find the dangerous intersections.** Using graph mathematics (Eigenvector Centrality), it identifies which "buildings" are the most critical — the ones where, if something breaks, the whole city grinds to a halt. No guessing. Pure math.
3. **Find the abandoned buildings.** Files that exist but nobody ever visits (no incoming connections) are flagged as Dead Code / Phantom Files. You don't need AI to find them — just count the roads going in.
4. **Identify the neighbourhoods.** Clustering algorithms group tightly connected files into logical components — "this cluster is the Auth system", "this cluster is the Payment layer".
5. **Only then, ask an expert to explain it.** Once the map is complete and mathematically verified, NSD feeds this structured, proven data to an LLM. The LLM explains the architecture in plain English. It never has to guess the structure — because we already computed it.

**That's the core idea: Math first, AI second.**

---

## ⚡ The Problem With Existing AI Code Tools

Every current "AI coding assistant" shares the same pipeline:

```
Raw code text → LLM → Hope it doesn't hallucinate
```

This breaks badly at scale:
- A 500-file repo will hit token limits immediately
- Cross-language boundaries (React frontend calling Python backend) are invisible to pure LLMs  
- The AI has no ground truth — it guesses relationships from text patterns
- Every re-run costs tokens and may give a different (wrong) answer

**NSD's pipeline is fundamentally different:**

```
Raw code
   │
   ▼  [No AI here]
Deterministic AST Parser — reads code like a compiler, 100% accurate
   │
   ▼  [No AI here]
Mathematical Graph (NetworkX DAG) — every file, every dependency, proven
   │
   ▼  [No AI here]
Graph Algorithms — centrality, cycle detection, clustering, dead node scan
   │
   ▼  [Now AI comes in]
LLM receives structured, verified data → explains it in plain English
   │
   ▼
WebGL 3D Visualisation — see your codebase as a living neural network
```

The LLM **never guesses the structure. It only narrates computed truth.**

---

## ✨ Core Features

### 🌐 Polyglot API Linker — Cross-Language Mapping
The headline research contribution. Modern systems are split: a TypeScript/React frontend calls a Python/FastAPI backend across a network boundary. Standard analysis tools see these as two separate codebases and miss the connection entirely.

NSD solves this by maintaining an internal registry of backend routes (e.g. `@app.get('/api/v1/user')` in Python) and simultaneously scanning frontend code for matching network calls (e.g. `axios.get('/api/v1/user')` in TypeScript). When a match is found, a mathematical `api_route` edge is added to the graph — a genuine, proven cross-language dependency link.

In the 3D UI, this renders as a glowing edge connecting a TypeScript cube to a Python sphere. You can literally *see* your full-stack dependency chain.

---

### ⚡ Eigenvector Centrality — God Object / Bottleneck Detection
There's a concept in mathematics called Eigenvector Centrality. It's the same algorithm that powers Google's original PageRank.

Applied to a codebase: a file gets a high centrality score not just if many other files depend on it, but if the files that depend on it are *also heavily depended upon*. It measures **recursive influence across the entire system**.

NSD runs `nx.eigenvector_centrality()` on every node in the graph and identifies the top bottlenecks — files where a single bug could cascade through the entire architecture. No AI opinion. Just math.

---

### 👻 Phantom Code Audit — Dead Code via Graph Theory
When a file has no incoming edges in the dependency graph (in_degree == 0), it means nothing in the entire codebase imports or calls it. It exists, but it's functionally invisible.

NSD applies a safety check: it exempts files that are backend entry points (API routes triggered from the frontend), and files named `main` or `index`. Everything else with zero incoming edges is flagged as **Phantom / Dead Code**.

In one test run on a real open-source repo, this method found hundreds of orphaned files — tech debt that had quietly accumulated over years.

---

### 🔍 Vector RAG — Local Semantic Search
The graph tells you *how* files are connected. But it doesn't tell you *what* the code is doing logically.

NSD embeds the first 2,000 characters of every file (imports, class signatures, docstrings) into a local **Qdrant** vector database using the `BAAI/bge-small-en-v1.5` model (384-dimensional embeddings). This runs entirely on your machine — zero cost, zero data sent anywhere.

You can then ask semantic questions: *"Where is the authentication logic?"* or *"Which file handles payment processing?"* — and get mathematically similar code back via cosine similarity search.

---

### 🤖 ReAct Agentic Console — Autonomous Three-Tool Agent
The chat panel isn't a chatbot — it's an agent with three callable tools:

| Tool | What Triggers It | What It Does |
|------|-----------------|--------------|
| `get_impact(file)` | "What breaks if I modify X?" | Runs `nx.ancestors()` reverse graph traversal — mathematically maps every file that will be affected |
| `semantic_search(query)` | "Where is the X logic?" | Cosine similarity search in Qdrant vector DB |
| `web_search(query)` | "How does library X work?" | Tavily API call for external documentation |

The LLM decides which tool to invoke, gets the result, and synthesises a response. Files returned by `get_impact()` are sent back as a `highlight_nodes` array — the 3D graph immediately lights those nodes up in purple, showing you the blast radius visually.

---

### 🌌 Multi-Dimensional Topology Engine

Four ways to look at the same mathematical graph:

| Mode | What It Shows |
|------|---------------|
| **3D Neural Cloud** | Physics-based force simulation — files pull each other based on dependency strength. Heavily connected clusters clump together naturally. |
| **4D Execution Flow** | Top-down directed DAG — shows the logical execution cascade from entry points downward, like tracing a call stack at system scale. |
| **8D Radial Core** | Entry-point files at the centre, dependencies fanning outward in orbital rings. Useful for seeing which modules are "core" vs "peripheral". |
| **2D Flowchart** | Flat orthogonal layout. Easier to read for documentation or screenshots. |

---

### 🎨 v2.0 UI — Cyberpunk Meets IDE

- **True black (#000) background** — not dark grey, actual black, like a proper terminal
- **9 distinct 3D node shapes per file type** — Python → Sphere, JS → Octahedron, TypeScript → Cube, Go → Tetrahedron, HTML → Cone, CSS → Torus, JSON/YAML → Icosahedron, Markdown → Dodecahedron, Dead code → hollow wireframe
- **Bottleneck nodes** get a pulsing orbital ring. You can see danger at a glance.
- **6 swappable accent colours** (Cyan, Violet, Emerald, Rose, Amber, Indigo) — saved to localStorage
- **Full light/dark mode** via `data-theme` on the HTML element — no flicker, no hacks
- **SpriteText labels** float above every node, scaling dynamically with camera zoom
- **Click any node** → IDE panel slides up from the bottom showing raw source code in JetBrains Mono

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         INGESTION LAYER                            │
│   GitFetcher (shallow clone) │ LocalFSAdapter │ POSIX normalizer  │
│   Ignores: node_modules, venv, .git                               │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                          PARSING LAYER                             │
│   tree-sitter-python → AST (classes, functions, calls)            │
│   Regex heuristics → JS / TS / Go imports & fetch patterns        │
│   UniversalASTExtractor → FileAST models + API endpoint registry  │
└──────────────┬─────────────────────────────────────────────────────┘
               │
┌──────────────▼─────────────────────────────────────────────────────┐
│                        GRAPH MATH LAYER                            │
│   NetworkX DiGraph │ Fuzzy suffix import matching                  │
│   Eigenvector Centrality (max_iter=500) → bottleneck detection     │
│   nx.simple_cycles() → circular dependency detection               │
│   greedy_modularity_communities() → logical cluster grouping       │
│   in_degree == 0 scan → phantom / dead code detection             │
│   System Health Score: 100 - (5 × bottlenecks) - (15 × cycles)   │
└──────────┬──────────────────────────────────┬──────────────────────┘
           │                                  │
┌──────────▼────────────────┐    ┌────────────▼──────────────────────┐
│      VECTOR RAG LAYER     │    │       SEMANTIC FUSION LAYER       │
│  fastembed BAAI/bge-small │    │  Top-5 bottlenecks → Groq LLM    │
│  384-dim local embeddings │    │  JSON role classification         │
│  Qdrant vector upsert     │    │  Executive Report Markdown        │
└──────────┬────────────────┘    └────────────┬──────────────────────┘
           └──────────────┬──────────────────-┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                   HYBRID QUERY ROUTER (ReAct Agent)                │
│   get_impact() │ semantic_search() │ web_search()                  │
│   highlight_nodes[] → returned to frontend                         │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                    v2.0 FRONTEND (React + WebGL)                   │
│   Dashboard │ Topology Graph │ Phantom Audit │ Configuration       │
│   react-force-graph-3d/2d │ Three.js geometries │ SpriteText      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose — for MongoDB (state caching) and Qdrant (vector search)
- Python 3.10+
- Node.js 18+
- API keys from [Groq](https://console.groq.com/) and [Tavily](https://tavily.com/)

### 1. Clone
```bash
git clone https://github.com/NithinAI11/Neural-System-Decompiler.git
cd Neural-System-Decompiler
```

### 2. Start Databases
```bash
docker-compose up -d
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
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
```

```bash
uvicorn src.api.server:app --reload
# API running at http://localhost:8000
```

### 4. Frontend
```bash
cd nsd-frontend
npm install
npm run dev
# UI at http://localhost:5173
```

---

## 💻 Usage Guide

### Scanning a Codebase
Paste a GitHub URL (e.g. `https://github.com/encode/starlette`) or a local absolute path into the sidebar. Click **Decompile System**. The pipeline log streams each stage in real time.

Toggle **Force Re-Analysis** if you want to bypass the MongoDB cache and reprocess from scratch (useful when the repo has been updated).

### Reading the Dashboard
| Card | What It Means |
|------|--------------|
| **Macro Pattern** | Auto-detected architecture style — Microservices, Monolith, Layered, Event-Driven |
| **Micro Clusters** | Number of logical component groups found by the modularity algorithm |
| **Bottlenecks** | Files with highest eigenvector centrality — your highest-risk single points of failure |
| **Phantom Code** | Files with `in_degree == 0` — present in repo but never imported by anything |

### Navigating the 3D Graph
| Action | Control |
|--------|---------|
| Orbit  | Left-click drag |
| Zoom   | Scroll wheel |
| Pan    | Right-click drag |
| Inspect a file | Click any 3D node |
| Switch layout | Top controls bar |

### Agent Console — Queries to Try
```
"What downstream files break if I modify auth_service.py?"
→ Triggers nx.ancestors() reverse traversal → affected nodes light up in 3D

"Where is the code that handles database connections?"
→ Triggers Qdrant cosine similarity search

"Search the web for how FastAPI middleware works and relate it to this project."
→ Triggers Tavily API web search + synthesis
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI, Python 3.10+ |
| Graph Engine | NetworkX (DiGraph, eigenvector centrality, cycles, communities) |
| AST Parsing | tree-sitter-python, regex heuristics for JS/TS/Go |
| LLM | Groq (Llama-3.1-8b-instant) |
| Agent Framework | Native JSON tool-calling — no LangChain |
| Vector DB | Qdrant (runs locally) |
| Embeddings | fastembed, BAAI/bge-small-en-v1.5 (384-dim) |
| State Cache | MongoDB |
| Web Search | Tavily API |
| Frontend | React 18, Vite |
| 3D Rendering | Three.js, react-force-graph-3d |
| 2D Rendering | react-force-graph-2d |
| Typography | Orbitron + JetBrains Mono + Inter |

---

## 🗺️ Roadmap

- [x] Deterministic AST parsing (Python tree-sitter + JS/TS/Go regex)
- [x] NetworkX DAG + eigenvector centrality
- [x] Phantom code detection (in_degree scan)
- [x] Modularity clustering
- [x] Qdrant vector RAG with local embeddings
- [x] Groq ReAct agent with native tool-calling
- [x] 3D / 4D / 8D / 2D topology renderer
- [x] Polyglot API edge linker (cross-language mapping)
- [x] Phantom Audit dedicated page + system health score
- [x] Cyberpunk v2.0 UI with accent colour system + light/dark mode
- [ ] Temporal Diff — compare graph centrality across Git commits over time
- [ ] Change Impact Predictor — visualise blast radius directly in the 3D graph
- [ ] Anomaly Detector — ML clustering on centrality distributions
- [ ] Automated Refactoring — agent-generated PRs to untangle circular dependencies
- [ ] Cross-Repo Pattern Mining — compare architectural patterns across multiple repos

---

## 👤 Author

**Nithin** · AI/LLM Engineer · Chennai, India

Building research tools at the intersection of graph theory, static analysis, and agentic AI — specifically exploring how much we can compute *before* involving a language model.

[![GitHub](https://img.shields.io/badge/GitHub-NithinAI11-181717?style=for-the-badge&logo=github)](https://github.com/NithinAI11)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

*Built to explore a question, not to ship a product — for now.*

</div>