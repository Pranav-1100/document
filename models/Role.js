const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, { through: 'UserRoles' });
  };

  return Role;
};