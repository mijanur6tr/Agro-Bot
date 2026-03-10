import "dotenv/config";
import { DataAPIClient, Collection } from "@datastax/astra-db-ts";

if (!process.env.ASTRA_DB_TOKEN || !process.env.ASTRA_DB_ENDPOINT) {
  throw new Error(
    "Missing required environment variables: ASTRA_DB_TOKEN, ASTRA_DB_ENDPOINT"
  );
}

const client = new DataAPIClient(process.env.ASTRA_DB_TOKEN);

const db = client.db(
  process.env.ASTRA_DB_ENDPOINT,
  {
    namespace: process.env.ASTRA_DB_NAMESPACE || "default_keyspace",
  }
);

export interface Document {
  _id?: string;
  text: string;
  $vector: number[];
  metadata?: {
    source?: string;
    createdAt?: string;
    title?: string;
  };
}

let collection: Collection<Document> | null = null;

export async function getCollection(): Promise<Collection<Document>> {
  if (!collection) {
    try {
      // Create or get the collection with vector indexing support (dimension depends on your embedding model)
      collection = await db.collection<Document>("agrobot");
      console.log("✓ Connected to Astra DB collection");
    } catch (error) {
      console.error("Failed to connect to Astra DB:", error);
      throw new Error("Database connection failed");
    }
  }
  return collection;
}
// export async function getCollection(): Promise<Collection<Document>> {
//   if (!collection) {
//     try {
//       // Create or get the collection with vector indexing support (dimension depends on your embedding model)
//       collection = await db.createCollection<Document>("agrobot", {
//         vector: {
//           dimension: 3072, // Gemini embedding model uses 3072 dimensions
//           metric: "cosine",
//         },
//         checkExists: true, // Check if collection exists before creating
//       });
//       console.log("✓ Connected to Astra DB collection");
//     } catch (error) {
//       console.error("Failed to connect to Astra DB:", error);
//       throw new Error("Database connection failed");
//     }
//   }
//   return collection;
// }



export { db };
