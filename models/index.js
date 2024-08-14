const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/db');

// Import model definitions
const UserModel = require('./User');
const DocumentModel = require('./Document');
const ConversationModel = require('./Conversation');
const MessageModel = require('./Message');
const DocumentTypeModel = require('./DocumentType');
const TagModel = require('./Tag');

// Initialize models
const User = UserModel(sequelize);
const Document = DocumentModel;
const Conversation = ConversationModel;
const Message = MessageModel;
const DocumentType = DocumentTypeModel;
const Tag = TagModel;

// Define associations
User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Conversation, { foreignKey: 'ownerId' });
Conversation.belongsTo(User, { foreignKey: 'ownerId' });

User.hasMany(Message, { foreignKey: 'authorId' });
Message.belongsTo(User, { foreignKey: 'authorId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

DocumentType.hasMany(Document, { foreignKey: 'typeId' });
Document.belongsTo(DocumentType, { foreignKey: 'typeId' });

// Many-to-Many relationship between Document and Tag
Document.belongsToMany(Tag, { through: 'DocumentTags' });
Tag.belongsToMany(Document, { through: 'DocumentTags' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Document,
  Conversation,
  Message,
  DocumentType,
  Tag
};