const express = require('express');
const DocumentTypeService = require('../services/documentTypeService');
const router = express.Router();

// Create a new document type
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const documentType = await DocumentTypeService.createDocumentType(name, description);
    res.status(201).json(documentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all document types
router.get('/', async (req, res) => {
  try {
    const documentTypes = await DocumentTypeService.getAllDocumentTypes();
    res.json(documentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific document type by ID
router.get('/:id', async (req, res) => {
  try {
    const documentType = await DocumentTypeService.getDocumentTypeById(req.params.id);
    res.json(documentType);
  } catch (error) {
    if (error.message === 'Document type not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update a document type
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const updatedDocumentType = await DocumentTypeService.updateDocumentType(req.params.id, { name, description });
    res.json(updatedDocumentType);
  } catch (error) {
    if (error.message === 'Document type not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Delete a document type
router.delete('/:id', async (req, res) => {
  try {
    const result = await DocumentTypeService.deleteDocumentType(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Document type not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get documents by type
router.get('/:id/documents', async (req, res) => {
  try {
    const documents = await DocumentTypeService.getDocumentsByType(req.params.id);
    res.json(documents);
  } catch (error) {
    if (error.message === 'Document type not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Search document types
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const documentTypes = await DocumentTypeService.searchDocumentTypes(query);
    res.json(documentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document type statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await DocumentTypeService.getDocumentTypeStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create document types
router.post('/bulk', async (req, res) => {
  try {
    const { types } = req.body;
    const createdTypes = await DocumentTypeService.bulkCreateDocumentTypes(types);
    res.status(201).json(createdTypes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get or create a document type
router.post('/get-or-create', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await DocumentTypeService.getOrCreateDocumentType(name, description);
    res.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check if a document type is used
router.get('/:id/is-used', async (req, res) => {
  try {
    const isUsed = await DocumentTypeService.isDocumentTypeUsed(req.params.id);
    res.json({ isUsed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;