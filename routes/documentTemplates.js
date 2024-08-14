const express = require('express');
const DocumentTemplateService = require('../services/documentTemplateService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, content, description } = req.body;
    const template = await DocumentTemplateService.createTemplate(req.user.id, name, content, description);
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const templates = await DocumentTemplateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const template = await DocumentTemplateService.getTemplateById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedTemplate = await DocumentTemplateService.updateTemplate(req.params.id, req.body);
    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await DocumentTemplateService.deleteTemplate(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/createDocument', authMiddleware, async (req, res) => {
  try {
    const { templateId, title } = req.body;
    const document = await DocumentTemplateService.createDocumentFromTemplate(req.user.id, templateId, title);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;