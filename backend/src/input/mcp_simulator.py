# ===== File: backend/src/input/mcp_simulator.py =====
import os
import logging
from typing import List, Dict
from src.config import IGNORED_DIRS, IGNORED_FILES

logger = logging.getLogger("MCP_FS_Adapter")

class LocalFSAdapter:
    """Simulates an MCP Read-Only interface for local directories."""
    
    def __init__(self, root_path: str):
        self.root_path = os.path.abspath(root_path)
        if not os.path.exists(self.root_path):
            raise FileNotFoundError(f"Source path {self.root_path} not found.")

    def fetch_all_code(self) -> List[Dict[str, str]]:
        """Scrapes repo securely, returning SSOT raw files with normalized POSIX paths."""
        files_data =[]
        for root, dirs, files in os.walk(self.root_path):
            # Prune ignored directories IN PLACE
            dirs[:] =[d for d in dirs if d not in IGNORED_DIRS]
            
            for file in files:
                if file in IGNORED_FILES:
                    continue
                
                # Allow major file types to be viewed in the UI popup
                if not file.endswith(('.py', '.js', '.ts', '.go', '.md', '.json', '.yml', '.yaml', '.txt', '.html', '.css', '.sh')):
                    continue
                
                file_path = os.path.join(root, file)
                
                # CRITICAL FIX: Normalize paths to use forward slashes (POSIX) 
                # so Windows '\' doesn't break Graph mapping!
                rel_path = os.path.relpath(file_path, self.root_path).replace("\\", "/")
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        files_data.append({
                            "path": rel_path,
                            "content": f.read()
                        })
                except Exception as e:
                    logger.warning(f"Failed to read {file_path}: {e}")
                    
        return files_data