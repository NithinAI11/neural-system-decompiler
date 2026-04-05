# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\parsing\dep_resolvers\resolver.py
import os
from typing import List
from src.parsing.models import FileAST

class DependencyResolver:
    """Maps raw string imports to actual physical files in the graph."""
    
    def __init__(self, root_path: str):
        self.root_path = root_path

    def resolve(self, ast_list: List[FileAST]) -> dict:
        """Returns a map of {file_path: [resolved_dependency_paths]}"""
        # Create a lookup table of all known files
        known_files = {ast.file_path for ast in ast_list}
        resolved_deps = {}

        for ast in ast_list:
            deps =[]
            for imp in ast.imports:
                # Basic python import resolution (e.g. 'from src.utils import X' -> 'src/utils.py' or 'src/utils/__init__.py')
                module_path = imp.replace(".", "/") + ".py"
                
                # Check if it's an internal project dependency
                if module_path in known_files:
                    deps.append(module_path)
                else:
                    # Flag as external (e.g., 'fastapi', 'os')
                    deps.append(f"EXTERNAL::{imp}")
            
            resolved_deps[ast.file_path] = deps
            
        return resolved_deps