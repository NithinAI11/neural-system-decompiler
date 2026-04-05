# ===== File: backend/src/parsing/ast_extractors/python_parser.py =====
import tree_sitter_python as tspython
from tree_sitter import Language, Parser, Node
from typing import List
from src.parsing.models import FileAST, ClassDef, FunctionDef

class PythonASTExtractor:
    """Deterministic AST Parser with Universal File fallback."""
    
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
        # UNIVERSAL FILE FIX: If it's not Python, just return the empty AST shell.
        # This ensures the file appears in the Graph and the UI can read its code, 
        # even if we don't have its deep AST math.
        if not file_path.endswith('.py'):
            return FileAST(file_path=file_path)

        tree = self.parser.parse(code_bytes)
        root_node = tree.root_node
        ast_model = FileAST(file_path=file_path)

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