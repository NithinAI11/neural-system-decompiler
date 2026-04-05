# ===== File: backend/src/semantic/classifiers/architecture_detector.py =====
import json
import re
from src.semantic.groq_client import ResilientGroqEngine

class ArchitectureDetector:
    def __init__(self):
        self.llm = ResilientGroqEngine()

    def detect_pattern(self, total_nodes: int, clusters: list, bottlenecks: list) -> dict:
        """Determines if the system is a Monolith, Microservices, Event-Driven, etc."""
        
        # Format the top bottlenecks to be readable
        bottleneck_names = [b[0] for b in bottlenecks]
        
        prompt = f"""
        Analyze this software system's mathematical topology:
        Total Internal Files: {total_nodes}
        Logical Component Clusters Detected: {len(clusters)}
        Core Bottlenecks (Highest Eigenvector Centrality): {bottleneck_names}
        
        Based on this shape, is the architecture a Monolith, Microservices, Layered, Hub-and-Spoke, or Spaghetti?
        Return ONLY valid JSON. No conversational text.
        {{"pattern": "Name of pattern", "reason": "1 sentence why"}}
        """
        try:
            response = self.llm.generate_with_fallback(prompt, system_prompt="You are a strict JSON output bot. Output ONLY valid JSON data.")
            
            # Robust JSON extraction using regex to strip out LLM conversational filler
            json_match = re.search(r'\{.*\}', response.replace('\n', ''), re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            else:
                return json.loads(response)
                
        except Exception as e:
            return {"pattern": "Complex/Hybrid", "reason": f"System shape is highly customized. {str(e)}"}