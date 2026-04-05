# ===== File: backend/src/query/hybrid_router.py =====
from src.query.traverser import GraphTraverser
from src.semantic.rag_manager import VectorRAGManager
from src.semantic.groq_client import ResilientGroqEngine
from tavily import TavilyClient
import os
import json
import networkx as nx
from groq import Groq

class HybridQueryRouter:
    """
    Advanced Agentic Router v2.1.
    Features: Hallucination protection, Tool-state injection, and ReAct loops.
    """
    
    def __init__(self, current_graph: nx.DiGraph):
        self.traverser = GraphTraverser(current_graph)
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        
        # Load the RAG manager if available
        self.rag_enabled = False
        try:
            self.rag = VectorRAGManager()
            self.rag_enabled = True
        except Exception:
            print("⚠️ [WARNING] Qdrant offline. RAG search disabled.")

    def _tool_get_system_intelligence(self) -> str:
        """Tool: Retrieves the high-level math insights (Dead Code, Bottlenecks, etc.)"""
        # Import inside to avoid circular dependencies
        from src.api.server import fused_intelligence_cache
        if not fused_intelligence_cache:
            return "No system intelligence available. The system has not been compiled."
        
        intel = fused_intelligence_cache.get('intelligence', {})
        # We strip the data to essential facts for the LLM context
        summary = {
            "macro_architecture": intel.get("macro_architecture", {}).get("pattern", "Unknown"),
            "dead_files_count": len(intel.get("dead_code", [])),
            "dead_files_sample": intel.get("dead_code", [])[:15],
            "top_bottlenecks": [b[0] for b in intel.get("bottlenecks", [])]
        }
        return json.dumps(summary)

    def _tool_get_impact(self, filename: str) -> str:
        """Tool: Calculates the mathematical blast radius of modifying a specific file."""
        data = self.traverser.get_change_impact(filename)
        return json.dumps(data) if "error" not in data else data["error"]

    def _tool_semantic_search(self, query: str) -> str:
        """Tool: Searches the codebase for specific business logic using Vector RAG."""
        if not self.rag_enabled: return "Semantic Vector Search is currently unavailable."
        relevant_files = self.rag.search(query, limit=5)
        return f"Logic potentially found in these files: {relevant_files}"

    def _tool_web_search(self, query: str) -> str:
        """Tool: Searches the internet for external documentation (Tavily)."""
        try:
            res = self.tavily.search(query=query, search_depth="basic")
            return "\n".join([r['content'] for r in res['results']])
        except Exception as e:
            return f"Web search failed: {str(e)}"

    def route_query(self, question: str) -> dict:
        """The Autonomous Agent Loop with Strict Tool Validation."""
        
        # Define the exact tool schema for Groq
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_system_intelligence",
                    "description": "Use this FIRST for any questions about system health, dead files, architecture patterns, or general bottlenecks."
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_impact",
                    "description": "Calculates downstream dependencies and risks of modifying/deleting a specific file.",
                    "parameters": {
                        "type": "object", 
                        "properties": {"filename": {"type": "string", "description": "The name or path of the file"}},
                        "required": ["filename"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "semantic_search",
                    "description": "Finds where specific logic (like 'auth' or 'parsing') exists in the code.",
                    "parameters": {
                        "type": "object", 
                        "properties": {"query": {"type": "string"}},
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Search the internet for external library documentation.",
                    "parameters": {
                        "type": "object", 
                        "properties": {"query": {"type": "string"}},
                        "required": ["query"]
                    }
                }
            }
        ]

        messages = [
            {
                "role": "system", 
                "content": """You are the NSD Senior Architect Engine. 
                You act as a decisive analytical system. You have access to the mathematical graph of this software.
                
                STRICT GUIDELINES:
                1. NEVER tell the user to 'run a command', 'use git', or 'install a library'. You are the engine; YOU provide the answer.
                2. If the user asks about 'dead code', 'phantom files', or 'bottlenecks', you MUST call 'get_system_intelligence'.
                3. If the user asks 'what breaks' or 'impact', you MUST call 'get_impact'.
                4. Do not invent tools. Only use the ones provided.
                5. Output your final answer in clean, professional Markdown."""
            },
            {"role": "user", "content": question}
        ]

        # STEP 1: INITIAL INFERENCE
        response = self.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls
        highlight_nodes = []

        # STEP 2: TOOL EXECUTION LOOP
        if tool_calls:
            messages.append(response_message)
            for tool_call in tool_calls:
                func_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)
                
                # Execute mapped tools
                if func_name == "get_system_intelligence":
                    result = self._tool_get_system_intelligence()
                elif func_name == "get_impact":
                    result = self._tool_get_impact(args.get("filename"))
                    try:
                        res_json = json.loads(result)
                        if "impacted_modules" in res_json:
                            highlight_nodes.extend(res_json["impacted_modules"] + [res_json["target"]])
                    except: pass
                elif func_name == "semantic_search":
                    result = self._tool_semantic_search(args.get("query"))
                    # Highlight files found in RAG
                    try:
                        # Extract paths from string like "Logic... in these files: ['path1', 'path2']"
                        paths = eval(result.split(": ")[1])
                        highlight_nodes.extend(paths)
                    except: pass
                elif func_name == "web_search":
                    result = self._tool_web_search(args.get("query"))
                else:
                    result = f"Error: Tool '{func_name}' does not exist."

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": func_name,
                    "content": result
                })

            # STEP 3: FINAL SYNTHESIS
            final_response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages
            )
            return {"answer": final_response.choices[0].message.content, "highlight_nodes": list(set(highlight_nodes))}

        # Fallback if no tool was called
        return {"answer": response_message.content, "highlight_nodes": []}