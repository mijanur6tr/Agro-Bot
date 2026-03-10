import { scrapeWebsite, closeBrowser } from "@/ingestion/scrape";
import { chunkText } from "@/ingestion/chunk";
import { createEmbedding } from "@/ai/embed";
import { getCollection, Document } from "@/db/astraClient";


// Process a single URL: scrape, chunk, embed, and store
async function ingestUrl(url: string): Promise<number> {
  try {
    console.log(`\n Processing: ${url}`);

    // Step 1: Scrape website
    const scraped = await scrapeWebsite(url);
    console.log(`✓ Scraped ${scraped.text.length} characters`);

    // Step 2: Chunk text
    const chunks = chunkText(scraped.text, 800, 200);
    console.log(`✓ Created ${chunks.length} chunks`);

    // Step 3: Create embeddings and store in Astra DB
    const collection = await getCollection();
    let storedCount = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await createEmbedding(chunk.text);

        const doc: Document = {
          text: chunk.text,
          $vector: embedding,
          metadata: {
            source: url,
            title: scraped.title,
            createdAt: new Date().toISOString(),
          },
        };

        await collection.insertOne(doc);
        storedCount++;

        if (storedCount % 5 === 0) {
          console.log(`  ↳ Stored ${storedCount}/${chunks.length} chunks...`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to store chunk ${chunk.chunkIndex}:`, error);
      }
    }

    console.log(
      `✓ Successfully ingested ${storedCount}/${chunks.length} chunks`
    );
    return storedCount;
  } catch (error) {
    console.error(`✗ Failed to ingest ${url}:`, error);
    throw error;
  }
}

// Main ingestion function - processes multiple URLs
async function main(): Promise<void> {
  const urlsToIngest = [
    "https://en.wikipedia.org/wiki/Rabi_crop",
    //  "https://en.wikipedia.org/wiki/Bean",
    //  "https://en.wikipedia.org/wiki/Bean",
    //  "https://en.wikipedia.org/wiki/Beetroot",
    //  "https://en.wikipedia.org/wiki/Eggplant",
    // "https://en.wikipedia.org/wiki/Broccoli",
    // "https://en.wikipedia.org/wiki/Cabbage",
    // "https://en.wikipedia.org/wiki/Capsicum",
    // "https://en.wikipedia.org/wiki/Carrot",
    // "https://en.wikipedia.org/wiki/Cauliflower",
    // "https://en.wikipedia.org/wiki/Chickpea",
    // "https://en.wikipedia.org/wiki/Fenugreek",
    // "https://en.wikipedia.org/wiki/Garlic",
    // "https://en.wikipedia.org/wiki/Lettuce",
    // "https://en.wikipedia.org/wiki/Pea",
    // "https://en.wikipedia.org/wiki/Onion",
    // "https://en.wikipedia.org/wiki/Potato",
    // "https://en.wikipedia.org/wiki/Radish",
    // "https://en.wikipedia.org/wiki/Spinach",
    // "https://en.wikipedia.org/wiki/Sweet_potato",
    // "https://en.wikipedia.org/wiki/Tomato",
    // "https://en.wikipedia.org/wiki/Turnip",
  ];

  console.log(` URLs to ingest: ${urlsToIngest.length}`);

  let totalStored = 0;
  const results = [];

  for (const url of urlsToIngest) {
    try {
      const storedCount = await ingestUrl(url);
      totalStored += storedCount;
      results.push({ url, status: "success", stored: storedCount });
    } catch (error) {
      console.error(`✗ Failed to ingest ${url}`);
      results.push({ url, status: "failed", error: String(error) });
    }
  }

 
  console.log(`Total URLs processed: ${urlsToIngest.length}`);
  console.log(`Successful: ${results.filter((r) => r.status === "success").length}`);
  console.log(`Failed: ${results.filter((r) => r.status === "failed").length}`);
  console.log(`Total documents stored: ${totalStored}`);
 
  // Print detailed results
  console.log("Detailed Results:");
  results.forEach((result) => {
    if (result.status === "success") {
      console.log(`✓ ${result.url} → ${result.stored} documents`);
    } else {
      console.log(`✗ ${result.url} → Failed`);
    }
  });

  await closeBrowser();
  console.log("\n Ingestion pipeline complete!\n");
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
