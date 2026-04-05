# ===== File: backend/src/parsing/ast_extractors/universal_parser.py =====
import re
import tree_sitter_python as tspython
from tree_sitter import Language, Parser, Node
from typing import List
from src.parsing.models import FileAST, ClassDef, FunctionDef

class UniversalASTExtractor:
    """Polyglot Parser: Tree-Sitter for Python, Regex for JS/TS/Go cross-linking."""
    
    def __init__(self):
        self.PY_LANGUAGE = Language(tspython.language())
        self.parser = Parser(self.PY_LANGUAGE)

    def _extract_calls(self, node: Node, code_bytes: bytes) -> List[str]:
        calls =[]
        if node.type == 'call':
            func_node = node.child_by_field_name('function')
            if func_node:
                calls.append(code_bytes[func_node.start_byte:func_node.end_byte].decode('utf-8'))
        for child in node.children:
            calls.extend(self._extract_calls(child, code_bytes))
        return list(set(calls))

    def extract_structure(self, code_bytes: bytes, file_path: str) -> FileAST:
        ast_model = FileAST(file_path=file_path)
        content_str = code_bytes.decode('utf-8', errors='ignore')

        # 1. EXTRACT API ROUTES (The "Insane" Polyglot Feature)
        # Frontend JS/TS making requests
        if file_path.endswith(('.js', '.jsx', '.ts', '.tsx')):
            api_calls = re.findall(r'(?:axios|fetch)\.?(?:get|post|put|delete|patch)?\s*\(\s*[\'"]([^\'"]+)[\'"]', content_str)
            ast_model.api_calls.extend(api_calls)
            
            # Extract JS/TS imports for dependency graph
            imports = re.findall(r'(?:import|require)\s*\(?[\'"]([^\'"]+)[\'"]\)?', content_str)
            ast_model.imports.extend(imports)

        # Backend Python exposing endpoints
        if file_path.endswith('.py'):
            api_endpoints = re.findall(r'@(?:app|router)\.(?:get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', content_str)
            ast_model.api_endpoints.extend(api_endpoints)

        # 2. DEEP PYTHON AST PARSING
        if file_path.endswith('.py'):
            tree = self.parser.parse(code_bytes)
            root_node = tree.root_node
            
            for child in root_node.children:
                if child.type in ('import_statement', 'import_from_statement'):
                    ast_model.imports.append(code_bytes[child.start_byte:child.end_byte].decode('utf-8'))
                
                elif child.type == 'class_definition':
                    name_node = child.child_by_field_name('name')
                    if name_node:
                        class_name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf-8')
                        class_def = ClassDef(name=class_name)
                        body_node = child.child_by_field_name('body')
                        if body_node:
                            for body_child in body_node.children:
                                if body_child.type == 'function_definition':
                                    method_name_node = body_child.child_by_field_name('name')
                                    if method_name_node:
                                        method_name = code_bytes[method_name_node.start_byte:method_name_node.end_byte].decode('utf-8')
                                        func_def = FunctionDef(name=method_name, start_line=body_child.start_point[0], end_line=body_child.end_point[0], calls=self._extract_calls(body_child, code_bytes))
                                        class_def.methods.append(func_def)
                        ast_model.classes.append(class_def)

                elif child.type == 'function_definition':
                    name_node = child.child_by_field_name('name')
                    if name_node:
                        func_name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf-8')
                        func_def = FunctionDef(name=func_name, start_line=child.start_point[0], end_line=child.end_point[0], calls=self._extract_calls(child, code_bytes))
                        ast_model.functions.append(func_def)
                        
        return ast_model