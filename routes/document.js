const express = require('express');
const DocumentService = require('../services/documentService');

const router = express.Router();

// Create a new document
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await DocumentService.createDocument(req.user.id, title, content);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all documents for the user
router.get('/', async (req, res) => {
  try {
    const documents = await DocumentService.getAllDocuments(req.user.id);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific document
router.get('/:id', async (req, res) => {
  try {
    const document = await DocumentService.getDocumentById(req.user.id, req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a document
router.patch('/:id', async (req, res) => {
  try {
    const updatedDocument = await DocumentService.updateDocument(req.user.id, req.params.id, req.body);
    res.json(updatedDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const result = await DocumentService.deleteDocument(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Summarize a document
router.post('/:id/summarize', async (req, res) => {
  try {
    const summary = await DocumentService.summarizeDocument(req.user.id, req.params.id);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ask a question about a document
router.post('/:id/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await DocumentService.askQuestion(req.user.id, req.params.id, question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Streaming chat about a document
router.post('/:id/chat/stream', async (req, res) => {
  const { messages } = req.body;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  try {
    await DocumentService.streamingChat(req.user.id, req.params.id, messages, res);
  } catch (error) {
    console.error('Error in streaming response:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
  } finally {
    if (!res.finished) {
      res.end();
    }
  }
});

module.exports = router;