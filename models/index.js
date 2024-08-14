const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');

// Import model definitions
const UserModel = require('./User');
const DocumentModel = require('./Document');

// Initialize models
const User = UserModel(sequelize);
const Document = DocumentModel;

// Define associations
User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Document
};