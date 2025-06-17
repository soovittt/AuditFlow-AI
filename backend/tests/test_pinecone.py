import pinecone
import os
from dotenv import load_dotenv
import logging
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_pinecone_setup():
    """Test Pinecone connection and index setup."""
    try:
        # Initialize Pinecone
        pinecone.init(
            api_key=settings.PINECONE_API_KEY,
            environment=settings.PINECONE_ENVIRONMENT
        )
        
        # List indexes
        indexes = pinecone.list_indexes()
        logger.info(f"Available indexes: {indexes}")
        
        # Check if our index exists
        if settings.PINECONE_INDEX_NAME not in indexes:
            logger.error(f"{settings.PINECONE_INDEX_NAME} index not found!")
            return False
        
        # Get index stats
        index = pinecone.Index(settings.PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        logger.info(f"Index stats: {stats}")
        
        # Test vector upsert
        test_vector = [0.1] * settings.PINECONE_DIMENSION
        test_id = "test_vector_1"
        test_metadata = {
            "test": True,
            "description": "Test vector"
        }
        
        # Upsert test vector
        index.upsert(
            vectors=[(test_id, test_vector, test_metadata)],
            namespace="test"
        )
        logger.info("Successfully upserted test vector")
        
        # Query test vector
        results = index.query(
            vector=test_vector,
            top_k=1,
            namespace="test"
        )
        logger.info(f"Query results: {results}")
        
        # Clean up test vector
        index.delete(ids=[test_id], namespace="test")
        logger.info("Successfully deleted test vector")
        
        return True
        
    except Exception as e:
        logger.error(f"Pinecone test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_pinecone_setup()
    if success:
        print("Pinecone setup test passed!")
    else:
        print("Pinecone setup test failed!") 