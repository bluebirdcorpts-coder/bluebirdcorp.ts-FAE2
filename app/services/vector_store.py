from typing import Any, Dict, List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class VectorStore:
    """ChromaDB-backed vector store for product knowledge retrieval."""

    def __init__(self):
        settings = get_settings()
        self._client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._collection = self._client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info("vector_store.initialized", collection=settings.chroma_collection_name)

    def upsert(
        self,
        ids: List[str],
        documents: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        self._collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas or [{} for _ in ids],
        )
        logger.info("vector_store.upsert", count=len(ids))

    def query(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        results = self._collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        hits = []
        for i, doc_id in enumerate(results["ids"][0]):
            hits.append(
                {
                    "id": doc_id,
                    "document": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i],
                }
            )
        return hits

    def delete(self, ids: List[str]) -> None:
        self._collection.delete(ids=ids)
        logger.info("vector_store.delete", count=len(ids))

    def count(self) -> int:
        return self._collection.count()

    def index_product(self, product_id: int, name: str, description: str, metadata: dict) -> None:
        doc_id = f"product:{product_id}"
        document = f"Product: {name}\n{description or ''}"
        self.upsert(
            ids=[doc_id],
            documents=[document],
            metadatas=[{"product_id": product_id, **metadata}],
        )

    def search_products(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        return self.query(query, n_results=n_results, where=None)
