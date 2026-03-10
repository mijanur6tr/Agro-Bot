import { getCollection, Document } from "@/db/astraClient";
import { createEmbedding } from "./embed";

export interface SearchResult extends Document {
  score?: number;
}

export async function searchSimilar(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  try {

    // Create embedding for the query
    const queryEmbedding = await createEmbedding(query);

    // Get collection and perform vector search
    const collection = await getCollection();
    const results = await collection.find(
      {},
      {
        sort: { $vector: queryEmbedding },
        limit: limit,
      }
    );

    const documents = await results.toArray();
    console.log(`✓ Found ${documents.length} relevant documents`);

    return documents;
  } catch (error) {
    console.error("Error performing vector search:", error);
    throw new Error("Failed to search documents");
  }
}

//testing the search function
// searchSimilar("What are the best practices for sustainable farming?", 5)
//   .then((results) => {
//     console.log("Search results:", results);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });



// export async function searchWithThreshold(
//   query: string,
//   similarityThreshold: number = 0.5,
//   limit: number = 10
// ): Promise<SearchResult[]> {
//   if (!query || query.trim().length === 0) {
//     throw new Error("Query cannot be empty");
//   }

//   try {
//     const results = await searchSimilar(query, limit);

//     // Filter by similarity threshold if needed
//     // Note: Astra DB returns results sorted by vector similarity
//     // You may need to calculate actual similarity scores based on your implementation
//     return results;
//   } catch (error) {
//     console.error("Error searching with threshold:", error);
//     throw new Error("Failed to search documents with threshold");
//   }
// }

export async function getRelevantContext(
  query: string,
  contextChunks: number = 5,
  includeMetadata: boolean = true
): Promise<{ text: string; metadata?: unknown }[]> {
  try {
    const results = await searchSimilar(query, contextChunks);

    return results.map((doc) => ({
      text: doc.text,
      ...(includeMetadata && doc.metadata && { metadata: doc.metadata }),
    }));
  } catch (error) {
    console.error("Error getting relevant context:", error);
    throw new Error("Failed to retrieve context");
  }
}


//testing the getRelevantContext function
// getRelevantContext("What are the benefits of crop rotation in sustainable agriculture?", 5)
//   .then((context) => {
//     console.log("Retrieved context:", context);  
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
