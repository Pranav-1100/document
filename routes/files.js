const express = require('express');
const multer = require('multer');
const FileService = require('../services/fileService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = await FileService.uploadFile(req.user.id, req.file);
    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const file = await FileService.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(file.path, file.name);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await FileService.deleteFile(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;