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
    if (!documentType) {
      return res.status(404).json({ error: 'Document type not found' });
    }
    res.json(documentType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a document type
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const updatedDocumentType = await DocumentTypeService.updateDocumentType(req.params.id, { name, description });
    if (!updatedDocumentType) {
      return res.status(404).json({ error: 'Document type not found' });
    }
    res.json(updatedDocumentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a document type
router.delete('/:id', async (req, res) => {
  try {
    const result = await DocumentTypeService.deleteDocumentType(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Document type not found' });
    }
    res.json({ message: 'Document type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;