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
    Features: Hallucination protection, Tool-state injection, ReAct loops, and Robust Tool Schema.
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

    def _tool_get_system_intelligence(self, **kwargs) -> str:
        """Tool: Retrieves the high-level math insights (Dead Code, Bottlenecks, etc.)"""
        from src.api.server import fused_intelligence_cache
        if not fused_intelligence_cache:
            return "No system intelligence available. The system has not been compiled."
        
        intel = fused_intelligence_cache.get('intelligence', {})
        # We strip the data to essential facts for the LLM context
        summary = {
            "macro_architecture": intel.get("macro_architecture", {}).get("pattern", "Unknown"),
            "dead_files_count": len(intel.get("dead_code",[])),
            "dead_files_sample": intel.get("dead_code", [])[:15],
            "top_bottlenecks": [b[0] for b in intel.get("bottlenecks",[])]
        }
        return json.dumps(summary)

    def _tool_get_node_details(self, filename: str, **kwargs) -> str:
        """Tool: Explains the architectural role and exact summary of a specific file."""
        from src.api.server import fused_intelligence_cache
        if not fused_intelligence_cache:
            return "System not compiled."
        
        nodes = fused_intelligence_cache.get('fused_graph', {}).get('nodes', {})
        
        # Fuzzy match
        target = filename.lower().strip()
        for k, v in nodes.items():
            if target in k.lower():
                return json.dumps({
                    "file": k,
                    "type": v.get("type"),
                    "role": v.get("semantic_role"),
                    "summary": v.get("summary"),
                    "centrality_score": v.get("centrality_score")
                })
        return f"File '{filename}' not found in the mathematical graph."

    def _tool_get_impact(self, filename: str, **kwargs) -> str:
        """Tool: Calculates the mathematical blast radius of modifying a specific file."""
        data = self.traverser.get_change_impact(filename)
        return json.dumps(data) if "error" not in data else data["error"]

    def _tool_semantic_search(self, query: str, **kwargs) -> str:
        """Tool: Searches the codebase for specific business logic using Vector RAG."""
        if not self.rag_enabled: return "Semantic Vector Search is currently unavailable."
        relevant_files = self.rag.search(query, limit=5)
        return f"Logic potentially found in these files: {relevant_files}"

    def _tool_web_search(self, query: str, **kwargs) -> str:
        """Tool: Searches the internet for external documentation (Tavily)."""
        try:
            res = self.tavily.search(query=query, search_depth="basic")
            return "\n".join([r['content'] for r in res['results']])
        except Exception as e:
            return f"Web search failed: {str(e)}"

    def route_query(self, question: str) -> dict:
        """The Autonomous Agent Loop with Strict Tool Validation."""
        
        tools =[
            {
                "type": "function",
                "function": {
                    "name": "get_system_intelligence",
                    "description": "Retrieves general system health, macro architecture, dead code, and system-wide bottlenecks.",
                    "parameters": {
                        "type": "object", 
                        "properties": {
                            "focus": {"type": "string", "description": "Optional focus area."}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_node_details",
                    "description": "Retrieves the semantic role, summary, and centrality score of a specific file to explain what it does.",
                    "parameters": {
                        "type": "object", 
                        "properties": {"filename": {"type": "string", "description": "The exact name or path of the file"}},
                        "required": ["filename"]
                    }
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
                        "properties": {"query": {"type": "string", "description": "The logic to search for"}},
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
                        "properties": {"query": {"type": "string", "description": "Search query"}},
                        "required": ["query"]
                    }
                }
            }
        ]

        messages =[
            {
                "role": "system", 
                "content": """You are the NSD Senior Architect Engine, an elite AI software architect analyzing a complex codebase. 
You have direct access to mathematical graph structures, eigenvector centrality scores, and vector embeddings of the software.

STRICT GUIDELINES:
1. ZERO CHATBOT FLUFF: NEVER act like a generic AI ("Here is the information...", "I can help with that!"). Start your response immediately with the analysis.
2. ARCHITECTURAL REPORT FORMAT: ALWAYS structure your final answer as a high-level, professional technical report. Use Markdown, clear headings (e.g., `### Architectural Analysis`, `### Risk Assessment`), bullet points, and bold text for emphasis.
3. EXPLAINING FILES: If asked to "explain" a file, MUST use `get_node_details`.
4. IMPACT ANALYSIS: If asked "what breaks" or "impact", MUST use `get_impact`.
5. SYSTEM HEALTH: If asked about "dead code", "phantom files", "architecture", or "bottlenecks", MUST use `get_system_intelligence`.
6. Ground your answers ONLY in the math and data returned by your tools. Synthesize the tool data deeply; don't just echo it."""
            },
            {"role": "user", "content": question}
        ]

        # Upgrade to 70B model for elite architectural reasoning
        MODEL_NAME = "llama-3.3-70b-versatile"

        try:
            # STEP 1: INITIAL INFERENCE
            response = self.groq_client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.1
            )

            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls
            highlight_nodes =[]

            # STEP 2: TOOL EXECUTION LOOP
            if tool_calls:
                messages.append(response_message)
                for tool_call in tool_calls:
                    func_name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    # Execute mapped tools with **args to catch hallucinated properties natively
                    if func_name == "get_system_intelligence":
                        result = self._tool_get_system_intelligence(**args)
                    elif func_name == "get_node_details":
                        result = self._tool_get_node_details(**args)
                        try:
                            res_json = json.loads(result)
                            if "file" in res_json:
                                highlight_nodes.append(res_json["file"])
                        except: pass
                    elif func_name == "get_impact":
                        result = self._tool_get_impact(**args)
                        try:
                            res_json = json.loads(result)
                            if "impacted_modules" in res_json:
                                highlight_nodes.extend(res_json["impacted_modules"] + [res_json["target"]])
                        except: pass
                    elif func_name == "semantic_search":
                        result = self._tool_semantic_search(**args)
                        try:
                            paths = eval(result.split(": ")[1])
                            highlight_nodes.extend(paths)
                        except: pass
                    elif func_name == "web_search":
                        result = self._tool_web_search(**args)
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
                    model=MODEL_NAME,
                    messages=messages,
                    temperature=0.2
                )
                return {"answer": final_response.choices[0].message.content, "highlight_nodes": list(set(highlight_nodes))}

            # Fallback if no tool was called
            return {"answer": response_message.content, "highlight_nodes":[]}
            
        except Exception as e:
            import traceback
            print(f"[HYBRID ROUTER ERROR] {traceback.format_exc()}")
            return {"answer": f"### ⚠️ Engine Fault\nFailed to compute neural response.\n\n`{str(e)}`", "highlight_nodes":[]}