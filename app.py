"""
RAG Knowledge Graph API
==============================================
Advanced RAG system with MongoDB vector search, Neo4j knowledge graph extraction,
and multi-LLM comparison with human feedback collection.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
from pymongo import MongoClient
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer
import uuid
from dotenv import load_dotenv
import os
import re
import json
from openai import OpenAI
import atexit
import nltk
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.tokenize import word_tokenize
from together import Together
import asyncio
from contextlib import asynccontextmanager

# Rich Library Integration (SIMPLIFIED & FIXED)
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

# Initialize Rich console
console = Console()

# Bulletproof print_status function
def print_status(message: str, status: str = "INFO", emoji: str = ""):
    """Print formatted status messages - 100% SAFE VERSION."""
    status_emojis = {
        "INFO": "",
        "SUCCESS": "",
        "WARNING": "",
        "ERROR": "",
        "PROCESSING": ""
    }

    status_colors = {
        "INFO": "blue",
        "SUCCESS": "green",
        "WARNING": "yellow",
        "ERROR": "red",
        "PROCESSING": "cyan"
    }

    # Use predefined emoji or fallback
    display_emoji = status_emojis.get(status, emoji)
    color = status_colors.get(status, "blue")

    # Build string without dynamic markup
    status_line = f"[{color}]{display_emoji} {status}:[/] {message}"
    console.print(status_line)

# Startup banner
def print_startup_banner():
    """Display startup banner - SAFE VERSION."""
    console.print("[green]══════════════════════════════════════════════════════════════════════════[/green]")
    console.print("[bold cyan]RAG Knowledge Graph API[/bold cyan]")
    console.print("[green]══════════════════════════════════════════════════════════════════════════[/green]\n")

# NLTK initialization
def initialize_nltk_safe():
    """Safe NLTK initialization - no progress bars, no markup issues."""
    try:
        print_status("Initializing NLTK resources", "PROCESSING")
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        print_status("NLTK resources initialized successfully", "SUCCESS")
        return True
    except Exception as e:
        print_status(f"NLTK initialization failed: {str(e)}", "WARNING")
        print("Continuing without NLTK tokenization...")
        return False

# Initialize NLTK SAFELY
nltk_available = initialize_nltk_safe()

# Load environment variables
print_status("Loading environment variables", "PROCESSING")
os.environ.pop("SSL_CERT_FILE", None)
load_dotenv()

# Validate environment variables
required_vars = ["MONGO_URI", "MONGO_DB", "MONGO_COLLECTION", "BASETEN_API_KEY",
                "NEO4J_URI", "NEO4J_USERNAME", "NEO4J_PASSWORD", "TOGETHER_API_KEY"]
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    print_status(f"CRITICAL: Missing environment variables: {', '.join(missing_vars)}", "ERROR")
    print("\n📝 Create a .env file with these variables:")
    for var in required_vars:
        print(f"  {var}={os.getenv(var, 'YOUR_VALUE_HERE')}")
    exit(1)

print_status("Environment variables loaded successfully", "SUCCESS")

# Display banner
print_startup_banner()

# --- Database Connections ---
print_status("Establishing database connections", "PROCESSING")

# MongoDB
try:
    mongo_uri = os.getenv("MONGO_URI")
    mongo_db_name = os.getenv("MONGO_DB")
    mongo_collection_name = os.getenv("MONGO_COLLECTION")
    mongo_client = MongoClient(mongo_uri)
    mongo_db = mongo_client[mongo_db_name]
    mongo_collection = mongo_db[mongo_collection_name]

    mongo_client.admin.command('ping')
    print_status("MongoDB connected successfully", "SUCCESS")
except Exception as e:
    print_status(f"MongoDB connection failed: {str(e)}", "ERROR")
    raise

# Neo4j
try:
    neo4j_uri = os.getenv("NEO4J_URI")
    neo4j_user = os.getenv("NEO4J_USERNAME")
    neo4j_password = os.getenv("NEO4J_PASSWORD")
    neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))

    with neo4j_driver.session() as session:
        session.run("RETURN 1")
    print_status("Neo4j connected successfully", "SUCCESS")
except Exception as e:
    print_status(f"Neo4j connection failed: {str(e)}", "ERROR")
    raise

# --- Model Loading ---
print_status("Loading embedding model", "PROCESSING")
try:
    LOCAL_EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    print_status("Embedding model loaded successfully", "SUCCESS")
except Exception as e:
    print_status(f"Model loading failed: {str(e)}", "ERROR")
    raise

# --- Cache & Metrics ---
comparison_cache = {}
METRICS_FILE = 'feedback_metrics.json'

# --- Pydantic Models (UNCHANGED) ---
class QueryRequest(BaseModel):
    query: str
    k: int = 10

class ComparisonRequest(BaseModel):
    session_id: str

class SingleFeedback(BaseModel):
    model_type: str
    ratings: Dict[str, int]

class FeedbackRequest(BaseModel):
    session_id: str
    feedbacks: List[SingleFeedback]

    class Config:
        schema_extra = {
            "example": {
                "session_id": "123e4567-e89b-12d3-a456-426614174000",
                "model_type": "mongodb_rag",
                "ratings": {
                    "accuracy": 5,
                    "completeness": 4,
                    "coherence": 5,
                    "helpfulness": 4
                }
            }
        }

class CleanupRequest(BaseModel):
    session_id: str

class QueryResponse(BaseModel):
    retrieved_docs: List[Dict[str, Any]]
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    session_id: str
    answer: str

class ComparisonResponse(BaseModel):
    plain_llm_answer: str
    mongodb_rag_answer: str
    neo4j_kg_rag_answer: str
    calculated_metrics: Dict[str, Dict[str, float]]

class FeedbackResponse(BaseModel):
    success: bool
    message: str

class HealthResponse(BaseModel):
    status: str
    message: str

# --- Utility Functions (SAFE VERSIONS) ---
def load_metrics():
    if os.path.exists(METRICS_FILE):
        try:
            with open(METRICS_FILE, 'r') as f:
                data = json.load(f)
                print_status(f"Loaded {len(data)} metrics", "INFO")
                return data
        except:
            print_status("Starting fresh metrics", "WARNING")
            return []
    return []

def save_metrics(data):
    try:
        with open(METRICS_FILE, 'w') as f:
            json.dump(data, f, indent=4)
        print_status(f"Saved {len(data)} metrics", "SUCCESS")
    except Exception as e:
        print_status(f"Metrics save failed: {str(e)}", "ERROR")

def validate_feedback_ratings(ratings: Dict[str, int]) -> bool:
    """Validate that feedback ratings contain the exact required keys."""
    required_keys = {"accuracy", "completeness", "coherence", "helpfulness"}
    received_keys = set(ratings.keys())
    return required_keys.issubset(received_keys)

# Safe metric calculations
def calculate_rouge_l_f1(candidate, reference):
    if not candidate or not reference:
        return 0.0
    try:
        if not nltk_available:
            return 0.0
        candidate_tokens = set(word_tokenize(candidate.lower()))
        reference_tokens = set(word_tokenize(reference.lower()))
        if not candidate_tokens or not reference_tokens:
            return 0.0
        intersect = len(candidate_tokens.intersection(reference_tokens))
        precision = intersect / len(candidate_tokens)
        recall = intersect / len(reference_tokens)
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        return round(f1_score, 4)
    except:
        return 0.0

def calculate_bleu(candidate, reference):
    if not candidate or not reference:
        return 0.0
    try:
        if not nltk_available:
            return 0.0
        candidate_tokens = word_tokenize(candidate.lower())
        reference_tokens = [word_tokenize(reference.lower())]
        if not candidate_tokens or not reference_tokens[0]:
            return 0.0
        chencherry = SmoothingFunction()
        return round(sentence_bleu(reference_tokens, candidate_tokens, smoothing_function=chencherry.method1), 4)
    except:
        return 0.0

def extract_json_from_string(s):
    try:
        if s.strip().startswith('{') and s.strip().endswith('}'):
            return json.loads(s.strip())
        match = re.search(r'\{.*\}', s, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(s.strip())
    except:
        return None

# Load metrics
all_metrics = load_metrics()

# --- FastAPI App ---
app = FastAPI(
    title="RAG Knowledge Graph API",
    version="1.0.0",
    description="Advanced RAG system with MongoDB vector search and Neo4j knowledge graph extraction"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print_status("Starting RAG Knowledge Graph API", "SUCCESS")
    yield
    print_status("Shutting down API", "INFO")
    save_metrics(all_metrics)
    try:
        neo4j_driver.close()
        mongo_client.close()
    except:
        pass

app.router.lifespan_context = lifespan

# --- API Endpoints ---

@app.get("/", response_model=HealthResponse)
async def root():
    print_status("Root endpoint accessed", "INFO")
    return HealthResponse(
        status="success",
        message="RAG Knowledge Graph API is running! Visit /docs"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    print_status("Health check", "INFO")
    return HealthResponse(
        status="healthy",
        message=f"API running (PID: {os.getpid()})"
    )


@app.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    print_status(f"Query: '{request.query}' (k={request.k})", "INFO")

    user_query = request.query.strip()
    k = request.k

    if not user_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Generate embedding
    try:
        print_status("Generating query embedding", "PROCESSING")
        query_vector = LOCAL_EMBEDDING_MODEL.encode(user_query, normalize_embeddings=True).tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")

    # MongoDB vector search
    pipeline = [
        {"$vectorSearch": {"index": "embeddings", "path": "embedding", "queryVector": query_vector,
                           "numCandidates": 100, "limit": k}},
        {"$project": {"_id": 1, "content": 1, "title": 1, "summary": 1, "keywords": 1, "url": 1,
                      "score": {"$meta": "vectorSearchScore"}}}
    ]

    try:
        print_status("MongoDB vector search", "PROCESSING")
        docs = list(mongo_collection.aggregate(pipeline))
        print_status(f"Retrieved {len(docs)} documents", "SUCCESS")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")

    if not docs:
        session_id = str(uuid.uuid4())
        return QueryResponse(
            retrieved_docs=[],
            nodes=[],
            edges=[],
            session_id=session_id,
            answer="No relevant documents found."
        )

    # Format docs for frontend
    retrieved_docs_for_frontend = [{
        "id": str(doc.get("_id")),
        "score": f"{doc.get('score', 0):.4f}",
        "title": doc.get("title", "[No title]"),
        "summary": doc.get("summary", "[No summary]"),
        "keywords": ", ".join(doc.get("keywords", [])) if isinstance(doc.get("keywords"), list) else doc.get("keywords",
                                                                                                             ""),
        "url": doc.get("url", ""),
    } for doc in docs]

    # Prepare docs for KG extraction
    docs_text_parts = []
    for doc in docs:
        doc_id = str(doc["_id"])
        docs_text_parts.append(
            f"--- Document ID: {doc_id} ---\nTitle: {doc.get('title', '')}\nSummary: {doc.get('summary', '')}")

    docs_text = "\n\n".join(docs_text_parts)

    # Knowledge Graph Extraction
    print_status("Extracting knowledge graph", "PROCESSING")
    try:
        client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
        prompt = f"""Extract structured knowledge graph from documents. Output ONLY valid JSON.

