# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\graph_intel\cycle_detector.py
import networkx as nx

class CycleDetector:
    @staticmethod
    def detect(graph: nx.DiGraph) -> list:
        """Finds circular dependencies (A imports B, B imports A) -> Bad Architecture."""
        try:
            return list(nx.simple_cycles(graph))
        except nx.NetworkXNoCycle:
            return[]