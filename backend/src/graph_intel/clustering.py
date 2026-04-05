# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\graph_intel\clustering.py
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities

class ClusterAnalyzer:
    @staticmethod
    def compute(graph: nx.DiGraph) -> list:
        """Groups files into logical components (Microservices/Modules) using Math."""
        undirected_graph = graph.to_undirected()
        try:
            communities = greedy_modularity_communities(undirected_graph)
            return [list(c) for c in communities]
        except Exception:
            return[]