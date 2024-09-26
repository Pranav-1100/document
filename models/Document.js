const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  typeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  embedding: {
    type: DataTypes.TEXT,  // Store embedding as JSON string
    allowNull: true
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;