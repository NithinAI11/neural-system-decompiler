# ===== File: backend/src/query/hybrid_router.py =====
from src.query.traverser import GraphTraverser
from src.semantic.rag_manager import VectorRAGManager
from tavily import TavilyClient
import os
import json
import networkx as nx
from groq import Groq

class HybridQueryRouter:
    """Agentic LangGraph-style Router using Native Groq Tool Calling."""
    
    def __init__(self, current_graph: nx.DiGraph):
        self.traverser = GraphTraverser(current_graph)
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        
        self.rag_enabled = False
        try:
            self.rag = VectorRAGManager()
            self.rag_enabled = True
        except Exception:
            print("⚠️[WARNING] Qdrant offline. RAG disabled.")

    def _tool_get_impact(self, filename: str) -> str:
        """Tool: Calculates the blast radius of modifying a file."""
        data = self.traverser.get_change_impact(filename)
        return json.dumps(data) if "error" not in data else data["error"]

    def _tool_semantic_search(self, query: str) -> str:
        """Tool: Finds logic in the codebase using Vector embeddings."""
        if not self.rag_enabled: return "RAG Vector DB is offline."
        files = self.rag.search(query, limit=4)
        return f"Logic found in files: {files}"

    def _tool_web_search(self, query: str) -> str:
        """Tool: Searches the internet for external documentation or libraries."""
        try:
            res = self.tavily.search(query=query, search_depth="basic")
            return "\n".join([r['content'] for r in res['results']])
        except Exception as e:
            return f"Web search failed: {str(e)}"

    def route_query(self, question: str) -> dict:
        """The STRICT Autonomous Agent Loop"""
        
        # Capture the current system intelligence to feed the agent
        # This tells the agent about the 455 dead files and bottlenecks BEFORE it thinks.
        from src.api.server import fused_intelligence_cache
        intel_summary = ""
        if fused_intelligence_cache:
            intel = fused_intelligence_cache.get('intelligence', {})
            intel_summary = f"""
            CURRENT SYSTEM TRUTH (MATH COMPUTED):
            - Macro Pattern: {intel.get('macro_architecture', {}).get('pattern')}
            - Dead/Phantom Files: {intel.get('dead_code', [])[:10]} (Total: {len(intel.get('dead_code', []))})
            - Bottlenecks: {[b[0] for b in intel.get('bottlenecks', [])]}
            """

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_impact",
                    "description": "REQUIRED for 'what breaks' questions. Returns mathematical blast radius.",
                    "parameters": {"type": "object", "properties": {"filename": {"type": "string"}}, "required": ["filename"]}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "semantic_search",
                    "description": "REQUIRED for 'where is logic' questions. Uses Vector RAG.",
                    "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
                }
            }
        ]

        messages = [
            {
                "role": "system", 
                "content": f"""You are the NSD Senior Architect Engine. 
                {intel_summary}
                
                RULES:
                1. NEVER tell the user to 'run a command' or 'install a library'.
                2. If the user asks for dead files, use the 'DEAD/PHANTOM FILES' list provided above.
                3. If the user asks 'what breaks', you MUST call 'get_impact'.
                4. If the user asks 'where is logic', you MUST call 'semantic_search'.
                5. Be brief, technical, and decisive. No conversational fluff."""
            },
            {"role": "user", "content": question}
        ]

        # STEP 1: Let the AI decide if it needs a tool
        response = self.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            tools=tools,
            tool_choice="auto",
            max_tokens=4096
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        highlight_nodes =[]

        # STEP 2: Execute the Tools
        if tool_calls:
            messages.append(response_message)
            for tool_call in tool_calls:
                func_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)
                
                if func_name == "get_impact":
                    result = self._tool_get_impact(args.get("filename"))
                    try:
                        parsed = json.loads(result)
                        if "target" in parsed: highlight_nodes.extend(parsed["impacted_modules"] + [parsed["target"]])
                    except: pass
                
                elif func_name == "semantic_search":
                    result = self._tool_semantic_search(args.get("query"))
                    try:
                        highlight_nodes.extend(eval(result.split("files: ")[1]))
                    except: pass
                
                elif func_name == "web_search":
                    result = self._tool_web_search(args.get("query"))
                else:
                    result = "Unknown tool."

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": func_name,
                    "content": result
                })

            # STEP 3: Generate Final Answer based on Tool output
            final_response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                max_tokens=4096
            )
            return {"answer": final_response.choices[0].message.content, "highlight_nodes": highlight_nodes}

        # If no tools were needed
        return {"answer": response_message.content, "highlight_nodes":[]}