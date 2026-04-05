# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\graph_intel\centrality.py
import networkx as nx

class CentralityAnalyzer:
    @staticmethod
    def compute(graph: nx.DiGraph) -> dict:
        """Calculates Eigenvector or Degree Centrality to find God Objects."""
        try:
            # Eigenvector identifies nodes that are connected to other highly connected nodes
            scores = nx.eigenvector_centrality(graph, max_iter=500)
        except:
            # Fallback to simple degree if matrix doesn't converge
            scores = nx.degree_centrality(graph)
        return scores