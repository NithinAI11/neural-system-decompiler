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
        """The Autonomous Agent Loop (Think -> Act -> Observe -> Answer)"""
        
        # Define Tools for the LLM
        tools =[
            {
                "type": "function",
                "function": {
                    "name": "get_impact",
                    "description": "Calculates downstream dependencies and risk of modifying or deleting a file.",
                    "parameters": {"type": "object", "properties": {"filename": {"type": "string"}}, "required": ["filename"]}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "semantic_search",
                    "description": "Searches the project codebase to find where specific business logic is implemented.",
                    "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Searches the internet for documentation about external libraries, frameworks, or errors not found in the codebase.",
                    "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
                }
            }
        ]

        messages =[
            {"role": "system", "content": "You are an elite, autonomous System Architect. You have tools to calculate math graphs, search vectors, and browse the web. Use them to answer the user's question accurately. Format your final answer beautifully in Markdown."},
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