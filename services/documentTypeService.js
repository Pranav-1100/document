const { DocumentType, Document, Op } = require('../models');

class DocumentTypeService {
  static async createDocumentType(name, description) {
    try {
      return await DocumentType.create({ name, description });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('A document type with this name already exists');
      }
      throw error;
    }
  }

  static async getAllDocumentTypes() {
    return await DocumentType.findAll({
      order: [['name', 'ASC']]
    });
  }

  static async getDocumentTypeById(id) {
    const documentType = await DocumentType.findByPk(id);
    if (!documentType) {
      throw new Error('Document type not found');
    }
    return documentType;
  }

  static async updateDocumentType(id, updates) {
    const documentType = await this.getDocumentTypeById(id);
    try {
      return await documentType.update(updates);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('A document type with this name already exists');
      }
      throw error;
    }
  }

  static async deleteDocumentType(id) {
    const documentType = await this.getDocumentTypeById(id);
    await documentType.destroy();
    return { message: 'Document type deleted successfully' };
  }

  static async getDocumentsByType(typeId) {
    const documentType = await this.getDocumentTypeById(typeId);
    return await Document.findAll({
      where: { typeId: documentType.id },
      order: [['createdAt', 'DESC']]
    });
  }

  static async searchDocumentTypes(query) {
    return await DocumentType.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['name', 'ASC']]
    });
  }

  static async getDocumentTypeStats() {
    const stats = await DocumentType.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('Documents.id')), 'documentCount']
      ],
      include: [{
        model: Document,
        attributes: []
      }],
      group: ['DocumentType.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Documents.id')), 'DESC']]
    });

    return stats.map(stat => ({
      id: stat.id,
      name: stat.name,
      documentCount: parseInt(stat.get('documentCount'))
    }));
  }

  static async bulkCreateDocumentTypes(typesData) {
    try {
      return await DocumentType.bulkCreate(typesData, { validate: true });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('One or more document type names already exist');
      }
      throw error;
    }
  }

  static async getOrCreateDocumentType(name, description = '') {
    const [documentType, created] = await DocumentType.findOrCreate({
      where: { name },
      defaults: { description }
    });
    return { documentType, created };
  }

  static async isDocumentTypeUsed(id) {
    const count = await Document.count({ where: { typeId: id } });
    return count > 0;
  }
}

module.exports = DocumentTypeService;