const { DocumentTemplate, User } = require('../models');

class DocumentTemplateService {
  static async createTemplate(userId, name, content, description) {
    return await DocumentTemplate.create({
      name,
      content,
      description,
      creatorId: userId
    });
  }

  static async getAllTemplates() {
    return await DocumentTemplate.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });
  }

  static async getTemplateById(id) {
    return await DocumentTemplate.findByPk(id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });
  }

  static async updateTemplate(id, updates) {
    const template = await DocumentTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    return await template.update(updates);
  }

  static async deleteTemplate(id) {
    const template = await DocumentTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    await template.destroy();
    return { message: 'Template deleted successfully' };
  }

  static async createDocumentFromTemplate(userId, templateId, title) {
    const template = await DocumentTemplate.findByPk(templateId);
    if (!template) throw new Error('Template not found');

    return await Document.create({
      title,
      content: template.content,
      userId
    });
  }
}

module.exports = DocumentTemplateService;