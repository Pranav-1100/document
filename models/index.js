const User = require('./User');
const Document = require('./Document');

User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Document
};