const express = require('express');
const SearchService = require('../services/searchService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const results = await SearchService.search(query, req.user.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;