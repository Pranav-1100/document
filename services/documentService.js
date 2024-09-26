const { Document } = require('../models');
const OpenAIService = require('./openaiService');
const DocumentEmbeddingService = require('./documentEmbeddingService');

class DocumentService {
  static async createDocument(userId, title, content) {
    const document = await Document.create({ userId, title, content });
    await DocumentEmbeddingService.indexDocument(document);
    return document;
  }

  static async getAllDocuments(userId) {
    return await Document.findAll({ where: { userId } });
  }

  static async getDocumentById(userId, documentId) {
    return await Document.findOne({ where: { id: documentId, userId } });
  }

  static async updateDocument(userId, documentId, updates) {
    const document = await this.getDocumentById(userId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    const updatedDocument = await document.update(updates);
    if (updates.content) {
      await DocumentEmbeddingService.indexDocument(updatedDocument);
    }
    return updatedDocument;
  }

  static async deleteDocument(userId, documentId) {
    const document = await this.getDocumentById(userId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    await document.destroy();
    return { message: 'Document deleted successfully' };
  }

  static async summarizeDocument(userId, documentId) {
    const document = await this.getDocumentById(userId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    const summary = await OpenAIService.generateChatResponse([
      { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
      { role: 'user', content: `Summarize the following text:\n\n${document.content}` }
    ]);
    return summary;
  }

  static async askQuestion(userId, documentId, question) {
    const document = await this.getDocumentById(userId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    const similarDocuments = await DocumentEmbeddingService.searchSimilarDocuments(question, 3);
    const context = similarDocuments.map(doc => doc.content).join('\n\n');
    const answer = await OpenAIService.generateChatResponse([
      { role: 'system', content: 'You are a helpful assistant that answers questions based on the given context.' },
      { role: 'user', content: `Context: ${context}\n\nDocument: ${document.content}\n\nQuestion: ${question}` }
    ]);
    return answer;
  }

  static async streamingChat(userId, documentId, messages, res) {
    try {
      const document = await this.getDocumentById(userId, documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      const lastUserMessage = messages[messages.length - 1].content;
      const similarDocuments = await DocumentEmbeddingService.searchSimilarDocuments(lastUserMessage, 3);
      const context = similarDocuments.map(doc => doc.content).join('\n\n');

      const contextMessage = { role: 'system', content: `You are a helpful assistant. Use the following documents as context for answering questions: ${context}\n\nMain document: ${document.content}` };
      const allMessages = [contextMessage, ...messages].filter(msg => msg && msg.content && msg.content.trim() !== '');
  
      await OpenAIService.generateStreamingChatResponse(allMessages, res);
    } catch (error) {
      console.error('Error in streaming chat:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
      throw error;
    }
  }
}

module.exports = DocumentService;