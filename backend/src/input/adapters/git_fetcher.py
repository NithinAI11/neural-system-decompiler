# ===== File: backend/src/input/adapters/git_fetcher.py =====
import os
import subprocess
import shutil
import stat
from urllib.parse import urlparse

def remove_readonly(func, path, _):
    """
    Windows-specific fix: Clear the readonly bit and reattempt the removal.
    This is required because .git objects are read-only and block shutil.rmtree.
    """
    os.chmod(path, stat.S_IWRITE)
    func(path)

class GitFetcher:
    """Clones remote repositories for ingestion."""
    def __init__(self, storage_dir: str = "data/raw_repos"):
        self.storage_dir = os.path.abspath(storage_dir)
        os.makedirs(self.storage_dir, exist_ok=True)

    def fetch(self, repo_url: str) -> str:
        """Clones repo and returns the local path."""
        parsed_url = urlparse(repo_url)
        repo_name = os.path.basename(parsed_url.path).replace(".git", "")
        target_path = os.path.join(self.storage_dir, repo_name)

        # Force clean existing directory for a fresh clone (Windows Safe)
        if os.path.exists(target_path):
            print(f"[GitFetcher] Cleaning existing directory: {target_path}")
            shutil.rmtree(target_path, onerror=remove_readonly)

        print(f"[GitFetcher] Cloning {repo_url} into {target_path}...")
        try:
            subprocess.run(["git", "clone", "--depth", "1", repo_url, target_path], check=True, capture_output=True)
            return target_path
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Git clone failed: {e.stderr.decode('utf-8')}")