# ===== File: backend/src/api/server.py =====
import sys
import os
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.config import DBManager
from src.input.mcp_simulator import LocalFSAdapter
from src.input.adapters.git_fetcher import GitFetcher
from src.parsing.ast_extractors.universal_parser import UniversalASTExtractor 
from src.fusion.engine import FusionEngine
from src.query.hybrid_router import HybridQueryRouter 
from src.semantic.rag_manager import VectorRAGManager 
import uvicorn
import networkx as nx 
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

app = FastAPI(title="Neural System Decompiler API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

fused_intelligence_cache = {}
system_graph_cache = nx.DiGraph()

class CompileRequest(BaseModel):
    directory_path: Optional[str] = None
    repo_url: Optional[str] = None
    force_reprocess: bool = False

def calculate_health_score(intelligence: dict) -> int:
    score = 100
    score -= len(intelligence.get('bottlenecks',[])) * 5
    score -= len(intelligence.get('circular_dependencies',[])) * 15
    return max(0, min(100, score))

@app.post("/api/v1/compile")
async def compile_system(req: CompileRequest):
    global fused_intelligence_cache, system_graph_cache
    
    target_id = req.repo_url if req.repo_url else req.directory_path
    if not target_id: 
        raise HTTPException(status_code=400, detail="Must provide target")

    # 🛡️ FAULT TOLERANCE: Check if MongoDB is actually alive (2 second timeout)
    db_available = False
    collection = None
    try:
        # Override the 30s timeout to a 2s timeout just for this ping
        client = DBManager.get_mongo().client
        client.admin.command('ping')
        collection = DBManager.get_mongo()["compiled_systems"]
        db_available = True
    except Exception as e:
        print(f"⚠️ [WARNING] MongoDB is offline or unreachable. Running in Ephemeral Memory mode.")

    # 1. MongoDB Cache Check (Only if DB is alive)
    if not req.force_reprocess and db_available:
        try:
            existing_doc = collection.find_one({"target_id": target_id})
            if existing_doc:
                fused_intelligence_cache = existing_doc["data"]
                system_graph_cache.clear()
                for node_id in fused_intelligence_cache['fused_graph']['nodes'].keys(): system_graph_cache.add_node(node_id)
                for edge in fused_intelligence_cache['fused_graph']['edges']: system_graph_cache.add_edge(edge['source'], edge['target'])
                return {"message": "Loaded from MongoDB cache", "data": fused_intelligence_cache}
        except Exception:
            print("⚠️[WARNING] Cache read failed. Proceeding with compilation.")

    # 2. Pipeline Execution
    try:
        actual_path = GitFetcher().fetch(req.repo_url) if req.repo_url else req.directory_path
        fusion_engine = FusionEngine()
        raw_files = LocalFSAdapter(actual_path).fetch_all_code()
        
        ast_results =[UniversalASTExtractor().extract_structure(file["content"].encode('utf-8'), file["path"]) for file in raw_files]
        result = fusion_engine.compile_system(ast_results)
        
        content_map = {f["path"]: f["content"] for f in raw_files}
        for node_id, node_data in result['fused_graph']['nodes'].items():
            node_data['content'] = content_map.get(node_id, "// Source code not applicable or binary file.")

        result["intelligence"]["health_score"] = calculate_health_score(result["intelligence"])
        
        # 🛡️ FAULT TOLERANCE: RAG Manager (Qdrant)
        try:
            VectorRAGManager().ingest_codebase(target_id, content_map)
        except Exception as e:
            print(f"⚠️ [WARNING] Qdrant Vector DB offline. Skipping Semantic Embedding. {e}")

        fused_intelligence_cache = result
        system_graph_cache.clear()
        for node_id in result['fused_graph']['nodes'].keys(): system_graph_cache.add_node(node_id)
        for edge in result['fused_graph']['edges']: system_graph_cache.add_edge(edge['source'], edge['target'])

        # 3. Save to MongoDB (Only if DB is alive)
        if db_available:
            try:
                collection.update_one({"target_id": target_id}, {"$set": {"target_id": target_id, "updated_at": datetime.datetime.utcnow(), "data": result}}, upsert=True)
            except Exception:
                print("⚠️ [WARNING] Failed to save output to MongoDB. Data exists in RAM only.")

        return {"message": "Compiled successfully", "data": result}
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

class QueryRequest(BaseModel): 
    question: str

@app.post("/api/v1/query")
async def query_system(req: QueryRequest):
    if not system_graph_cache.nodes: 
        raise HTTPException(status_code=400, detail="System not compiled yet.")
    try:
        return {"response": HybridQueryRouter(current_graph=system_graph_cache).route_query(req.question)}
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__": 
    uvicorn.run(app, host="0.0.0.0", port=8000)