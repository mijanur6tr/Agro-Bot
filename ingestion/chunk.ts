export interface Chunk {
  text: string;
  chunkIndex: number;
}

/**
 * Splits text into chunks while respecting word boundaries
 * and attempting to keep related content together
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 800,
  overlapSize: number = 200
): Chunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = "";
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    // If single sentence is too long, split it
    if (trimmedSentence.length > maxChunkSize) {
      // Save current chunk if it has content
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          chunkIndex: chunkIndex++,
        });
        currentChunk = "";
      }

      // Split long sentence by word boundaries
      const words = trimmedSentence.split(/\s+/);
      let sentenceChunk = "";

      for (const word of words) {
        if ((sentenceChunk + " " + word).length > maxChunkSize) {
          if (sentenceChunk.trim()) {
            chunks.push({
              text: sentenceChunk.trim(),
              chunkIndex: chunkIndex++,
            });
          }
          sentenceChunk = word;
        } else {
          sentenceChunk += (sentenceChunk ? " " : "") + word;
        }
      }

      if (sentenceChunk.trim()) {
        chunks.push({
          text: sentenceChunk.trim(),
          chunkIndex: chunkIndex++,
        });
      }
    } else if ((currentChunk + " " + trimmedSentence).length > maxChunkSize) {
      // Save current chunk and start new one
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          chunkIndex: chunkIndex++,
        });

        // Add overlap for context continuity
        const overlapText = currentChunk
          .split(/\s+/)
          .slice(-Math.ceil(overlapSize / 4))
          .join(" ");
        currentChunk = overlapText + " " + trimmedSentence;
      } else {
        currentChunk = trimmedSentence;
      }
    } else {
      currentChunk += (currentChunk ? " " : "") + trimmedSentence;
    }
  }

  // Add remaining chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      chunkIndex: chunkIndex,
    });
  }

  return chunks;
}

/**
 * Split text by character count (basic method)
 */
export function chunkTextSimple(
  text: string,
  chunkSize: number = 800
): Chunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push({
      text: text.slice(i, i + chunkSize).trim(),
      chunkIndex: chunks.length,
    });
  }

  return chunks.filter((chunk) => chunk.text.length > 0);
}

/**
 * Clean and normalize text before chunking
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s.!?,;:\-"'()]/g, "") // Remove special characters
    .trim();
}
