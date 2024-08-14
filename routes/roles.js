const express = require('express');
const RoleService = require('../services/roleService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const role = await RoleService.createRole(name);
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/assign', authMiddleware, async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const user = await RoleService.assignRoleToUser(userId, roleId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const roles = await RoleService.getUserRoles(req.params.userId);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;