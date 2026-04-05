# ===== File: backend/src/fusion/engine.py =====
from typing import List
from src.parsing.models import FileAST
from src.structural.graph_builders.dependency_graph import GraphBuilder
from src.graph_intel.centrality import CentralityAnalyzer
from src.graph_intel.cycle_detector import CycleDetector
from src.graph_intel.clustering import ClusterAnalyzer
from src.semantic.classifiers.module_classifier import ModuleClassifier
from src.semantic.summarizers.module_summarizer import ModuleSummarizer
from src.semantic.classifiers.architecture_detector import ArchitectureDetector
from src.semantic.groq_client import ResilientGroqEngine
from src.structural.schema import SystemGraph, GraphNode, GraphEdge
import networkx as nx

class FusionEngine:
    def __init__(self):
        self.builder = GraphBuilder()
        self.centrality = CentralityAnalyzer()
        self.cycles = CycleDetector()
        self.clustering = ClusterAnalyzer()
        self.classifier = ModuleClassifier()
        self.summarizer = ModuleSummarizer()
        self.arch_detector = ArchitectureDetector()
        self.llm = ResilientGroqEngine()

    def compile_system(self, ast_list: List[FileAST]) -> dict:
        nx_graph = self.builder.build_from_ast_list([ast.model_dump() for ast in ast_list])
        
        centrality_scores = self.centrality.compute(nx_graph)
        cycles = self.cycles.detect(nx_graph)
        clusters = self.clustering.compute(nx_graph)
        
        LOGIC_EXTS = ('.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.java')
        logic_scores = {node: score for node, score in centrality_scores.items() if str(node).endswith(LOGIC_EXTS)}
        
        bottlenecks = sorted(logic_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        top_bottleneck_names =[b[0] for b in bottlenecks]
        
        # 🔥 THE NEW FEATURE: Phantom / Dead Code Detection
        # Finds files that are NEVER imported by any other file, and are NOT API entry points.
        dead_code_risks =[]
        for node in nx_graph.nodes:
            if str(node).endswith(LOGIC_EXTS):
                if nx_graph.in_degree(node) == 0 and "main" not in str(node):
                    # Check if it has API routes (meaning it's triggered externally)
                    is_api = any(e for u, v, e in nx_graph.edges(node, data=True) if e.get("relation") == "api_route")
                    if not is_api:
                        dead_code_risks.append(node)
        
        system_nodes = {}
        for ast in ast_list:
            node_id = ast.file_path
            score = centrality_scores.get(node_id, 0.0)
            role, summary = "System Component", "Graph structure mapped."

            if node_id in top_bottleneck_names:
                role_data = self.classifier.classify_module(ast)
                summary = self.summarizer.summarize(ast)
                role = role_data.get("role", "Unknown")
            
            is_dead = node_id in dead_code_risks
            system_nodes[node_id] = GraphNode(id=node_id, type="file", semantic_role=role, summary=summary, centrality_score=score)
            if is_dead:
                system_nodes[node_id].semantic_role = "⚠️ ORPHANED / DEAD CODE"
            
        macro_arch = self.arch_detector.detect_pattern(nx_graph.number_of_nodes(), clusters, bottlenecks)

        report_prompt = f"""
        Write a professional Executive Architectural Report in Markdown.
        System Data: Total Files: {len(ast_list)}, Macro Pattern: {macro_arch.get('pattern')}.
        Top 3 Critical Code Bottlenecks: {top_bottleneck_names[:3]}. 
        Phantom Code Detected: {len(dead_code_risks)} files are completely unreferenced.
        
        Format strictly as:
        ### 🏗️ Architectural Overview
        ### ⚠️ System Health & Tech Debt
        ### 💡 Strategic Refactoring Advice
        """
        ai_report = self.llm.generate_with_fallback(report_prompt)

        system_edges =[GraphEdge(source=u, target=v, relation=data.get("relation", "depends_on")) for u, v, data in nx_graph.edges(data=True)]
            
        fused_graph = SystemGraph(nodes=system_nodes, edges=system_edges)
        
        return {
            "status": "compiled",
            "intelligence": {
                "macro_architecture": macro_arch,
                "bottlenecks": bottlenecks,
                "circular_dependencies": cycles,
                "logical_components": clusters,
                "dead_code": dead_code_risks,
                "ai_executive_report": ai_report
            },
            "fused_graph": fused_graph.model_dump()
        }