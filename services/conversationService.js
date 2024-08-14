const { Conversation, Message } = require('../models');
const OpenAIService = require('./openaiService');

class ConversationService {
  static async createConversation(userId, title) {
    return await Conversation.create({ ownerId: userId, title });
  }

  static async getAllConversations(userId) {
    return await Conversation.findAll({ where: { ownerId: userId } });
  }

  static async getConversationById(userId, conversationId) {
    return await Conversation.findOne({
      where: { id: conversationId, ownerId: userId },
      include: [{ model: Message, as: 'messages' }]
    });
  }

  static async updateConversation(userId, conversationId, updates) {
    const conversation = await this.getConversationById(userId, conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return await conversation.update(updates);
  }

  static async deleteConversation(userId, conversationId) {
    const conversation = await this.getConversationById(userId, conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    await conversation.destroy();
    return { message: 'Conversation deleted successfully' };
  }

  static async addMessage(userId, conversationId, content) {
    const conversation = await this.getConversationById(userId, conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const userMessage = await Message.create({
      conversationId,
      authorId: userId,
      content,
      role: 'user'
    });

    // Generate AI response
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']]
    });

    const aiResponse = await OpenAIService.generateChatResponse([
      { role: 'system', content: 'You are a helpful assistant.' },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content }
    ]);

    await Message.create({
      conversationId,
      content: aiResponse,
      role: 'assistant'
    });

    return userMessage;
  }
}

module.exports = ConversationService;