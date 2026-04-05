# ===== File: backend/src/query/traverser.py =====
import networkx as nx
from typing import Dict, Optional

class GraphTraverser:
    """Explores the network graph to find real-world impacts."""
    
    def __init__(self, graph: nx.DiGraph):
        self.graph = graph

    def fuzzy_find_node(self, query_target: str) -> Optional[str]:
        """Intelligently matches 'random.py' to 'src/utils/random.py'"""
        query_target = query_target.lower().strip()
        
        # Exact match
        if query_target in self.graph:
            return query_target
            
        # Partial match (e.g. filename only)
        for node in self.graph.nodes:
            if node.lower().endswith(query_target):
                return node
            if query_target in node.lower():
                return node
                
        return None

    def get_change_impact(self, target_node: str) -> Dict:
        # Agentic resolution
        resolved_node = self.fuzzy_find_node(target_node)
        
        if not resolved_node:
            return {"error": f"Could not find any file matching '{target_node}' in the system graph."}

        # Find all nodes that eventually call or import the target_node
        impacted_nodes = list(nx.ancestors(self.graph, resolved_node))
        
        risk_level = "LOW"
        if len(impacted_nodes) > 10:
            risk_level = "CRITICAL"
        elif len(impacted_nodes) > 3:
            risk_level = "HIGH"

        return {
            "target": resolved_node,
            "impacted_count": len(impacted_nodes),
            "impacted_modules": impacted_nodes,
            "risk_level": risk_level
        }