# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\semantic\classifiers\module_classifier.py
import json
from src.semantic.groq_client import ResilientGroqEngine
from src.parsing.models import FileAST

class ModuleClassifier:
    def __init__(self):
        self.llm = ResilientGroqEngine()
        
    def classify_module(self, ast: FileAST) -> dict:
        """Determines the architectural role of a file (e.g., Auth, DB, API, Helper)."""
        
        prompt = f"""
        Analyze this file's structure. Do not hallucinate. 
        File: {ast.file_path}
        Classes: {[c.name for c in ast.classes]}
        Functions: {[f.name for f in ast.functions]}
        Imports: {ast.imports}
        
        Return ONLY a JSON object:
        {{
            "role": "one of[API, Database, Authentication, Utility, BusinessLogic, Config, UI, Unknown]",
            "confidence": 0-100,
            "brief_reason": "1 sentence why"
        }}
        """
        
        try:
            # Force JSON output via the prompt
            response = self.llm.generate_with_fallback(
                prompt=prompt, 
                system_prompt="You are an expert software architect. Output ONLY valid JSON."
            )
            # Clean potential markdown wrappers
            clean_json = response.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json)
        except Exception as e:
            return {"role": "Unknown", "confidence": 0, "brief_reason": "Failed to parse AI output."}