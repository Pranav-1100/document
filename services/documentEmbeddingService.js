const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const { Document } = require('../models');

class DocumentEmbeddingService {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.index = null;
  }

  async initialize() {
    this.index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME);
  }

  async generateEmbedding(text) {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  }

  async indexDocument(document) {
    const embedding = await this.generateEmbedding(document.content);
    await this.index.upsert([{
      id: document.id,
      values: embedding,
      metadata: { title: document.title }
    }]);
    
    // Store embedding in the database
    await Document.update(
      { embedding: JSON.stringify(embedding) },
      { where: { id: document.id } }
    );
  }


  async searchSimilarDocuments(query, topK = 5) {
    const queryEmbedding = await this.generateEmbedding(query);
    const results = await this.index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    });
    return results.matches.map(match => ({
      id: match.id,
      score: match.score,
      title: match.metadata.title
    }));
  }
}

module.exports = new DocumentEmbeddingService();