# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\query\langgraph_orchestrator.py
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from src.semantic.groq_client import ResilientGroqEngine # (The file from the previous turn)

class GraphState(TypedDict):
    question: str
    context: str
    requires_approval: bool
    human_approved: bool
    final_answer: str

class NSDOrchestrator:
    def __init__(self):
        self.llm = ResilientGroqEngine()
        
        workflow = StateGraph(GraphState)
        workflow.add_node("analyze_intent", self.analyze_intent)
        workflow.add_node("hitl_approval", self.hitl_approval)
        workflow.add_node("generate_response", self.generate_response)
        
        workflow.set_entry_point("analyze_intent")
        
        # Conditional Edge: If dangerous action detected, go to HITL, else Generate
        workflow.add_conditional_edges(
            "analyze_intent",
            lambda x: "hitl_approval" if x["requires_approval"] else "generate_response"
        )
        workflow.add_edge("hitl_approval", "generate_response")
        workflow.add_edge("generate_response", END)
        
        self.app = workflow.compile()

    def analyze_intent(self, state: GraphState):
        """Checks if the user is asking to modify code or just query it."""
        question = state["question"]
        # Dummy logic for HITL trigger. If user says "write" or "modify", flag it.
        requires_approval = "modify" in question.lower() or "delete" in question.lower()
        return {"requires_approval": requires_approval, "context": "Graph Intel Data Here"}

    def hitl_approval(self, state: GraphState):
        """HUMAN IN THE LOOP WAIT STATE."""
        # In a real app, this pauses and sends a WebSocket event to frontend.
        # For now, we simulate approval.
        print("\n[HITL] SECURITY WARNING: AI wants to modify files. Approve? (Y/N)")
        # state["human_approved"] = input().strip().lower() == 'y'
        return {"human_approved": True} # Auto-approve for demo

    def generate_response(self, state: GraphState):
        if state.get("requires_approval") and not state.get("human_approved"):
            return {"final_answer": "Operation aborted by user."}
            
        prompt = f"Context: {state['context']}\nQuestion: {state['question']}"
        response = self.llm.generate_with_fallback(prompt)
        return {"final_answer": response}