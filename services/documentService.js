const { Document } = require('../models');
const OpenAIService = require('./openaiService');

class DocumentService {
  static async createDocument(userId, title, content) {
    return await Document.create({ userId, title, content });
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
    return await document.update(updates);
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
    const answer = await OpenAIService.generateChatResponse([
      { role: 'system', content: 'You are a helpful assistant that answers questions based on the given context.' },
      { role: 'user', content: `Context: ${document.content}\n\nQuestion: ${question}` }
    ]);
    return answer;
  }

  static async streamingChat(userId, documentId, messages, res) {
    const document = await this.getDocumentById(userId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    const contextMessage = { role: 'system', content: `You are a helpful assistant. Use the following document as context for answering questions: ${document.content}` };
    const allMessages = [contextMessage, ...messages];

    return OpenAIService.generateStreamingChatResponse(allMessages, res);
  }
}

module.exports = DocumentService;