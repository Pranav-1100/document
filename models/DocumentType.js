const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DocumentType = sequelize.define('DocumentType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'document_types',
  timestamps: true
});

module.exports = DocumentType;