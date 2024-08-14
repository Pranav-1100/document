const { Role, User } = require('../models');

class RoleService {
  static async createRole(name) {
    return await Role.create({ name });
  }

  static async assignRoleToUser(userId, roleId) {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    await user.addRole(role);
    return user;
  }

  static async getUserRoles(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Role }]
    });
    return user.Roles;
  }
}

module.exports = RoleService;