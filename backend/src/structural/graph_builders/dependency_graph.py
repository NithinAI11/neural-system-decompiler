# ===== File: backend/src/structural/graph_builders/dependency_graph.py =====
import networkx as nx
from typing import List, Dict

class GraphBuilder:
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_from_ast_list(self, ast_results: List[Dict]) -> nx.DiGraph:
        """Constructs a Directed Graph bridging imports and polyglot API endpoints."""
        internal_files = {ast["file_path"] for ast in ast_results}
        
        # Registry for Polyglot API Linker
        # Maps endpoint_path -> list of backend file_paths that serve it
        api_registry = {}
        for ast in ast_results:
            for endpoint in ast.get("api_endpoints", []):
                api_registry[endpoint] = ast["file_path"]

        for ast in ast_results:
            file_node = ast["file_path"]
            self.graph.add_node(file_node, type="file")

            # 1. Map standard file dependencies (Python & JS)
            for imp in ast.get("imports",[]):
                possible_target_name = imp.split()[-1].replace("'", "").replace('"', '')
                
                # Match exact filename endings (e.g., matching 'auth' to 'src/utils/auth.js')
                matched_internal_file = None
                for internal_file in internal_files:
                    if internal_file.endswith(f"{possible_target_name}.py") or internal_file.endswith(f"{possible_target_name}.js") or internal_file.endswith(f"{possible_target_name}.ts"):
                        matched_internal_file = internal_file
                        break
                
                if matched_internal_file:
                    self.graph.add_edge(file_node, matched_internal_file, relation="imports")

            # 2. Map Cross-Language API Calls (Frontend -> Backend)
            for api_call in ast.get("api_calls",[]):
                # If a frontend file calls an API that our backend serves, link them!
                if api_call in api_registry:
                    backend_handler_file = api_registry[api_call]
                    self.graph.add_edge(file_node, backend_handler_file, relation="api_route")

        return self.graph