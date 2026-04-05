# ===== File: backend/src/semantic/rag_manager.py =====
from src.config import DBManager
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
import uuid
import logging

logger = logging.getLogger("NSD_RAG")

class VectorRAGManager:
    def __init__(self, collection_name="nsd_ast_vectors"):
        self.qdrant = DBManager.get_qdrant()
        self.collection_name = collection_name
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        
        # Ensure collection exists
        if not self.qdrant.collection_exists(self.collection_name):
            self.qdrant.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )

    def ingest_codebase(self, target_id: str, content_map: dict):
        """Embeds raw source code into Qdrant for semantic searching."""
        print(f"🧠 [RAG] Vectorizing {len(content_map)} files for semantic search...")
        points =[]
        for file_path, content in content_map.items():
            if not content: continue
            
            # We take the first 2000 chars of a file to capture its essence (Class names, main functions, docstrings)
            chunk = content[:2000]
            text_repr = f"File: {file_path}\nCode:\n{chunk}"
            
            # Generate Embeddings locally (Free, no API limits)
            vector = list(self.embedding_model.embed([text_repr]))[0]
            
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=vector.tolist(),
                payload={"file_path": file_path, "target_id": target_id}
            ))
        
        if points:
            self.qdrant.upsert(collection_name=self.collection_name, points=points)
            print("🟢 [RAG] Codebase vectorization complete.")

    def search(self, query: str, limit: int = 3) -> list:
        """Finds the most semantically relevant files to a user's question."""
        vector = list(self.embedding_model.embed([query]))[0]
        results = self.qdrant.search(
            collection_name=self.collection_name, 
            query_vector=vector.tolist(),
            limit=limit
        )
        return[doc.payload["file_path"] for doc in results]