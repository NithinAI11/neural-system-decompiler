# ===== File: backend/src/parsing/models.py =====
from pydantic import BaseModel, Field
from typing import List, Optional

class FunctionDef(BaseModel):
    name: str
    start_line: int
    end_line: int
    calls: List[str] =[]

class ClassDef(BaseModel):
    name: str
    methods: List[FunctionDef] =[]

class FileAST(BaseModel):
    """The strict deterministic output of a parsed file."""
    file_path: str
    imports: List[str] =[]
    classes: List[ClassDef] = []
    functions: List[FunctionDef] =[]
    api_calls: List[str] = []       # NEW: Frontend fetch/axios routes
    api_endpoints: List[str] = []   # NEW: Backend route definitions
    raw_content: Optional[str] = Field(None, exclude=True)