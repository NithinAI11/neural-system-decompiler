# C:\Nithin\AI-Projects\Neural-System-Decompiler\scripts\stress_tester.py
import os
import sys
import time
import shutil
import traceback

# --- EFFICIENT PATHING FIX ---
# This adds the 'backend' directory to the Python path from the 'scripts' folder at RUNTIME
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

# --- PYLANCE IDE FIX ---
# We use `# type: ignore` to tell the VS Code static analyzer to stop complaining,
# because it cannot see the dynamic runtime path injection we just did above.
from src.input.mcp_simulator import LocalFSAdapter  # type: ignore
from src.parsing.ast_extractors.python_parser import PythonASTExtractor  # type: ignore
from src.fusion.engine import FusionEngine  # type: ignore

class SystemStressTester:
    def __init__(self, test_dir="data/stress_tests"):
        self.test_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', test_dir))
        self.engine = FusionEngine()
        self.extractor = PythonASTExtractor()

    def setup_scenario(self, name: str):
        path = os.path.join(self.test_dir, name)
        shutil.rmtree(path, ignore_errors=True)
        os.makedirs(path, exist_ok=True)
        return path

    def generate_circular_hell(self, num_files=20):
        print(f"\n[STRESS TEST 1] Generating Circular Dependency Hell ({num_files} files)...")
        path = self.setup_scenario("circular_hell")
        for i in range(num_files):
            next_i = (i + 1) % num_files
            content = f"import file_{next_i}\n\ndef do_thing_{i}():\n    file_{next_i}.do_thing_{next_i}()\n"
            with open(os.path.join(path, f"file_{i}.py"), "w") as f:
                f.write(content)
        return path

    def generate_god_object(self, num_dependents=50):
        print(f"\n[STRESS TEST 2] Generating God Object Pattern (1 to {num_dependents} ratio)...")
        path = self.setup_scenario("god_object")
        with open(os.path.join(path, "god_utils.py"), "w") as f:
            f.write("def do_everything():\n    pass\n")
        for i in range(num_dependents):
            with open(os.path.join(path, f"worker_{i}.py"), "w") as f:
                f.write("import god_utils\n\ndef work():\n    god_utils.do_everything()\n")
        return path

    def run_engine_on_target(self, target_path: str):
        start_time = time.time()
        print(f"  -> Ingesting code from {target_path}...")
        adapter = LocalFSAdapter(target_path)
        raw_files = adapter.fetch_all_code()
        
        print(f"  -> Parsing {len(raw_files)} files (Deterministic AST)...")
        ast_results = [self.extractor.extract_structure(file["content"].encode('utf-8'), file["path"]) for file in raw_files]
        
        print("  -> Compiling System (Graph Intelligence + Groq Semantic Fusion)...")
        try:
            result = self.engine.compile_system(ast_results)
            elapsed = time.time() - start_time
            intel = result["intelligence"]
            
            print(f"  ✅ Compilation Time: {elapsed:.2f} seconds")
            print(f"  🏢 Macro Architecture: {intel.get('macro_architecture', {}).get('pattern')}")
            print(f"  🔍 Cycles Detected: {len(intel.get('circular_dependencies',[]))}")
            if intel.get('bottlenecks'):
                print(f"  🔥 Top Bottleneck: {intel.get('bottlenecks')[0][0]} (Score: {intel.get('bottlenecks')[0][1]:.4f})")
            
            # --- SYNTAX ERROR FIX ---
            # The line below was previously unterminated. It is now corrected.
            print(f"  🧩 Logical Clusters: {len(intel.get('logical_components', []))}")
            # ------------------------

        except Exception as e:
            print(f"  ❌ Engine failed during compilation: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    tester = SystemStressTester()
    
    # Test 1: Cycle Detection
    circular_path = tester.generate_circular_hell(15)
    tester.run_engine_on_target(circular_path)
    
    # Test 2: God Object Detection (Centrality Math)
    god_path = tester.generate_god_object(30)
    tester.run_engine_on_target(god_path)
    
    print("\n✅ Stress Tests Completed.")