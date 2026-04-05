# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\semantic\agent_tools.py
from tavily import TavilyClient
from src.config import TAVILY_API_KEY

tavily = TavilyClient(api_key=TAVILY_API_KEY)

def tool_search_external_dependency(query: str) -> str:
    """Useful when the system finds an external package import it doesn't recognize."""
    try:
        response = tavily.search(query=f"What is the programming library: {query} used for?", search_depth="basic")
        return response['results'][0]['content']
    except Exception as e:
        return f"Search failed: {str(e)}"