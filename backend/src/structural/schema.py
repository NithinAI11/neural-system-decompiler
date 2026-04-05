# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\structural\schema.py
from pydantic import BaseModel
from typing import List, Dict, Optional

class GraphNode(BaseModel):
    id: str  # e.g., "src/main.py"
    type: str  # "file", "function", "class"
    semantic_role: Optional[str] = None  # Filled by AI later (e.g., "API_LAYER")
    summary: Optional[str] = None        # Filled by AI later
    centrality_score: float = 0.0        # Filled by Math later

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str  # "imports", "calls", "contains"

class SystemGraph(BaseModel):
    nodes: Dict[str, GraphNode]
    edges: List[GraphEdge]