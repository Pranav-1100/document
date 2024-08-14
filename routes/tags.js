const express = require('express');
const TagService = require('../services/tagService');
const router = express.Router();

// Create a new tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await TagService.createTag(name);
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await TagService.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific tag by ID
router.get('/:id', async (req, res) => {
  try {
    const tag = await TagService.getTagById(req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a tag
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedTag = await TagService.updateTag(req.params.id, name);
    if (!updatedTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(updatedTag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a tag
router.delete('/:id', async (req, res) => {
  try {
    const result = await TagService.deleteTag(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a tag to a document
router.post('/addToDocument', async (req, res) => {
  try {
    const { documentId, tagId } = req.body;
    const result = await TagService.addTagToDocument(documentId, tagId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a tag from a document
router.post('/removeFromDocument', async (req, res) => {
  try {
    const { documentId, tagId } = req.body;
    const result = await TagService.removeTagFromDocument(documentId, tagId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all documents with a specific tag
router.get('/:id/documents', async (req, res) => {
  try {
    const documents = await TagService.getDocumentsByTag(req.params.id);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search tags
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const tags = await TagService.searchTags(query);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tags with pagination
router.get('/paginated', async (req, res) => {
    try {
      const { page, limit } = req.query;
      const tags = await TagService.getTagsWithPagination(parseInt(page), parseInt(limit), req.user.id);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create a tag category
  router.post('/categories', async (req, res) => {
    try {
      const { name, description } = req.body;
      const category = await TagService.createTagCategory(name, description);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Assign a tag to a category
  router.post('/:id/assign-category', async (req, res) => {
    try {
      const { categoryId } = req.body;
      const tag = await TagService.assignTagToCategory(req.params.id, categoryId);
      res.json(tag);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Merge tags
  router.post('/merge', async (req, res) => {
    try {
      const { sourceTagId, targetTagId } = req.body;
      const result = await TagService.mergeTags(sourceTagId, targetTagId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get tag usage analytics
  router.get('/analytics', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await TagService.getTagUsageAnalytics(new Date(startDate), new Date(endDate));
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Add a tag to favorites
  router.post('/favorites/:id', async (req, res) => {
    try {
      const result = await TagService.addFavoriteTag(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Remove a tag from favorites
  router.delete('/favorites/:id', async (req, res) => {
    try {
      const result = await TagService.removeFavoriteTag(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get favorite tags
  router.get('/favorites', async (req, res) => {
    try {
      const favoriteTags = await TagService.getFavoriteTags(req.user.id);
      res.json(favoriteTags);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Suggest tags for a document
  router.get('/suggest/:documentId', async (req, res) => {
    try {
      const suggestedTags = await TagService.suggestTagsForDocument(req.params.documentId);
      res.json(suggestedTags);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Export tags
  router.get('/export', async (req, res) => {
    try {
      const tags = await TagService.exportTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Import tags
  router.post('/import', async (req, res) => {
    try {
      const { tags } = req.body;
      const importedTags = await TagService.importTags(tags);
      res.json(importedTags);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;