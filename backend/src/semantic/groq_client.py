# C:\Nithin\AI-Projects\Neural-System-Decompiler\backend\src\semantic\groq_client.py
import os
import time
import logging
from groq import Groq
# --- FIX: Import errors directly from the groq root (Updated SDK standard) ---
from groq import APITimeoutError, RateLimitError, APIError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NSD_GroqEngine")

class ResilientGroqEngine:
    """
    Enterprise-grade Groq Inference Engine.
    Features: Automated model fallback, exponential backoff, and strict output parsing.
    """
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("SECURITY ALERT: GROQ_API_KEY environment variable not set.")
        
        self.client = Groq(api_key=api_key)
        
        # Primary, Secondary, Tertiary Fallback Models
        self.models =[
            "llama-3.1-8b-instant",   # Ultra-fast, great for standard classification
            "mixtral-8x7b-32768",     # Massive context window (32k), good for deep code traces
            "gemma2-9b-it"            # Excellent reasoning capabilities as a final backup
        ]
        self.max_retries = 3

    def generate_with_fallback(self, prompt: str, system_prompt: str = "You are a senior system architect.") -> str:
        """Runs inference with intelligent fallback and rate limit handling."""
        
        messages =[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]

        for attempt in range(self.max_retries):
            for model in self.models:
                try:
                    logger.info(f"Attempting inference with model: {model} (Try {attempt + 1})")
                    
                    response = self.client.chat.completions.create(
                        model=model,
                        messages=messages,
                        temperature=0.1, # Extremely low temp for deterministic, analytical outputs
                        max_tokens=4096
                    )
                    return response.choices[0].message.content

                except RateLimitError as e:
                    logger.warning(f"Rate limited on {model}. Switching model or backing off...")
                    time.sleep(2 ** attempt) # Exponential backoff (1s, 2s, 4s)
                    continue 

                except APITimeoutError as e:
                    logger.warning(f"Timeout on {model}. Falling back to next model...")
                    continue

                except APIError as e:
                    logger.warning(f"API Error with {model}: {str(e)}. Falling back to next model.")
                    continue
                
                except Exception as e:
                    logger.error(f"Unexpected error: {str(e)}")
                    raise e
                    
        raise RuntimeError("CRITICAL: All Groq models failed after maximum retries.")