# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\semantic\summarizers\module_summarizer.py
from src.semantic.groq_client import ResilientGroqEngine
from src.parsing.models import FileAST

class ModuleSummarizer:
    def __init__(self):
        self.llm = ResilientGroqEngine()

    def summarize(self, ast: FileAST) -> str:
        prompt = f"""
        Provide a strict 2-sentence summary of what this code file does based on its structure.
        Do not mention "This file contains...". Just state the purpose.
        
        File Path: {ast.file_path}
        Classes: {[c.name for c in ast.classes]}
        Functions: {[f.name for f in ast.functions]}
        """
        try:
            return self.llm.generate_with_fallback(prompt, system_prompt="You are a concise technical writer.")
        except Exception:
            return "Summary generation failed."