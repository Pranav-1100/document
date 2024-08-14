const express = require('express');
const ConversationService = require('../services/conversationService');

const router = express.Router();

// Create a new conversation
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await ConversationService.createConversation(req.user.id, title);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all conversations for the user
router.get('/', async (req, res) => {
  try {
    const conversations = await ConversationService.getAllConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific conversation
router.get('/:id', async (req, res) => {
  try {
    const conversation = await ConversationService.getConversationById(req.user.id, req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a conversation
router.patch('/:id', async (req, res) => {
  try {
    const updatedConversation = await ConversationService.updateConversation(req.user.id, req.params.id, req.body);
    res.json(updatedConversation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a conversation
router.delete('/:id', async (req, res) => {
  try {
    const result = await ConversationService.deleteConversation(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a message to a conversation
router.post('/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const message = await ConversationService.addMessage(req.user.id, req.params.id, content);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;