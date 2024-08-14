module.exports = (sequelize, DataTypes) => {
    const DocumentTemplate = sequelize.define('DocumentTemplate', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      description: DataTypes.TEXT
    });
  
    DocumentTemplate.associate = (models) => {
      DocumentTemplate.belongsTo(models.User, { as: 'creator' });
    };
  
    return DocumentTemplate;
  };