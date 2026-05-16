import time
import os
from together import Together

# Initialize the Together client
# It will look for TOGETHER_API_KEY in your environment variables automatically
client = os.getenv("TOGETHER_API_KEY")


def benchmark_together_llama(prompt):
    model_name = "meta-llama/Llama-3.3-70B-Instruct-Turbo"
    print(f"--- Benchmarking: {model_name} ---")

    start_time = time.perf_counter()
    first_token_time = None
    full_response = []

    # Together's stream works similarly but the chunk structure is slightly different
    stream = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
        stream=True
    )

    total_tokens = 0
    for chunk in stream:
        # Capture the moment the first bit of text arrives
        if not first_token_time and chunk.choices[0].delta.content:
            first_token_time = time.perf_counter()

        if chunk.choices[0].delta.content:
            full_response.append(chunk.choices[0].delta.content)

        # Together provides usage in the final chunk or via 'usage' attribute
        if hasattr(chunk, 'usage') and chunk.usage:
            total_tokens = chunk.usage.completion_tokens

    end_time = time.perf_counter()

    # --- Metric Separation ---
    # Time to First Token (Network Trip + Server Overhead)
    ttft = first_token_time - start_time

    # Model Generation Time (Pure inference duration)
    gen_time = end_time - first_token_time

    # Throughput (Tokens per second)
    # If 'usage' wasn't captured, you can approximate with len(" ".join(full_response).split())
    tps = total_tokens / gen_time if gen_time > 0 else 0

    print(f"1. Network Latency (TTFT):  {ttft:.4f}s")
    print(f"2. Model Generation Time:   {gen_time:.4f}s")
    print(f"3. Throughput:              {tps:.2f} tokens/sec")
    print("-" * 40)

    return "".join(full_response)


# Example: Classification Task (Common in your RAG pipeline)
sample_prompt = """
Task: Classify research entity.
Text: 'DisCoCat diagram for syntactic parsing'
Category: [Quantum, Classical, Hybrid]
Result:
"""

output = benchmark_together_llama(sample_prompt)
print(f"Classification Result: {output.strip()}")