CRITICAL: source entity PERFORMS action on target entity.
Example: "IBM developed Infoscope" → {{'source': 'IBM', 'relation': 'DEVELOPED', 'target': 'Infoscope'}}

Entities format: {{"name": "entity", "type": "Person/Organization/Technology", "source_document_id": "doc_id"}}
Max 15 entities, 20 relationships.

Documents:
{docs_text}"""

        response = client.chat.completions.create(
            model="Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4000
        )
        parsed_output = extract_json_from_string(response.choices[0].message.content)

        if not parsed_output:
            parsed_output = {"entities": [], "relationships": []}

        print_status(f"KG: {len(parsed_output.get('entities', []))} entities", "SUCCESS")

    except Exception as e:
        print_status(f"KG extraction failed: {str(e)}", "WARNING")
        parsed_output = {"entities": [], "relationships": []}

    # MongoDB RAG Answer
    print_status("Generating RAG answer", "PROCESSING")
    try:
        context_text = "\n\n".join([
            f"Title: {doc.get('title', '[No title]')}\nSummary: {doc.get('summary', '[No summary]')}"
            for doc in docs
        ])
        answer_prompt = f"""Answer using only these documents. Be concise (max 150 words).

Query: {user_query}
Documents:
{context_text}

Answer:"""

        client2 = OpenAI(api_key=os.getenv("BASETEN_API_KEY"), base_url="https://inference.baseten.co/v1")
        response = client2.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct-0905",
            messages=[{"role": "user", "content": answer_prompt}],
            max_tokens=1000,
        )
        paragraph_answer = response.choices[0].message.content
    except Exception as e:
        paragraph_answer = f"[Answer generation failed: {str(e)}]"

    # Build Graph Structure
    print_status("Building graph structure", "PROCESSING")
    session_id = str(uuid.uuid4())
    nodes, edges = [], []
    unique_nodes = {}

    # Document nodes
    referenced_doc_ids = {ent.get("source_document_id") for ent in parsed_output.get("entities", [])}
    for doc_data in retrieved_docs_for_frontend:
        if doc_data['id'] in referenced_doc_ids:
            doc_node_id = f"doc_{doc_data['id']}"
            unique_nodes[doc_node_id] = {
                "id": doc_node_id,
                "label": f"Doc: {doc_data['id'][:8]}...",
                "group": "Document",
                "score": float(doc_data['score'])
            }

    # Entity nodes & relationships
    entity_map = {}
    all_entities_from_llm = parsed_output.get("entities", [])

    for ent in all_entities_from_llm:
        if not all(k in ent for k in ["name", "type", "source_document_id"]):
            continue
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', ent['name'])
        ent_id = f"{ent['type'].lower()}_{safe_name.lower()}"
        entity_map[ent['name']] = ent_id

        doc_id = ent["source_document_id"]
        doc_node_id = f"doc_{doc_id}"

        if ent_id not in unique_nodes:
            unique_nodes[ent_id] = {"id": ent_id, "label": ent["name"], "group": ent["type"]}

        if doc_node_id in unique_nodes:
            edges.append({"from": doc_node_id, "to": ent_id})

    # Handle relationships
    for rel in parsed_output.get("relationships", []):
        src_name = rel.get("source")
        tgt_name = rel.get("target")

        if not src_name or not tgt_name:
            continue

        for entity_name in [src_name, tgt_name]:
            if entity_name not in entity_map:
                safe_name = re.sub(r'[^a-zA-Z0-9_]', '_', entity_name)
                new_id = f"inferred_{safe_name.lower()}"
                if new_id not in unique_nodes:
                    unique_nodes[new_id] = {"id": new_id, "label": entity_name, "group": "Inferred"}
                entity_map[entity_name] = new_id

        src_id = entity_map.get(src_name)
        tgt_id = entity_map.get(tgt_name)
        if src_id and tgt_id:
            edges.append({
                "from": src_id,
                "to": tgt_id,
                "relation": rel.get("relation", "RELATED_TO")
            })

    nodes = list(unique_nodes.values())

    # Neo4j Persistence
    print_status("Persisting to Neo4j", "PROCESSING")
    try:
        with neo4j_driver.session() as session:
            for node_data in nodes:
                if node_data['group'] == 'Document':
                    session.run("""
                        MERGE (d:Document {id: $id})
                        ON CREATE SET d.title = $label, d.session = $sid
                    """, id=node_data['id'], label=node_data['label'], sid=session_id)
                else:
                    safe_label = re.sub(r'[^a-zA-Z0-9_]', '_', node_data['group'])
                    session.run(f"""
                        MERGE (e:{safe_label} {{id: $id}})
                        ON CREATE SET e.name = $label, e.session = $sid
                    """, id=node_data['id'], label=node_data['label'], sid=session_id)

            session.run("MERGE (c:Center {id: 'db'}) ON CREATE SET c.label = 'DB'")

            for node_data in nodes:
                if node_data["group"] == "Document":
                    session.run("""
                        MATCH (c:Center {id: 'db'}), (d:Document {id: $doc_id})
                        MERGE (c)-[:CONTAINS]->(d)
                    """, doc_id=node_data["id"])

            for edge_data in edges:
                if edge_data.get('relation'):
                    rel_type = re.sub(r'[^a-zA-Z0-9_]', '', edge_data['relation'].replace(" ", "_").upper())
                    if rel_type:
                        session.run(f"""
                            MATCH (a {{id: $src}}), (b {{id: $tgt}})
                            MERGE (a)-[r:{rel_type}]->(b)
                        """, src=edge_data['from'], tgt=edge_data['to'])

        print_status("Neo4j persistence successful", "SUCCESS")
    except Exception as e:
        print_status(f"Neo4j persistence failed: {str(e)}", "WARNING")

    print_status("Computing baseline metrics", "PROCESSING")

    # Generate Plain LLM answer for metrics comparison
    plain_llm_answer = "[Plain LLM not computed]"
    try:
        client_plain = OpenAI(api_key=os.getenv("BASETEN_API_KEY"), base_url="https://inference.baseten.co/v1")
        plain_response = client_plain.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct-0905",
            messages=[{"role": "user", "content": f"Answer: {user_query}"}],
            max_tokens=1000
        )
        plain_llm_answer = plain_response.choices[0].message.content
    except Exception as e:
        print_status(f"Plain LLM computation failed: {str(e)}", "WARNING")

    # Create reference text from documents
    reference_text = ". ".join([doc.get('summary', '') for doc in docs])

    # Calculate metrics for all 3 approaches
    calculated_metrics = {
        "plain_llm": {
            "bleu": calculate_bleu(plain_llm_answer, paragraph_answer),
            "rouge_l": calculate_rouge_l_f1(plain_llm_answer, paragraph_answer)
        },
        "mongodb_rag": {
            "bleu": calculate_bleu(paragraph_answer, reference_text),
            "rouge_l": calculate_rouge_l_f1(paragraph_answer, reference_text)
        },
        "neo4j_kg_rag": {
            "bleu": 0.0,  # Will be computed in /generate_comparison
            "rouge_l": 0.0  # Will be computed in /generate_comparison
        }
    }

    # Cache results WITH METRICS
    all_entity_names = list(entity_map.keys())
    comparison_cache[session_id] = {
        "query": user_query,
        "docs": docs,
        "mongodb_rag_answer": paragraph_answer,
        "plain_llm_answer": plain_llm_answer,
        "extracted_entities": all_entity_names,
        "document_info": retrieved_docs_for_frontend,
        "calculated_metrics": calculated_metrics,
        "reference_text": reference_text
    }

    print_status(f"Metrics computed and cached. Session: {session_id[:8]}", "SUCCESS")

    return QueryResponse(
        retrieved_docs=retrieved_docs_for_frontend,
        nodes=nodes,
        edges=edges,
        session_id=session_id,
        answer=paragraph_answer
    )

# --- Other Endpoints (IMPLEMENTED EXACTLY AS ORIGINAL) ---
@app.post("/generate_comparison", response_model=ComparisonResponse)
async def generate_comparison_endpoint(request: ComparisonRequest):
    print_status(f"Comparison for session: {request.session_id}", "INFO")

    session_id = request.session_id
    if session_id not in comparison_cache:
        raise HTTPException(status_code=404, detail="Invalid session ID")

    cached_data = comparison_cache[session_id]
    user_query = cached_data["query"]

    # Plain LLM (use cached if available, otherwise compute)
    plain_llm_answer = cached_data.get("plain_llm_answer", "[No cached answer]")
    if plain_llm_answer == "[No cached answer]":
        try:
            client = OpenAI(api_key=os.getenv("BASETEN_API_KEY"), base_url="https://inference.baseten.co/v1")
            response = client.chat.completions.create(
                model="moonshotai/Kimi-K2-Instruct-0905",
                messages=[{"role": "user", "content": f"Answer: {user_query}"}],
                max_tokens=1000
            )
            plain_llm_answer = response.choices[0].message.content
            # Update cache
            cached_data["plain_llm_answer"] = plain_llm_answer
        except Exception as e:
            plain_llm_answer = f"[Plain LLM failed: {str(e)}]"

    mongodb_rag_answer = cached_data.get("mongodb_rag_answer", "[No answer]")

    # KG RAG
    neo4j_kg_rag_answer = "No entities extracted"
    try:
        entities = cached_data.get("extracted_entities", [])
        if entities:
            with neo4j_driver.session() as session:
                results = session.run(
                    "UNWIND $entities AS e MATCH (n) WHERE n.name CONTAINS e MATCH (n)-[r]->(m) RETURN n.name AS s, type(r) AS rel, m.name AS t LIMIT 25",
                    entities=entities
                )
                kg_context = "\n".join([f"({r['s']})-[:{r['rel']}]->({r['t']})" for r in results])

            if kg_context:
                client = OpenAI(api_key=os.getenv("BASETEN_API_KEY"), base_url="https://inference.baseten.co/v1")
                response = client.chat.completions.create(
                    model="moonshotai/Kimi-K2-Instruct-0905",
                    messages=[{"role": "user", "content": f"Answer using KG: {user_query}\n{kg_context}"}],
                    max_tokens=1000
                )
                neo4j_kg_rag_answer = response.choices[0].message.content
            else:
                neo4j_kg_rag_answer = "No KG relationships found"
        else:
            neo4j_kg_rag_answer = "No entities extracted"
    except Exception as e:
        neo4j_kg_rag_answer = f"[KG RAG failed: {str(e)}]"

    reference_text = cached_data.get("reference_text", "")
    if reference_text:
        cached_data["calculated_metrics"]["neo4j_kg_rag"] = {
            "bleu": calculate_bleu(neo4j_kg_rag_answer, reference_text),
            "rouge_l": calculate_rouge_l_f1(neo4j_kg_rag_answer, reference_text)
        }

    # Return final metrics
    metrics = cached_data.get("calculated_metrics", {})

    return ComparisonResponse(
        plain_llm_answer=plain_llm_answer,
        mongodb_rag_answer=mongodb_rag_answer,
        neo4j_kg_rag_answer=neo4j_kg_rag_answer,
        calculated_metrics=metrics
    )

@app.post("/save_feedback", response_model=FeedbackResponse)
async def save_feedback_endpoint(request: FeedbackRequest):
    print_status(f"Saving {len(request.feedbacks)} feedback entries for session: {request.session_id}", "INFO")

    if request.session_id not in comparison_cache:
        raise HTTPException(status_code=404, detail="Session not found")

    cached_data = comparison_cache[request.session_id]
    saved_count = 0

    for fb in request.feedbacks:
        # Validate required rating keys
        required_keys = {"accuracy", "completeness", "coherence", "helpfulness"}
        if not required_keys.issubset(fb.ratings.keys()):
            print_status(f"Invalid ratings for {fb.model_type}: missing keys", "WARNING")
            continue

        feedback_entry = {
            "session_id": request.session_id,
            "query": cached_data.get("query"),
            "model_type": fb.model_type,
            "human_ratings": {
                "factual_accuracy": int(fb.ratings.get("accuracy", 0)),
                "completeness": int(fb.ratings.get("completeness", 0)),
                "coherence": int(fb.ratings.get("coherence", 0)),
                "helpfulness": int(fb.ratings.get("helpfulness", 0))
            },
            "calculated_metrics": cached_data.get("calculated_metrics", {}),
            "timestamp": str(uuid.uuid4())
        }

        global all_metrics
        all_metrics.append(feedback_entry)
        saved_count += 1

    save_metrics(all_metrics)
    print_status(f"Successfully saved {saved_count} feedback entries", "SUCCESS")
    return FeedbackResponse(success=True, message=f"Saved {saved_count} feedback entries")

@app.delete("/cleanup/{session_id}")
async def cleanup_endpoint(session_id: str):
    print_status(f"Cleaning up session: {session_id}", "INFO")

    try:
        with neo4j_driver.session() as session:
            result = session.run("MATCH (n {session: $sid}) DETACH DELETE n", sid=session_id)

        if session_id in comparison_cache:
            del comparison_cache[session_id]

        print_status("Cleanup complete", "SUCCESS")
        return {"message": f"Cleanup complete for {session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@app.get("/metrics")
async def get_metrics():
    print_status(f"Returning {len(all_metrics)} metrics", "INFO")
    return {"metrics": all_metrics, "total_entries": len(all_metrics)}

# Cleanup on exit
def cleanup_on_exit():
    save_metrics(all_metrics)

atexit.register(cleanup_on_exit)

if __name__ == "__main__":
    print_status("Starting FastAPI server", "SUCCESS")
    console.print("[bold green]Server ready at http://localhost:5001/docs[/bold green]\n")

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=5001,
        reload=True,
        log_level="info"
    )